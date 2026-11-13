import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHighlighter } from "shiki";
import { shouldBackup } from "../src/docs/backup.ts";
import { chapterId, chapterSlug, englishGap } from "../src/docs/edition.ts";
import { parseFenceInfo } from "../src/docs/fence.ts";
import { DOC_LANG_TO_RUNTIME, resolveRuntime } from "../src/docs/runtime.ts";
import { collapseShikiLines } from "../src/docs/text.ts";
import { highlight } from "../scripts/docs/render.ts";
import { darkTheme, lightTheme } from "../scripts/docs/themes.ts";

describe("parseFenceInfo", () => {
  it("parses quoted, escaped, and unknown attributes", () => {
    const parsed = parseFenceInfo('python run stdin="Ada\\n42" expect="你好，Ada！" title="问候" foo=bar extra="a\\"b"');
    assert.equal(parsed.lang, "python");
    assert.equal(parsed.attrs.runnable, true);
    assert.equal(parsed.attrs.stdin, "Ada\n42");
    assert.equal(parsed.attrs.expect, "你好，Ada！");
    assert.equal(parsed.attrs.title, "问候");
    assert.equal(parsed.attrs.eof, true);
    assert.equal(parsed.extra.foo, "bar");
    assert.equal(parsed.extra.extra, 'a"b');
  });

  it("defaults runnable languages to run and disables norun / unknown / multi-file", () => {
    assert.equal(parseFenceInfo("go").attrs.runnable, true);
    assert.equal(parseFenceInfo("python norun").attrs.runnable, false);
    assert.equal(parseFenceInfo("python norun").attrs.reason, "仅供阅读");
    assert.equal(parseFenceInfo("python norun", "en").attrs.reason, "For reading only");
    assert.equal(parseFenceInfo("text").attrs.runnable, false);
    assert.equal(parseFenceInfo("").attrs.runnable, false);
    assert.equal(parseFenceInfo('c file="util.h" group="ex3"').attrs.runnable, false);
    assert.match(parseFenceInfo('c file="a.h"').attrs.reason ?? "", /本地/);
    assert.equal(parseFenceInfo('python eof="false"').attrs.eof, false);
    assert.equal(parseFenceInfo("python exit=1").attrs.exit, 1);
    assert.equal(parseFenceInfo("c++").lang, "c++");
    assert.equal(parseFenceInfo("c++").attrs.runnable, true);
  });
});

describe("english edition", () => {
  it("shows the placeholder only when an English book or chapter is missing", () => {
    assert.equal(englishGap({ edition: "zh", slugs: [], viewingChapter: false }), null);
    assert.equal(englishGap({ edition: "en", slugs: [], viewingChapter: false }), "book");
    assert.equal(englishGap({ edition: "en", slugs: ["index"], slug: "03-strings", viewingChapter: true }), "chapter");
    assert.equal(englishGap({ edition: "en", slugs: ["index", "03-strings"], slug: "03-strings", viewingChapter: true }), null);
    assert.equal(chapterId("python", "index", "en"), "en/python/index");
    assert.equal(chapterSlug("en/python/01-hello"), "01-hello");
    assert.equal(chapterSlug("dl/chapter_preface/index"), "chapter_preface/index");
    assert.equal(chapterSlug("en/dl/chapter_preface/index"), "chapter_preface/index");
    assert.equal(chapterId("dl", "chapter_preface/index", "en"), "en/dl/chapter_preface/index");
  });
});

describe("resolveRuntime", () => {
  it("maps every documented alias and rejects unknown languages", () => {
    const cases: [string, string][] = [
      ["python", "python"],
      ["py", "python"],
      ["ruby", "ruby"],
      ["rb", "ruby"],
      ["js", "quickjs"],
      ["javascript", "quickjs"],
      ["ts", "quickjs"],
      ["typescript", "quickjs"],
      ["sql", "sqlite"],
      ["sqlite", "sqlite"],
      ["c", "clang"],
      ["cpp", "clangpp"],
      ["c++", "clangpp"],
      ["php", "php-cgi"],
      ["lua", "lua"],
      ["go", "go"],
      ["sh", "shell"],
      ["shell", "shell"],
      ["bash", "shell"],
      ["rust", "rust"],
      ["rs", "rust"],
      ["java", "java"],
      ["linux", "linux"],
      ["numpy", "numpy"],
      ["np", "numpy"],
    ];
    for (const [alias, runtime] of cases) assert.equal(resolveRuntime(alias), runtime);
    assert.equal(resolveRuntime("Py"), "python");
    assert.equal(resolveRuntime("zig"), undefined);
    assert.equal(resolveRuntime(""), undefined);
    assert.equal(Object.keys(DOC_LANG_TO_RUNTIME).length, cases.length);
  });
});

describe("shouldBackup", () => {
  it("skips empty, identical, and untouched doc writes", () => {
    assert.equal(shouldBackup("", "print(1)", undefined), false);
    assert.equal(shouldBackup("   ", "print(1)", undefined), false);
    assert.equal(shouldBackup("print(1)", "print(1)", undefined), false);
    assert.equal(shouldBackup("print(1)", "print(2)", { code: "print(1)" }), false);
    assert.equal(shouldBackup("user", "print(2)", { code: "print(1)" }), true);
    assert.equal(shouldBackup("user", "print(2)", undefined), true);
  });
});

describe("collapseShikiLines", () => {
  it("drops separators between line spans and keeps empty lines", () => {
    const html = '<span class="line">a</span>\n<span class="line"></span>\n<span class="line">  </span>\n<span class="line">b</span>';
    const out = collapseShikiLines(html);
    assert.equal(out.includes("\n"), false);
    assert.equal((out.match(/class="line"/g) ?? []).length, 4);
  });
});

describe("highlight", () => {
  it("renders one line span per source line, including a blank line", async () => {
    const code = ["package main", "", "func main() {", "\tch := 1", "\tfmt.Println(ch)", "}"].join("\n");
    const highlighter = await createHighlighter({ themes: [lightTheme, darkTheme], langs: ["go"] });
    const html = highlight(highlighter, "go", code);
    assert.equal((html.match(/class="line"/g) ?? []).length, code.split("\n").length);
    assert.equal(html.includes("\n"), false);
    assert.match(html, /<span class="line"><\/span>/);
  });
});
