import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { listBookMarkdown } from "../scripts/docs/book-files.mjs";
import { createHash } from "node:crypto";
import { DL_EN_COMMIT, DL_LANDED_PHASE, DL_SAMPLE_BUDGET_BYTES, DL_TOC, DL_ZH_COMMIT, dlChapterNumber } from "../scripts/docs/dl-toc.ts";
import { pyodideBookErrors } from "../scripts/docs/pyodide-books.ts";
import { languages } from "../scripts/languages.config.mjs";
import { chapterSlug } from "../src/docs/edition.ts";
import { canonicalRuntime, resolveRuntime, runtimeForFence, runtimeFromHash } from "../src/docs/runtime.ts";

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

describe("numpy sidebar split", () => {
  it("keeps each Pyodide book in its own drawer", () => {
    assert.deepEqual(pyodideBookErrors(), []);
    assert.equal(runtimeForFence("numpy", "numpy"), "np");
    assert.equal(runtimeForFence("np", "numpy"), "np");
    assert.equal(runtimeForFence("numpy", "dl"), "dl");
    assert.equal(runtimeForFence("numpy"), "dl");
    assert.equal(resolveRuntime("numpy"), "dl");
    assert.equal(canonicalRuntime("numpy"), "dl");
    assert.equal(runtimeFromHash("#numpy"), "dl");
    const leet = readFileSync("src/docs/leetcode.ts", "utf8");
    const match = leet.match(/export const LEETCODE_RUNTIMES = \[([^\]]+)\]/);
    assert.ok(match);
    const ids = [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
    assert.equal(ids.includes("np"), false);
    assert.equal(ids.includes("dl"), false);
    assert.equal(ids.includes("numpy"), false);
  });

  it("shares one Pyodide asset list and does not nest the books", () => {
    const dl = languages.find((lang) => lang.id === "dl");
    assert.equal(languages.some((lang) => lang.id === "numpy"), false);
    const np = languages.find((lang) => lang.id === "np");
    assert.ok(dl && np);
    assert.equal(dl.compiler, "pyodide");
    assert.equal(np.compiler, "pyodide");
    assert.equal(dl.label, "DeepLearning");
    assert.equal(np.label, "NumPy");
    assert.deepEqual(np.assets, dl.assets);
    assert.equal(new Set(np.assets).size, dl.assets.length);
    const numpyNames = listBookMarkdown("docs/numpy");
    const dlNames = listBookMarkdown("docs/dl");
    for (const name of numpyNames) assert.equal(dlNames.includes(name), false, name);
    for (const name of dlNames) assert.equal(name.startsWith("chapter_"), true, name);
  });
});

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
    assert.equal(DL_LANDED_PHASE, 8);
    const phase8 = DL_TOC.filter((section) => section.phase === 8);
    assert.equal(phase8.length, 15);
    assert.equal(phase8.filter((section) => section.path.startsWith("chapter_computational-performance/")).length, 8);
    assert.equal(phase8.filter((section) => section.path.startsWith("chapter_appendix-tools-for-deep-learning/")).length, 7);
    const phase7 = DL_TOC.filter((section) => section.phase === 7);
    assert.equal(phase7.length, 19);
    assert.equal(phase7.filter((section) => section.path.startsWith("chapter_natural-language-processing-pretraining/")).length, 11);
    assert.equal(phase7.filter((section) => section.path.startsWith("chapter_natural-language-processing-applications/")).length, 8);
    const phase6 = DL_TOC.filter((section) => section.phase === 6);
    assert.equal(phase6.length, 15);
    assert.equal(phase6.filter((section) => section.path.startsWith("chapter_computer-vision/")).length, 15);
    const phase5 = DL_TOC.filter((section) => section.phase === 5);
    assert.equal(phase5.length, 25);
    assert.equal(phase5.filter((section) => section.path.startsWith("chapter_recurrent-neural-networks/")).length, 8);
    assert.equal(phase5.filter((section) => section.path.startsWith("chapter_recurrent-modern/")).length, 9);
    assert.equal(phase5.filter((section) => section.path.startsWith("chapter_attention-mechanisms/")).length, 8);
    const phase4 = DL_TOC.filter((section) => section.phase === 4);
    assert.equal(phase4.length, 22);
    assert.equal(phase4.filter((section) => section.path.startsWith("chapter_convolutional-neural-networks/")).length, 7);
    assert.equal(phase4.filter((section) => section.path.startsWith("chapter_convolutional-modern/")).length, 8);
    assert.equal(phase4.filter((section) => section.path.startsWith("chapter_deep-learning-computation/")).length, 7);
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
    const names = ["fashion-mnist.bin", "house-tiny.csv", "airfoil-tiny.csv", "timemachine.txt", "fra-eng.txt"] as const;
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

  it("keeps phase 4 training loops at four steps", () => {
    const train = new Set([
      "chapter_convolutional-neural-networks/lenet.md",
      "chapter_convolutional-modern/alexnet.md",
      "chapter_convolutional-modern/vgg.md",
      "chapter_convolutional-modern/nin.md",
      "chapter_convolutional-modern/googlenet.md",
      "chapter_convolutional-modern/batch-norm.md",
      "chapter_convolutional-modern/resnet.md",
      "chapter_convolutional-modern/densenet.md",
    ]);
    for (const path of DL_TOC.filter((section) => section.phase === 4).map((section) => section.path)) {
      const text = readFileSync(join("docs/dl", path), "utf8");
      const widths = [...text.matchAll(/\brange\((\d+)\)/g)].map((match) => Number(match[1]));
      assert.ok(widths.every((width) => width <= 4), `${path} ${widths.join(",")}`);
      if (train.has(path)) assert.ok(widths.includes(4), path);
    }
  });

  it("keeps phase 5 training loops at four steps", () => {
    const train = new Set([
      "chapter_recurrent-neural-networks/rnn-scratch.md",
      "chapter_recurrent-neural-networks/rnn-concise.md",
      "chapter_recurrent-modern/gru.md",
      "chapter_recurrent-modern/lstm.md",
      "chapter_recurrent-modern/deep-rnn.md",
      "chapter_recurrent-modern/bi-rnn.md",
      "chapter_recurrent-modern/seq2seq.md",
      "chapter_attention-mechanisms/bahdanau-attention.md",
      "chapter_attention-mechanisms/transformer.md",
    ]);
    for (const path of DL_TOC.filter((section) => section.phase === 5).map((section) => section.path)) {
      const text = readFileSync(join("docs/dl", path), "utf8");
      const widths = [...text.matchAll(/\brange\((\d+)\)/g)].map((match) => Number(match[1]));
      assert.ok(widths.every((width) => width <= 4), `${path} ${widths.join(",")}`);
      if (train.has(path)) assert.ok(widths.includes(4), path);
    }
  });

  it("keeps phase 6 training loops at four steps", () => {
    const train = new Set([
      "chapter_computer-vision/fine-tuning.md",
      "chapter_computer-vision/ssd.md",
      "chapter_computer-vision/rcnn.md",
      "chapter_computer-vision/fcn.md",
      "chapter_computer-vision/neural-style.md",
      "chapter_computer-vision/kaggle-cifar10.md",
      "chapter_computer-vision/kaggle-dog.md",
    ]);
    for (const path of DL_TOC.filter((section) => section.phase === 6).map((section) => section.path)) {
      const text = readFileSync(join("docs/dl", path), "utf8");
      const widths = [...text.matchAll(/\brange\((\d+)\)/g)].map((match) => Number(match[1]));
      assert.ok(widths.every((width) => width <= 4), `${path} ${widths.join(",")}`);
      if (train.has(path)) assert.ok(widths.includes(4), path);
    }
  });

  it("keeps phase 7 training loops at four steps", () => {
    const train = new Set([
      "chapter_natural-language-processing-pretraining/word2vec-pretraining.md",
      "chapter_natural-language-processing-pretraining/glove.md",
      "chapter_natural-language-processing-pretraining/similarity-analogy.md",
      "chapter_natural-language-processing-pretraining/bert-pretraining.md",
      "chapter_natural-language-processing-applications/sentiment-analysis-rnn.md",
      "chapter_natural-language-processing-applications/sentiment-analysis-cnn.md",
      "chapter_natural-language-processing-applications/natural-language-inference-attention.md",
      "chapter_natural-language-processing-applications/finetuning-bert.md",
      "chapter_natural-language-processing-applications/natural-language-inference-bert.md",
    ]);
    for (const path of DL_TOC.filter((section) => section.phase === 7).map((section) => section.path)) {
      const text = readFileSync(join("docs/dl", path), "utf8");
      const widths = [...text.matchAll(/\brange\((\d+)\)/g)].map((match) => Number(match[1]));
      assert.ok(widths.every((width) => width <= 4), `${path} ${widths.join(",")}`);
      if (train.has(path)) assert.ok(widths.includes(4), path);
    }
  });

  it("keeps phase 8 pages read-only", () => {
    for (const path of DL_TOC.filter((section) => section.phase === 8).map((section) => section.path)) {
      const text = readFileSync(join("docs/dl", path), "utf8");
      assert.equal(text.includes("```numpy run"), false, path);
      assert.ok((text.match(/```numpy norun/g) ?? []).length >= 2, path);
      assert.equal(text.includes("range("), false, path);
    }
  });
});
