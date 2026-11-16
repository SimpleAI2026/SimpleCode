import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { beforeEach, describe, it } from "node:test";
import { en, zh, type MessageKey } from "../src/i18n/messages.ts";
import { LOCALE_KEY, hydrateLocale, locale, setLocale, t } from "../src/i18n/index.ts";

const mem = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, String(value));
    },
    removeItem: (key: string) => {
      mem.delete(key);
    },
    clear: () => mem.clear(),
    key: () => null,
    length: 0,
  },
});

const NAMES = ["Python", "Ruby", "JS/TS", "SQLite", "C++", "PHP", "Lua", "Go", "Shell", "Rust", "Java", "Linux"];

describe("i18n catalog", () => {
  beforeEach(() => {
    mem.clear();
    setLocale("zh");
  });

  it("gives every Chinese key a non-empty English string", () => {
    const keys = Object.keys(zh) as MessageKey[];
    assert.deepEqual(Object.keys(en).sort(), keys.sort());
    for (const key of keys) {
      assert.equal(typeof en[key], "string");
      assert.ok(en[key].trim().length > 0, key);
    }
  });

  it("defaults to Chinese and persists English", () => {
    assert.equal(locale.value, "zh");
    assert.equal(t("quickStartNamed", { label: "Python" }), "Python 快速入门");
    assert.equal(t("backToc"), "返回目录");
    setLocale("en");
    assert.equal(localStorage.getItem(LOCALE_KEY), "en");
    assert.equal(t("aboutTitle"), "About SimpleCode");
    assert.equal(t("quickStartNamed", { label: "Python" }), "Python Quick Start");
    assert.equal(t("viewChinese"), "View the Chinese version");
    assert.equal(t("enPlaceholderTitle"), "English Quick Start is under construction");
    setLocale("zh");
    mem.set(LOCALE_KEY, "en");
    hydrateLocale();
    assert.equal(locale.value, "en");
    hydrateLocale();
    mem.delete(LOCALE_KEY);
    hydrateLocale();
    assert.equal(locale.value, "zh");
  });

  it("lists every sidebar language in the about copy", () => {
    for (const name of NAMES) {
      assert.ok(zh.aboutLanguages.includes(name), name);
      assert.ok(en.aboutLanguages.includes(name), name);
    }
    assert.match(zh.aboutLanguages, /、C、/);
    assert.match(en.aboutLanguages, /, C,/);
    assert.match(zh.aboutWasm, /Cache API/);
    assert.match(en.aboutEditor, /Monaco/);
    assert.match(zh.aboutLanguages, /十五种语言/);
    assert.match(en.aboutLanguages, /Fifteen languages/);
    assert.match(zh.aboutLanguages, /NumPy/);
    assert.match(en.aboutLanguages, /NumPy/);
    assert.match(zh.aboutLanguages, /DeepLearning/);
    assert.match(en.aboutLanguages, /DeepLearning/);
    assert.equal(zh.langNumpy, "DeepLearning");
    assert.equal(en.langNumpy, "DeepLearning");
    assert.equal(zh.langNp, "NumPy");
    assert.equal(en.langNp, "NumPy");
    assert.equal(zh.bookDl, "DeepLearning");
    assert.equal(en.bookDl, "DeepLearning");
    assert.match(zh.aboutBooks, /快速入门/);
    assert.match(en.aboutBooks, /Quick Start/);
  });

  it("puts the GitHub repository link in the about dialog", () => {
    assert.equal(zh.aboutRepo, "GitHub 仓库");
    assert.equal(en.aboutRepo, "GitHub repository");
    const src = readFileSync(new URL("../src/components/AboutDialog.vue", import.meta.url), "utf8");
    assert.match(src, /const repoUrl = "https:\/\/github\.com\/linkxzhou\/SimpleCode"/);
    assert.match(src, /data-testid="about-repo"/);
    assert.match(src, /:href="repoUrl"/);
    assert.match(src, /target="_blank"/);
    assert.match(src, /rel="noopener noreferrer"/);
    assert.match(src, /<Github/);
    assert.match(src, /t\("aboutRepo"\)/);
  });

  it("tells a missing Java file apart from a real digest mismatch", () => {
    const missing = t("javaMissing", { file: "compiler.wasm" });
    assert.match(missing, /找不到 compiler\.wasm/);
    assert.match(missing, /\.\/build\.sh vendor --java/);
    assert.match(missing, /\.\/build\.sh build/);
    assert.doesNotMatch(missing, /不一致/);
    assert.match(t("javaDigest", { file: "compiler.wasm", expected: 4294850, got: 4294850, sha: "abc" }), /期望 4294850 字节，得到 4294850 字节/);
    assert.match(t("javaDigest", { file: "compiler.wasm", expected: 4294850, got: 4294850, sha: "abc" }), /sha256 abc/);
    const short = t("javaShort", { file: "compiler.wasm", expected: 4294850, got: 0, sha: "e3b0" });
    assert.match(short, /下载不完整/);
    assert.match(short, /得到 0 字节，期望 4294850 字节/);
    assert.match(short, /sha256 e3b0/);
    assert.doesNotMatch(short, /不一致/);
    assert.match(t("assetMissing", { file: "v86.wasm" }), /找不到 v86\.wasm/);
    assert.match(t("manifestMissing", { detail: "html" }), /html/);
    assert.match(t("sizeMismatch", { file: "compiler.wasm", expected: 4, actual: 0, sha: "e3b0" }), /实际 0/);
    setLocale("en");
    assert.match(t("javaMissing", { file: "compiler.wasm" }), /compiler\.wasm was not found/);
    assert.match(t("javaMissing", { file: "compiler.wasm" }), /vendor --java/);
    assert.match(t("javaDigest", { file: "compiler.wasm", expected: 10, got: 10, sha: "abc" }), /expected 10 bytes, got 10/);
    assert.match(t("javaShort", { file: "compiler.wasm", expected: 10, got: 0, sha: "e3b0" }), /incomplete \(got 0 bytes, expected 10/);
    assert.match(t("rustDigest", { kind: "rustc", expected: 3, got: 3, sha: "abc" }), /expected 3 bytes, got 3/);
    assert.match(t("rustShort", { kind: "rustc", expected: 3, got: 1, sha: "abc" }), /incomplete \(got 1 bytes, expected 3/);
    assert.match(t("rustMissing", { kind: "rustc", file: "/wasm/rust/rustc.wasm" }), /wasm\/rust\/rustc\.wasm was not found/);
    assert.match(t("rustMissing", { kind: "rustc", file: "/wasm/rust/rustc.wasm" }), /wasm\/rust/);
    assert.match(t("assetMissing", { file: "linux.wasm" }), /linux\.wasm was not found/);
  });
});

describe("wasm progress placement", () => {
  it("anchors the download bar to the bottom edge of the language button", () => {
    const src = readFileSync(new URL("../src/components/LanguageItem.vue", import.meta.url), "utf8");
    assert.match(src, /data-testid="wasm-progress"[\s\S]{0,240}inset-x-0 bottom-0/);
    assert.doesNotMatch(src, /my-\[8px\]/);
    assert.doesNotMatch(src, /wasm-progress"[\s\S]{0,240}inset-x-2/);
  });
});
