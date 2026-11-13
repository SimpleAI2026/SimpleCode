import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { listBookMarkdown } from "../scripts/docs/book-files.mjs";
import { codeOutsideComments, isProgrammingLang, splitCode } from "../src/docs/code-text.ts";

const BOOKS = ["python", "ruby", "js", "sqlite", "c", "cpp", "php", "lua", "go", "shell", "rust", "java", "linux", "numpy", "dl"];
const NON_ASCII = /[^\x00-\x7F]/;

function chapters(root: string) {
  const files: string[] = [];
  for (const book of BOOKS) {
    for (const name of listBookMarkdown(`${root}/${book}`)) {
      files.push(`${root}/${book}/${name}`);
    }
  }
  return files;
}

function fences(text: string) {
  const body = text.split("---").slice(2).join("---");
  const found: { lang: string; info: string; code: string }[] = [];
  const re = /```([^\n]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(body))) {
    found.push({
      lang: match[1].trim().split(/\s+/)[0]?.toLowerCase() ?? "",
      info: match[1],
      code: match[2],
    });
  }
  return found;
}

function attr(info: string, key: string) {
  const match = new RegExp(`\\b${key}="((?:\\\\.|[^"\\\\])*)"`).exec(info);
  return match?.[1];
}

describe("comment splitting", () => {
  it("keeps python strings and drops the hash comment", () => {
    const code = 'print("可见")  # 这一句才执行\n';
    assert.equal(codeOutsideComments("python", code), 'print("可见")  \n');
  });

  it("does not treat shell $# as a comment", () => {
    const code = "printf '%s\\n' $#\n";
    assert.equal(codeOutsideComments("sh", code), code);
  });

  it("drops a ruby block comment", () => {
    const code = '=begin\nputs "隐藏"\n=end\nputs "留下"\n';
    assert.equal(codeOutsideComments("ruby", code), '\nputs "留下"\n');
  });

  it("drops slash and block comments", () => {
    assert.equal(codeOutsideComments("cpp", "int price = 18; // 单价\n"), "int price = 18; \n");
    assert.equal(codeOutsideComments("rust", "let fare = 40 + /* 纸袋 */ 2;"), "let fare = 40 +  2;");
    assert.equal(codeOutsideComments("lua", '-- print("隐藏")\nprint("留下")\n'), '\nprint("留下")\n');
    assert.equal(codeOutsideComments("sql", "SELECT 1; -- 说明\n"), "SELECT 1; \n");
  });

  it("classifies every span", () => {
    const spans = splitCode("python", "# 注释\nprint(1)\n");
    assert.deepEqual(
      spans.map((span) => span.kind),
      ["comment", "code"],
    );
  });
});

describe("quick start code is ASCII outside comments", () => {
  for (const file of chapters("docs")) {
    it(file, () => {
      for (const fence of fences(readFileSync(file, "utf8"))) {
        if (!isProgrammingLang(fence.lang)) continue;
        const outside = codeOutsideComments(fence.lang, fence.code);
        assert.equal(NON_ASCII.test(outside), false, outside.match(NON_ASCII)?.[0]);
        for (const key of ["expect", "stdin"]) {
          const value = attr(fence.info, key);
          if (value) assert.equal(NON_ASCII.test(value), false, `${key} ${value}`);
        }
      }
    });
  }

  for (const file of chapters("docs/en")) {
    it(`${file} comments`, () => {
      for (const fence of fences(readFileSync(file, "utf8"))) {
        if (!isProgrammingLang(fence.lang)) continue;
        for (const span of splitCode(fence.lang, fence.code)) {
          if (span.kind === "comment") assert.equal(NON_ASCII.test(span.text), false, span.text);
        }
      }
    });
  }
});
