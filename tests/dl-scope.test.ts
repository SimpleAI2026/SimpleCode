import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { listBookMarkdown } from "../scripts/docs/book-files.mjs";
import { createHash } from "node:crypto";
import { DL_EN_COMMIT, DL_LANDED_PHASE, DL_SAMPLE_BUDGET_BYTES, DL_TOC, DL_ZH_COMMIT, dlChapterNumber } from "../scripts/docs/dl-toc.ts";
import { chapterSlug } from "../src/docs/edition.ts";

const PHASE2 = [
  "chapter_preface/index.md",
  "chapter_installation/index.md",
  "chapter_notation/index.md",
  "chapter_introduction/index.md",
];

function sourceMap(text: string) {
  const sources = new Map<string, { license?: string; adapt?: boolean }>();
  let cur: string | undefined;
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const top = /^([A-Za-z0-9_-]+):\s*$/.exec(line);
    if (top && !line.startsWith(" ")) {
      cur = top[1];
      sources.set(cur, {});
      continue;
    }
    const kv = /^\s{2}([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!kv || !cur) continue;
    const value = kv[2].trim();
    const row = sources.get(cur)!;
    if (kv[1] === "license") row.license = value;
    if (kv[1] === "adapt") row.adapt = value === "true";
  }
  return sources;
}

function walkNames(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkNames(full, out);
    else out.push(name);
  }
  return out;
}

describe("d2l source registration", () => {
  const sources = sourceMap(readFileSync("docs/sources.yaml", "utf8"));

  it("drops the Apache-2.0 d2l-zh id and records link-only text", () => {
    assert.equal(sources.has("d2l-zh"), false);
    assert.deepEqual(sources.get("d2l-zh-text"), { license: "CC-BY-SA-4.0", adapt: false });
    assert.deepEqual(sources.get("d2l-en-text"), { license: "CC-BY-SA-4.0", adapt: false });
    assert.deepEqual(sources.get("d2l-code"), { license: "MIT-0", adapt: true });
    assert.deepEqual(sources.get("d2l-en-sample-code"), { license: "Amazon-modified-MIT-2019", adapt: true });
    assert.equal(DL_ZH_COMMIT, "e6b18ccea71451a55fcd861d7b96fddf2587b09a");
    assert.equal(DL_EN_COMMIT, "23d7a5aecceee57d1292c56e90cce307f183bb0a");
    const notice = readFileSync("LICENSES/THIRD_PARTY.md", "utf8");
    assert.match(notice, /MIT-0/);
    assert.match(notice, /Amazon\.com, Inc\. or its affiliates/);
    assert.match(notice, new RegExp(DL_ZH_COMMIT));
    assert.equal(readFileSync("LICENSES/d2l-en-LICENSE-SAMPLECODE.txt", "utf8").includes("Copyright 2019 Amazon.com"), true);
  });
});

describe("d2l table of contents", () => {
  it("lists 139 sections in book order with the planned tiers", () => {
    assert.equal(DL_TOC.length, 139);
    assert.equal(DL_TOC.filter((section) => section.tier === "full").length, 49);
    assert.equal(DL_TOC.filter((section) => section.tier === "reduced").length, 55);
    assert.equal(DL_TOC.filter((section) => section.tier === "readonly").length, 35);
    assert.deepEqual(
      DL_TOC.filter((section) => section.phase === 2).map((section) => section.path),
      PHASE2,
    );
    assert.equal(dlChapterNumber("chapter_preface/index.md"), 0);
    assert.equal(dlChapterNumber("chapter_introduction/index.md"), 3);
    assert.equal(dlChapterNumber("chapter_appendix-tools-for-deep-learning/d2l.md"), 138);
    assert.equal(DL_LANDED_PHASE, 3);
    assert.equal(DL_SAMPLE_BUDGET_BYTES, 256 * 1024);
    const phase3 = DL_TOC.filter((section) => section.phase === 3);
    assert.equal(phase3.length, 39);
    assert.equal(phase3.filter((section) => section.path.startsWith("chapter_optimization/")).length, 12);
    assert.equal(phase3.filter((section) => section.path.startsWith("chapter_linear-networks/")).length, 8);
    assert.equal(chapterSlug("en/dl/chapter_notation/index"), "chapter_notation/index");
  });

  const landed = DL_TOC.filter((section) => section.phase <= DL_LANDED_PHASE).map((section) => section.path);

  for (const edition of ["docs/dl", "docs/en/dl"]) {
    it(`${edition} has the landed chapters and no share-alike notice`, () => {
      assert.deepEqual(listBookMarkdown(edition), [...landed].sort());
      for (const name of walkNames(edition)) {
        assert.equal(/^(license|notice)(\.|$)/i.test(name), false, name);
      }
      for (const path of landed) {
        const text = readFileSync(join(edition, path), "utf8");
        const chapter = Number(text.match(/^chapter:\s*(\d+)/m)?.[1]);
        assert.equal(chapter, dlChapterNumber(path));
        assert.match(text, /https:\/\/zh\.d2l\.ai\//);
        assert.match(text, /https:\/\/d2l\.ai\//);
        assert.equal(text.includes("改编自"), false);
        assert.match(text, /sources:\n(?:  - .+\n)*  - d2l-zh-text\n/);
        assert.match(text, /  - d2l-en-text\n/);
        assert.equal(text.includes("d2l-zh\n"), false);
        const tier = DL_TOC.find((section) => section.path === path)?.tier;
        if (tier === "readonly") {
          assert.equal(text.includes("```numpy run"), false, path);
          assert.ok((text.match(/```numpy norun/g) ?? []).length >= 2, path);
        } else {
          assert.ok((text.match(/```numpy run /g) ?? []).length >= 2, path);
        }
      }
    });
  }

  it("keeps phase 3 samples inside the 256 KiB budget", () => {
    const lock = JSON.parse(readFileSync("scripts/sources.lock.json", "utf8")).pyodide.files;
    const names = ["fashion-mnist.bin", "house-tiny.csv", "airfoil-tiny.csv"] as const;
    let total = 0;
    for (const name of names) {
      const pin = lock[name];
      const buf = readFileSync(join("wasm/pyodide", name));
      assert.equal(buf.length, pin.bytes, name);
      assert.equal(createHash("sha256").update(buf).digest("hex"), pin.sha256, name);
      total += buf.length;
    }
    assert.equal(lock["fashion-mnist.bin"].fashion.train, 32);
    assert.equal(lock["fashion-mnist.bin"].fashion.test, 8);
    assert.ok(total <= DL_SAMPLE_BUDGET_BYTES, String(total));
    assert.ok(total < 64 * 1024, String(total));
  });

  it("keeps phase 3 training loops at four steps", () => {
    const train = new Set([
      "chapter_linear-networks/linear-regression-scratch.md",
      "chapter_linear-networks/linear-regression-concise.md",
      "chapter_linear-networks/softmax-regression-scratch.md",
      "chapter_linear-networks/softmax-regression-concise.md",
      "chapter_multilayer-perceptrons/mlp-scratch.md",
      "chapter_multilayer-perceptrons/mlp-concise.md",
      "chapter_multilayer-perceptrons/underfit-overfit.md",
      "chapter_multilayer-perceptrons/weight-decay.md",
      "chapter_multilayer-perceptrons/environment.md",
      "chapter_multilayer-perceptrons/kaggle-house-price.md",
      "chapter_optimization/gd.md",
      "chapter_optimization/sgd.md",
      "chapter_optimization/minibatch-sgd.md",
      "chapter_optimization/momentum.md",
      "chapter_optimization/adagrad.md",
      "chapter_optimization/rmsprop.md",
      "chapter_optimization/adadelta.md",
      "chapter_optimization/adam.md",
      "chapter_optimization/lr-scheduler.md",
    ]);
    for (const path of DL_TOC.filter((section) => section.phase === 3).map((section) => section.path)) {
      const text = readFileSync(join("docs/dl", path), "utf8");
      const widths = [...text.matchAll(/\brange\((\d+)\)/g)].map((match) => Number(match[1]));
      assert.ok(widths.every((width) => width <= 4), `${path} ${widths.join(",")}`);
      if (train.has(path)) assert.ok(widths.includes(4), path);
    }
  });
});
