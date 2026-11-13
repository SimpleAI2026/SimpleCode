import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const BANNED = ["cdn.jsdelivr.net", "cdn.pyodide.org", "d2l-data.s3-accelerate.amazonaws.com"];

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

function textFiles(paths: string[]) {
  return paths.filter((path) => /\.(vue|ts|mjs|js|json|html|css|md)$/.test(path));
}

describe("pyodide runtime does not fetch a CDN", () => {
  it("keeps jsDelivr and the Pyodide CDN out of the page and the vendored runtime", () => {
    const files = textFiles([
      ...walk("src"),
      ...walk("public"),
      ...walk("wasm/pyodide").filter((path) => /\.(mjs|js|json|html)$/.test(path)),
    ]);
    if (existsSync("index.html")) files.push("index.html");
    const hits = files.filter((path) => {
      const text = readFileSync(path, "utf8");
      return BANNED.some((needle) => text.includes(needle));
    });
    assert.deepEqual(hits, []);
  });

  it("strips the upstream packageBaseUrl default while vendoring", () => {
    const script = readFileSync("scripts/vendor-pyodide.mjs", "utf8");
    assert.match(script, /cdn\.jsdelivr\.net\/pyodide/);
    assert.match(script, /packageBaseUrl/);
    const lock = JSON.parse(readFileSync("scripts/sources.lock.json", "utf8"));
    assert.equal(lock.pyodide.version, "314.0.7");
    assert.equal(lock.pyodide.files["pyodide.mjs"].bytes, 17883);
    assert.doesNotMatch(lock.pyodide.files["pyodide.mjs"].sha256, /^6f1d60f7/);
  });
});
