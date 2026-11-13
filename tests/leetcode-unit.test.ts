import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { codeOutsideComments } from "../src/docs/code-text.ts";

const ROOT = "docs/leetcode";
const EN = "docs/en/leetcode";
const NON_ASCII = /[^\x00-\x7F]/;
const HAN = /[\u4e00-\u9fff]/g;
const SOURCE_EXT = new Set(["py", "js", "go", "java", "rs", "c", "cpp", "lua", "rb"]);
const FILE_LANG: Record<string, string> = {
  "python.py": "python",
  "javascript.js": "javascript",
  "c.c": "c",
  "cpp.cpp": "cpp",
  "lua.lua": "lua",
  "go.go": "go",
  "rust.rs": "rust",
  "java.java": "java",
  "ruby.rb": "ruby",
};

interface IndexRow {
  id: number;
  slug: string;
  title: string;
  difficulty: string;
  tags: string[];
  lists: string[];
  tier: string;
  premium: boolean;
  langs: string[];
}

interface SolutionRef {
  file: string;
  sourceRepo: string;
  sourceUrl: string;
  sourceRevision: string;
  license: string;
  spdx: string;
  attribution: string;
  shareAlike: boolean;
  modifications: string[];
}

interface ProblemFile {
  id: number;
  slug: string;
  summary: string;
  samples: { stdin: string; stdout: string; note?: string }[];
  links: { cn: string; en: string };
  io: { kind: string; out: string };
  solutions: Record<string, SolutionRef>;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function pad(id: number) {
  return String(id).padStart(4, "0");
}

const zh = readJson<IndexRow[]>(join(ROOT, "index.json"));
const en = readJson<IndexRow[]>(join(EN, "index.json"));
const zhTags = readJson<Record<string, string>>(join(ROOT, "tags.json"));
const enTags = readJson<Record<string, string>>(join(EN, "tags.json"));
const lock = readJson<{
  readmeCount: number;
  catalogCount: number;
  withSolution: number;
  difficulty: { easy: number; medium: number; hard: number };
  keptWithoutReadme: number[];
  skipped: { dir: string }[];
}>(join(ROOT, "leetcode-go.lock.json"));

function problem(id: number) {
  return readJson<ProblemFile>(join(ROOT, "problems", pad(id), "problem.json"));
}

function english(id: number) {
  return readJson<{ id: number; summary: string; notes: string[] }>(join(EN, "problems", pad(id), "problem.json"));
}

describe("leetcode catalog", () => {
  it("lists the same problems in Chinese and English", () => {
    const ids = zh.map((row) => row.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(en.map((row) => row.id), ids);
    assert.equal(ids.length, lock.catalogCount);
    assert.equal(lock.readmeCount, 788);
    assert.equal(lock.catalogCount, 820);
    assert.equal(lock.withSolution, 200);
    assert.equal(zh.filter((row) => row.langs.includes("python")).length, 200);
    assert.equal(zh.filter((row) => row.langs.length === 0).length, lock.catalogCount - lock.withSolution);
    assert.equal(zh.filter((row) => row.difficulty === "easy").length, lock.difficulty.easy);
    assert.equal(zh.filter((row) => row.difficulty === "medium").length, lock.difficulty.medium);
    assert.equal(zh.filter((row) => row.difficulty === "hard").length, lock.difficulty.hard);
    assert.equal(lock.keptWithoutReadme.length, 32);
    assert.equal(lock.skipped.length, 10);
    assert.equal(zh.filter((row) => row.lists.includes("blind75")).length, 75);
    const tiers = new Set(zh.map((row) => row.tier));
    for (const tier of tiers) assert.ok(tier === "core" || tier === "extended");
    assert.ok(zh.filter((row) => row.tier === "extended").length <= 820);
    assert.deepEqual(Object.keys(enTags).sort(), Object.keys(zhTags).sort());
  });

  it("gives every problem titles, a difficulty, and a sample", () => {
    for (const row of zh) {
      const twin = en.find((item) => item.id === row.id)!;
      assert.ok(row.title.trim(), String(row.id));
      assert.ok(twin.title.trim(), String(row.id));
      assert.equal(NON_ASCII.test(twin.title), false, twin.title);
      assert.ok(["easy", "medium", "hard"].includes(row.difficulty));
      assert.equal(twin.difficulty, row.difficulty);
      assert.equal(twin.slug, row.slug);
      assert.equal(twin.tier, row.tier);
      assert.equal(twin.premium, row.premium);
      assert.deepEqual(twin.langs, row.langs);
      assert.deepEqual(twin.tags, row.tags);
      for (const tag of row.tags) {
        assert.ok(zhTags[tag], tag);
        assert.ok(enTags[tag], tag);
      }

      const body = problem(row.id);
      const copy = english(row.id);
      assert.equal(body.id, row.id);
      assert.equal(copy.id, row.id);
      const han = body.summary.match(HAN)?.length ?? 0;
      const words = copy.summary.trim().split(/\s+/).length;
      assert.ok(han >= 40 && han <= 480, `${row.id} han=${han}`);
      assert.ok(words >= 30 && words <= 170, `${row.id} words=${words}`);
      assert.equal(NON_ASCII.test(copy.summary), false, String(row.id));
      assert.ok(body.samples.length >= 1 && body.samples.length <= 3);
      assert.equal(copy.notes.length, body.samples.length);
      for (const sample of body.samples) {
        assert.equal(typeof sample.stdin, "string");
        assert.equal(typeof sample.stdout, "string");
        assert.equal(NON_ASCII.test(sample.stdin + sample.stdout), false);
      }
      assert.equal(new URL(body.links.cn).host, "leetcode.cn");
      assert.equal(new URL(body.links.en).host, "leetcode.com");
      assert.ok(body.links.cn.includes(row.slug));
      assert.ok(body.links.en.includes(row.slug));

      const langs = Object.keys(body.solutions);
      assert.deepEqual(row.langs, langs);
      const dir = join(ROOT, "problems", pad(row.id));
      const files = readdirSync(dir).filter((name) => name !== "problem.json");
      assert.deepEqual(files.sort(), langs.map((lang) => body.solutions[lang].file).sort());
      if (langs.length === 0) continue;
      for (const lang of langs) {
        const ref = body.solutions[lang];
        assert.ok(ref.attribution.trim());
        assert.ok(ref.sourceRepo.includes("/"));
        assert.equal(ref.sourceRevision.length, 40);
        assert.match(ref.sourceUrl, new RegExp(`/${ref.sourceRevision}/`));
        assert.ok(ref.modifications.length >= 1);
        const share = ref.license === "CC-BY-SA-4.0";
        assert.equal(ref.shareAlike, share);
        assert.equal(ref.spdx, ref.license);
        assert.ok(ref.license === "MIT" || ref.license === "CC-BY-SA-4.0");
        const text = readFileSync(join(dir, ref.file), "utf8");
        assert.match(text, new RegExp(`SPDX-License-Identifier: ${ref.spdx}`));
        assert.match(text, /^# Source: https:\/\/github\.com\//m);
        assert.ok(text.includes(ref.sourceRevision));
        if (share) {
          assert.match(text, /https:\/\/creativecommons\.org\/licenses\/by-sa\/4\.0\//);
          assert.match(text, /Adaptations of this file must stay under CC BY-SA 4\.0/);
          assert.match(text, /contact@yanglibin\.info/);
        } else {
          assert.match(text, /docs\/leetcode\/LICENSES\/MIT\.txt/);
        }
        const outside = codeOutsideComments(FILE_LANG[ref.file] ?? "python", text);
        assert.equal(NON_ASCII.test(outside), false, `${row.id} ${outside.match(NON_ASCII)?.[0]}`);
      }
    }
  });

  it("keeps solution source files out of the English tree", () => {
    const walk = (dir: string): string[] => {
      if (!existsSync(dir)) return [];
      const found: string[] = [];
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) found.push(...walk(path));
        else found.push(path);
      }
      return found;
    };
    for (const path of walk(EN)) {
      const ext = path.split(".").pop() ?? "";
      assert.equal(SOURCE_EXT.has(ext), false, path);
    }
    assert.equal(existsSync(join(ROOT, "LICENSES/MIT.txt")), true);
    assert.equal(existsSync(join(ROOT, "LICENSES/CC-BY-SA-4.0.txt")), true);
    const sources = readFileSync(join(ROOT, "SOURCES.md"), "utf8");
    assert.match(sources, /本项目著作权归 GitHub 开源社区 Doocs 所有，商业转载请联系 @yanglbme 获得授权，非商业转载请注明出处。/);
  });

  it("runs every Python solution against its first sample", () => {
    const failures: string[] = [];
    for (const row of zh) {
      const body = problem(row.id);
      const ref = body.solutions.python;
      if (!ref) continue;
      const sample = body.samples[0];
      const run = spawnSync("python3", [join(ROOT, "problems", pad(row.id), ref.file)], {
        input: sample.stdin,
        encoding: "utf8",
        timeout: 15_000,
      });
      const got = (run.stdout ?? "").replace(/\n+$/, "");
      const want = sample.stdout.replace(/\n+$/, "");
      if (run.status !== 0 || got !== want) {
        failures.push(`${row.id} status=${run.status} got=${JSON.stringify(got.slice(0, 120))} want=${JSON.stringify(want.slice(0, 80))}`);
      }
    }
    assert.deepEqual(failures, []);
  });
});
