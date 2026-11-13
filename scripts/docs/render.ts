import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import type { Token as MdToken } from "markdown-it";
import { createHighlighter, type Highlighter } from "shiki";
import { parseFenceInfo } from "../../src/docs/fence.ts";
import { BOOKS, SHIPPED_BOOKS, type BookId } from "../../src/docs/runtime.ts";
import { listBookMarkdown } from "./book-files.mjs";
import { DL_LANDED_PHASE, DL_TOC, dlChapterNumber } from "./dl-toc.ts";
import { isKnownDocsDir } from "./tree.ts";
import { collapseShikiLines, escapeHtml } from "../../src/docs/text.ts";
import type { BookIndex, ChapterDoc, ChapterMeta, CodeBlockData, SearchDoc, Segment } from "../../src/docs/types";
import { darkTheme, lightTheme } from "./themes.ts";

type MarkdownItLike = MarkdownIt;

interface _MarkdownItLikeUnused {
  block: { ruler: { before: (name: string, ruleName: string, fn: BlockRule) => void } };
  renderer: {
    rules: Record<string, ((tokens: Token[], idx: number, options: unknown, env: unknown, self: Renderer) => string) | undefined>;
    render: (tokens: Token[], options: unknown, env: unknown) => string;
  };
  options: unknown;
  parse: (src: string, env: unknown) => Token[];
  render: (src: string) => string;
}

interface Token {
  type: string;
  content: string;
  info: string;
  children?: Token[] | null;
  map?: [number, number] | null;
  attrGet: (name: string) => string | null;
  attrSet: (name: string, value: string) => void;
}

interface Renderer {
  renderToken: (tokens: Token[], idx: number, options: unknown) => string;
}

type BlockRule = (state: BlockState, startLine: number, endLine: number, silent: boolean) => boolean;

interface BlockState {
  src: string;
  bMarks: number[];
  eMarks: number[];
  tShift: number[];
  sCount: number[];
  blkIndent: number;
  parentType: string;
  lineMax: number;
  line: number;
  md: MarkdownItLike;
  push: (type: string, tag: string, nesting: number) => Token;
}

const LEVELS = new Set(["beginner", "intermediate", "advanced"]);
const CALLOUTS = ["tip", "note", "warning", "answer"] as const;
const SHIKI_LANG: Record<string, string> = {
  python: "python",
  py: "python",
  numpy: "python",
  np: "python",
  ruby: "ruby",
  rb: "ruby",
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  sql: "sql",
  sqlite: "sql",
  c: "c",
  cpp: "cpp",
  "c++": "cpp",
  php: "php",
  lua: "lua",
  go: "go",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  rust: "rust",
  rs: "rust",
  java: "java",
  linux: "bash",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  markdown: "markdown",
  html: "html",
};

export interface RenderedDocs {
  books: BookIndex[];
  booksEn: BookIndex[];
  searchDocs: SearchDoc[];
  searchDocsEn: SearchDoc[];
  chapters: Record<string, ChapterDoc>;
}

function parseSources(text: string): Record<string, { adapt?: boolean }> {
  const sources: Record<string, { adapt?: boolean }> = {};
  let cur: string | undefined;
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const top = /^([A-Za-z0-9_-]+):\s*$/.exec(line);
    if (top && !line.startsWith(" ")) {
      cur = top[1];
      sources[cur] = {};
      continue;
    }
    const kv = /^\s{2}([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv && cur) {
      const v = kv[2].trim();
      if (kv[1] === "adapt") sources[cur].adapt = v === "true";
    }
  }
  return sources;
}

function containerRule(name: string): BlockRule {
  return (state, startLine, endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    if (state.src.charAt(start) !== ":") return false;
    let pos = start + 1;
    while (pos <= max && state.src.charAt(pos) === ":") pos++;
    if (pos - start < 3) return false;
    const params = state.src.slice(pos, max).trim();
    if (params !== name && !params.startsWith(name + " ")) return false;
    if (silent) return true;

    let next = startLine;
    let autoClosed = false;
    for (;;) {
      next++;
      if (next >= endLine) break;
      const s = state.bMarks[next] + state.tShift[next];
      const e = state.eMarks[next];
      if (state.sCount[next] - state.blkIndent >= 4) continue;
      if (state.src.charAt(s) !== ":") continue;
      let p = s + 1;
      while (p <= e && state.src.charAt(p) === ":") p++;
      if (p - s < 3) continue;
      if (state.src.slice(p, e).trim() !== "") continue;
      autoClosed = true;
      break;
    }

    const oldParent = state.parentType;
    const oldMax = state.lineMax;
    state.parentType = "container";
    state.lineMax = next;
    const open = state.push(`container_${name}_open`, "div", 1);
    open.markup = ":::";
    open.block = true as unknown as Token["block"];
    open.info = params.slice(name.length).trim();
    open.map = [startLine, next];
    state.md.block.tokenize(state, startLine + 1, next);
    const close = state.push(`container_${name}_close`, "div", -1);
    close.markup = ":::";
    close.block = true as unknown as Token["block"];
    state.parentType = oldParent;
    state.lineMax = oldMax;
    state.line = next + (autoClosed ? 1 : 0);
    return true;
  };
}

function createMarkdown(): MarkdownItLike {
  const md = new MarkdownIt("commonmark", { html: true, linkify: true, typographer: false });
  for (const name of CALLOUTS) md.block.ruler.before("fence", `container_${name}`, containerRule(name));
  const prev = md.renderer.rules.link_open;
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const href = token.attrGet("href") ?? "";
    if (/^https?:/i.test(href)) {
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noopener noreferrer");
    }
    if (prev) return prev(tokens, idx, options, env, self);
    return self.renderToken(tokens, idx, options);
  };
  return md;
}

function walk(md: MarkdownItLike, tokens: Token[], start: number, end: number, chapterId: string, counter: { n: number }, edition: "zh" | "en"): Segment[] {
  const segs: Segment[] = [];
  const buf: Token[] = [];
  const flush = () => {
    if (!buf.length) return;
    const html = md.renderer.render(buf, md.options, {}).trim();
    buf.length = 0;
    if (html) segs.push({ type: "html", html });
  };
  let i = start;
  while (i < end) {
    const t = tokens[i];
    const callout = CALLOUTS.find((name) => t.type === `container_${name}_open`);
    if (callout) {
      flush();
      const closeType = `container_${callout}_close`;
      let depth = 1;
      let j = i + 1;
      while (j < end && depth > 0) {
        if (tokens[j].type === t.type) depth++;
        else if (tokens[j].type === closeType) depth--;
        if (depth > 0) j++;
      }
      const inner = walk(md, tokens, i + 1, j, chapterId, counter, edition);
      if (callout === "answer") segs.push({ type: "answer", title: t.info || (edition === "en" ? "Answer" : "参考答案"), segments: inner });
      else segs.push({ type: "callout", kind: callout, segments: inner });
      i = j + 1;
      continue;
    }
    if (t.type === "fence") {
      flush();
      const parsed = parseFenceInfo(t.info || "", edition);
      const code = t.content.replace(/\n$/, "");
      const id = `${chapterId}#${counter.n++}`;
      const block: CodeBlockData = {
        id,
        lang: parsed.lang || "text",
        code,
        html: "",
        runnable: parsed.attrs.runnable,
        stdin: parsed.attrs.stdin,
        expect: parsed.attrs.expect,
        title: parsed.attrs.title,
        file: parsed.attrs.file,
        group: parsed.attrs.group,
        eof: parsed.attrs.eof,
        smoke: parsed.attrs.smoke,
        exit: parsed.attrs.exit,
        reason: parsed.attrs.reason,
      };
      segs.push({ type: "code", block });
      i++;
      continue;
    }
    buf.push(t);
    i++;
  }
  flush();
  return segs;
}

async function highlightAll(highlighter: Highlighter, segs: Segment[]) {
  for (const seg of segs) {
    if (seg.type === "code") seg.block.html = highlight(highlighter, seg.block.lang, seg.block.code);
    else if (seg.type !== "html") await highlightAll(highlighter, seg.segments);
  }
}

export function highlight(highlighter: Highlighter, lang: string, code: string): string {
  const shikiLang = SHIKI_LANG[lang.toLowerCase()];
  if (!shikiLang) return escapeHtml(code);
  try {
    const full = highlighter.codeToHtml(code, {
      lang: shikiLang,
      themes: { light: "simplecode-mono-light", dark: "simplecode-mono-dark" },
      defaultColor: false,
    });
    const m = full.match(/<code[^>]*>([\s\S]*)<\/code>\s*<\/pre>\s*$/);
    return m ? collapseShikiLines(m[1]) : escapeHtml(code);
  } catch {
    return escapeHtml(code);
  }
}

function goalsHtml(goals: string[], edition: "zh" | "en"): string {
  if (!goals.length) return "";
  const items = goals.map((g) => `<li>${escapeHtml(g)}</li>`).join("");
  const heading = edition === "en" ? "Goals" : "本章目标";
  return `<h2>${heading}</h2><ul>${items}</ul>`;
}

function plainText(segs: Segment[]): string {
  const parts: string[] = [];
  for (const seg of segs) {
    if (seg.type === "html") parts.push(seg.html.replace(/<[^>]+>/g, " "));
    else if (seg.type === "code") parts.push(seg.block.code);
    else parts.push(plainText(seg.segments));
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function headingText(segs: Segment[]): string {
  const hs: string[] = [];
  const walkSegs = (list: Segment[]) => {
    for (const seg of list) {
      if (seg.type === "html") {
        for (const m of seg.html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g)) hs.push(m[1].replace(/<[^>]+>/g, ""));
      } else if (seg.type !== "code") walkSegs(seg.segments);
    }
  };
  walkSegs(segs);
  return hs.join(" ");
}

function str(v: unknown): string | undefined {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function isShareAlikeNotice(name: string): boolean {
  const base = name.toLowerCase();
  return base === "license" || base.startsWith("license.") || base === "notice" || base.startsWith("notice.");
}

/** Reject CC BY-SA LICENSE/NOTICE files and directories that are not chapter_*. */
function scanBookTree(dir: string, label: string, errors: string[]) {
  let names: string[] = [];
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of names) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isFile()) {
      if (isShareAlikeNotice(name)) errors.push(`${label}: 不允许 ${name}`);
      continue;
    }
    if (!st.isDirectory()) continue;
    if (!name.startsWith("chapter_")) {
      errors.push(`${label}: 未知子目录 ${name}`);
      continue;
    }
    for (const child of readdirSync(full)) {
      const childPath = join(full, child);
      const childSt = statSync(childPath);
      if (childSt.isDirectory()) errors.push(`${label}/${name}: 目录只到一层`);
      else if (isShareAlikeNotice(child)) errors.push(`${label}/${name}: 不允许 ${child}`);
    }
  }
}

function validateMeta(file: string, book: BookId, data: Record<string, unknown>, slug: string, errors: string[]): ChapterMeta | undefined {
  const where = relative(process.cwd(), file);
  const fail = (msg: string) => errors.push(`${where}: ${msg}`);
  const language = str(data.language);
  if (language !== book) fail(`language 必须是 ${book}`);
  if (typeof data.chapter !== "number" || !Number.isInteger(data.chapter) || data.chapter < 0) fail("chapter 必须是 >= 0 的整数");
  const title = str(data.title);
  if (!title) fail("缺少 title");
  const chapter = typeof data.chapter === "number" ? data.chapter : -1;
  if (slug === "index" && chapter !== 0) fail("只有 chapter 0 能使用文件名 index.md");
  if (chapter > 0 && !LEVELS.has(String(data.level))) fail("level 必须是 beginner | intermediate | advanced");
  if (chapter === 0 && data.level !== undefined && !LEVELS.has(String(data.level))) fail("概览的 level 不合法");
  if (typeof data.minutes !== "number" || data.minutes <= 0) fail("minutes 必须是正数");
  if (!Array.isArray(data.goals) || data.goals.length === 0 || data.goals.some((g) => typeof g !== "string")) fail("goals 必须是非空字符串列表");
  if (!str(data.updated)) fail("缺少 updated");
  if (data.sources !== undefined && (!Array.isArray(data.sources) || data.sources.some((s) => typeof s !== "string"))) fail("sources 必须是字符串列表");
  if (errors.some((e) => e.startsWith(where + ":"))) return undefined;
  return {
    id: `${book}/${slug}`,
    book,
    slug,
    language: book,
    chapter,
    title: title!,
    level: data.level as ChapterMeta["level"],
    minutes: data.minutes as number,
    goals: data.goals as string[],
    sources: (data.sources as string[]) ?? [],
    updated: str(data.updated)!,
    runtime: str(data.runtime),
  };
}

function checkBlocks(file: string, segs: Segment[], errors: string[]) {
  const where = relative(process.cwd(), file);
  const walkSegs = (list: Segment[]) => {
    for (const seg of list) {
      if (seg.type === "code") {
        const b = seg.block;
        if (b.runnable && b.smoke !== "skip") {
          if (!b.code.trim()) errors.push(`${where}: ${b.id} 代码为空`);
          const exit = b.exit ?? 0;
          if (exit === 0 && !b.expect) errors.push(`${where}: ${b.id} 可运行代码块缺少 expect`);
        }
      } else if (seg.type !== "html") walkSegs(seg.segments);
    }
  };
  walkSegs(segs);
}

export async function renderDocs(root: string): Promise<RenderedDocs> {
  const errors: string[] = [];
  const docsDir = join(root, "docs");
  const sourcesPath = join(docsDir, "sources.yaml");
  let sources: Record<string, { adapt?: boolean }> = {};
  try {
    sources = parseSources(readFileSync(sourcesPath, "utf8"));
  } catch {
    errors.push("缺少 docs/sources.yaml");
  }

  const md = createMarkdown();
  const highlighter = await createHighlighter({
    themes: [lightTheme, darkTheme],
    langs: ["python", "ruby", "javascript", "typescript", "sql", "c", "cpp", "php", "lua", "go", "bash", "rust", "java", "json", "yaml", "markdown", "html"],
  });

  const books: BookIndex[] = [];
  const booksEn: BookIndex[] = [];
  const chapters: Record<string, ChapterDoc> = {};
  const searchDocs: SearchDoc[] = [];
  const searchDocsEn: SearchDoc[] = [];

  let entries: string[] = [];
  try {
    entries = readdirSync(docsDir);
  } catch {
    errors.push("缺少 docs/ 目录");
  }

  for (const name of entries) {
    const dir = join(docsDir, name);
    if (!statSync(dir).isDirectory()) continue;
    if (!isKnownDocsDir(name)) errors.push(`未知文档目录 docs/${name}`);
  }

  const only = (process.env.DOCS_BOOKS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const shipped = new Set<string>(SHIPPED_BOOKS);
  const wanted = only.length ? BOOKS.filter((b) => only.includes(b)) : [...BOOKS];

  async function loadEdition(book: BookId, edition: "zh" | "en") {
    const dir = edition === "en" ? join(docsDir, "en", book) : join(docsDir, book);
    const label = edition === "en" ? `en/${book}` : book;
    let files: string[] = [];
    try {
      files = listBookMarkdown(dir);
    } catch {
      if (edition === "zh" && (only.length || shipped.has(book))) errors.push(`缺少 docs/${book}/`);
      return;
    }
    if (!files.length) {
      if (edition === "zh" && (only.length || shipped.has(book))) errors.push(`缺少 docs/${book}/`);
      return;
    }
    if (book === "dl") scanBookTree(dir, label, errors);
    const metas: ChapterMeta[] = [];
    const seen = new Set<number>();
    const intoBooks = edition === "en" ? booksEn : books;
    const intoSearch = edition === "en" ? searchDocsEn : searchDocs;
    for (const file of files) {
      const full = join(dir, file);
      const raw = readFileSync(full, "utf8");
      const parsed = matter(raw);
      const slug = file.replace(/\.md$/, "");
      const meta = validateMeta(full, book, parsed.data, slug, errors);
      if (book === "dl") {
        const expected = dlChapterNumber(file);
        if (expected === undefined) errors.push(`${relative(process.cwd(), full)}: 不在深度学习目录表里`);
        else if (meta && meta.chapter !== expected) errors.push(`${relative(process.cwd(), full)}: chapter 应为 ${expected}`);
      }
      if (!meta) continue;
      if (edition === "en") meta.id = `en/${meta.id}`;
      if (seen.has(meta.chapter)) errors.push(`${label}: chapter ${meta.chapter} 重复`);
      seen.add(meta.chapter);
      for (const src of meta.sources) {
        if (!sources[src]) errors.push(`${relative(process.cwd(), full)}: 未知 sources id ${src}`);
      }
      const tokens = md.parse(parsed.content, {});
      const counter = { n: 0 };
      const segments = walk(md, tokens, 0, tokens.length, meta.id, counter, edition);
      const goals = goalsHtml(meta.goals, edition);
      const marker = edition === "en" ? "\n## Goals" : "本章目标";
      if (goals && !parsed.content.includes(marker)) segments.unshift({ type: "html", html: goals });
      await highlightAll(highlighter, segments);
      checkBlocks(full, segments, errors);
      chapters[meta.id] = { meta, segments };
      metas.push(meta);
      const text = `${meta.goals.join(" ")} ${plainText(segments)}`.replace(/\s+/g, " ").trim().slice(0, 1500);
      intoSearch.push({ id: meta.id, book, title: meta.title, headings: headingText(segments), text });
    }
    metas.sort((a, b) => a.chapter - b.chapter);
    const contentCount = metas.filter((m) => m.chapter > 0).length;
    if (!metas.some((m) => m.chapter === 0)) errors.push(`${label}: 缺少 chapter 0 概览`);
    // DeepLearning lands across phases 2–8. Chapter numbers are TOC indexes,
    // so a partial book stays ordered without the ten-chapter floor.
    const floor = book === "dl" ? 1 : 10;
    if (contentCount < floor) errors.push(`${label}: 只有 ${contentCount} 章，至少需要 ${floor} 章（不含概览）`);
    if (book === "dl") {
      for (const section of DL_TOC) {
        if (section.phase > DL_LANDED_PHASE) continue;
        if (!files.includes(section.path) || !existsSync(join(dir, section.path))) {
          errors.push(`${label}: 缺少 ${section.path}`);
        }
      }
    }
    intoBooks.push({ id: book, chapters: metas });
  }

  for (const book of wanted) {
    await loadEdition(book, "zh");
    await loadEdition(book, "en");
  }

  if (errors.length) {
    throw new Error(`docs schema 校验失败（${errors.length}）:\n- ${errors.join("\n- ")}`);
  }
  const runnable = Object.values(chapters).reduce((n, ch) => n + countRunnable(ch.segments), 0);
  console.log(`docs: ${Object.keys(chapters).length} chapters, ${runnable} runnable blocks`);
  return { books, booksEn, chapters, searchDocs, searchDocsEn };
}

function countRunnable(segs: Segment[]): number {
  let n = 0;
  for (const seg of segs) {
    if (seg.type === "code" && seg.block.runnable) n++;
    else if (seg.type === "callout" || seg.type === "answer") n += countRunnable(seg.segments);
  }
  return n;
}
