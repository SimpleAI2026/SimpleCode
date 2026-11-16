import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { codeOutsideComments } from "../src/docs/code-text.ts";
import { isUntouchedSample, sampleFor, sampleLocales } from "../src/samples/index.ts";

const LANG: Record<string, string> = {
  python: "python",
  ruby: "ruby",
  "quickjs:js": "js",
  "quickjs:ts": "ts",
  sqlite: "sql",
  clang: "c",
  clangpp: "cpp",
  "php-cgi": "php",
  lua: "lua",
  go: "go",
  rust: "rust",
  java: "java",
  shell: "sh",
  linux: "linux",
  dl: "numpy",
};

const NON_ASCII = /[^\x00-\x7F]/;

describe("default samples", () => {
  for (const id of Object.keys(sampleLocales)) {
    it(id, () => {
      const lang = LANG[id];
      const zh = sampleFor(id, "zh");
      const en = sampleFor(id, "en");
      assert.equal(codeOutsideComments(lang, zh), codeOutsideComments(lang, en));
      assert.equal(NON_ASCII.test(codeOutsideComments(lang, zh)), false);
      assert.equal(NON_ASCII.test(en), false);
      assert.notEqual(zh, en);
      assert.equal(isUntouchedSample(id, zh), true);
      assert.equal(isUntouchedSample(id, en), true);
      assert.equal(isUntouchedSample(id, `${zh}\nprint("edited")`), false);
    });
  }

  it("reuses the NumPy sample on the NumPy sidebar row", () => {
    assert.equal(sampleFor("np", "zh"), sampleFor("dl", "zh"));
    assert.equal(sampleFor("np", "en"), sampleFor("dl", "en"));
    assert.equal(sampleFor("numpy", "zh"), sampleFor("dl", "zh"));
    assert.equal(sampleFor("numpy", "en"), sampleFor("dl", "en"));
    assert.equal(isUntouchedSample("np", sampleFor("np", "en")), true);
  });
});
