#!/usr/bin/env node
// Download Pyodide 314, the NumPy wheel, and a Fashion-MNIST subset into wasm/pyodide/.
// The browser only reads those same-origin files. The jsDelivr URL is a build-time pin.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { refreshManifest } from "./write-manifest.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lock = JSON.parse(readFileSync(join(root, "scripts/sources.lock.json"), "utf8")).pyodide;
const outDir = join(root, "wasm/pyodide");
const CDN_DEFAULT = "e.packageBaseUrl??`https://cdn.jsdelivr.net/pyodide/v${U}/full/`";

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function matches(path, pin) {
  if (!existsSync(path)) return false;
  const buf = readFileSync(path);
  return buf.length === pin.bytes && sha256(buf) === pin.sha256;
}

async function download(url) {
  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  } catch (err) {
    const reason = err && err.name === "TimeoutError" ? "timed out after 120s" : (err && err.message) || String(err);
    fail(`download ${url} failed: ${reason}`);
  }
  if (!res.ok || !res.body) fail(`download ${url} failed: HTTP ${res.status}`);
  const chunks = [];
  for await (const chunk of res.body) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function stripCdn(buf) {
  const text = buf.toString("utf8");
  if (!text.includes(CDN_DEFAULT)) fail("pyodide.mjs no longer contains the pinned CDN default");
  const next = text.replace(CDN_DEFAULT, "e.packageBaseUrl");
  if (next.includes("jsdelivr")) fail("pyodide.mjs still names jsdelivr after the CDN default is removed");
  return Buffer.from(next);
}

function idxImages(buf, count) {
  const magic = buf.readUInt32BE(0);
  const rows = buf.readUInt32BE(8);
  const cols = buf.readUInt32BE(12);
  if (magic !== 2051 || rows !== 28 || cols !== 28) fail("fashion image archive is not 28x28 idx");
  return buf.subarray(16, 16 + count * 784);
}

function idxLabels(buf, count) {
  const magic = buf.readUInt32BE(0);
  if (magic !== 2049) fail("fashion label archive is not idx");
  return buf.subarray(8, 8 + count);
}

function lcg(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Fixed synthetic tables. Not slices of the Kaggle house CSV or the UCI airfoil file. */
export function syntheticCsv(kind) {
  if (kind === "house") {
    const rand = lcg(20261113);
    const cols = 36;
    const header = [];
    for (let i = 0; i < cols; i++) header.push(`f${String(i).padStart(2, "0")}`);
    header.push("price");
    const lines = [header.join(",")];
    for (let row = 0; row < 24; row++) {
      const values = [];
      for (let c = 0; c < cols; c++) values.push((rand() * 2 - 1).toFixed(6));
      const price = (0.4 * Number(values[0]) + 0.3 * Number(values[1]) + 1.5).toFixed(6);
      values.push(price);
      lines.push(values.join(","));
    }
    return Buffer.from(`${lines.join("\n")}\n`, "utf8");
  }
  if (kind === "airfoil") {
    const rand = lcg(20261114);
    const lines = ["freq,angle,chord,velocity,thickness,sound"];
    for (let row = 0; row < 32; row++) {
      const freq = (200 + rand() * 1800).toFixed(6);
      const angle = (rand() * 22).toFixed(6);
      const chord = (0.02 + rand() * 0.3).toFixed(6);
      const velocity = (15 + rand() * 55).toFixed(6);
      const thickness = (0.001 + rand() * 0.05).toFixed(6);
      const sound = (90 + rand() * 40).toFixed(6);
      lines.push([freq, angle, chord, velocity, thickness, sound].join(","));
    }
    return Buffer.from(`${lines.join("\n")}\n`, "utf8");
  }
  fail(`unknown synthetic table ${kind}`);
}

async function buildFashion(pin) {
  const parts = [];
  for (const source of pin.sources) {
    console.log(`↓ ${source.name}`);
    const gz = await download(source.url);
    if (gz.length !== source.bytes || sha256(gz) !== source.sha256) {
      fail(`${source.name} sha256 ${sha256(gz)} size ${gz.length}`);
    }
    parts.push(gunzipSync(gz));
  }
  const [trainImages, trainLabels, testImages, testLabels] = parts;
  const train = pin.train;
  const test = pin.test;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x314e4d46, 0);
  header.writeUInt32LE(train, 4);
  header.writeUInt32LE(test, 8);
  return Buffer.concat([
    header,
    idxImages(trainImages, train),
    idxLabels(trainLabels, train),
    idxImages(testImages, test),
    idxLabels(testLabels, test),
  ]);
}

async function main() {
mkdirSync(outDir, { recursive: true });

for (const [name, pin] of Object.entries(lock.files)) {
  const dest = join(outDir, name);
  if (matches(dest, pin)) {
    console.log(`✓ ${name} unchanged`);
    continue;
  }
  let buf;
  if (pin.fashion) {
    buf = await buildFashion(pin.fashion);
  } else if (pin.synthetic) {
    buf = syntheticCsv(pin.synthetic);
  } else {
    console.log(`↓ ${name}`);
    buf = await download(pin.upstream);
    if (pin.upstreamSha256 && (buf.length !== pin.upstreamBytes || sha256(buf) !== pin.upstreamSha256)) {
      fail(`${name} upstream sha256 ${sha256(buf)} size ${buf.length}`);
    }
    if (pin.stripCdn) buf = stripCdn(buf);
  }
  if (buf.length !== pin.bytes || sha256(buf) !== pin.sha256) {
    fail(`${name} sha256 ${sha256(buf)} size ${buf.length}, lock expects ${pin.sha256} ${pin.bytes}`);
  }
  writeFileSync(dest, buf);
  console.log(`✓ ${name} ${buf.length} ${pin.sha256.slice(0, 12)}`);
}

try {
  const manifest = refreshManifest(root);
  console.log(`✓ wrote wasm/manifest.json (${Object.keys(manifest.assets).length} assets)`);
} catch (err) {
  if (err && err.code === "MISSING_WASM") {
    console.log("✓ pyodide files ready; other wasm assets are still missing");
  } else {
    fail(err instanceof Error ? err.message : String(err));
  }
}
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) await main();
