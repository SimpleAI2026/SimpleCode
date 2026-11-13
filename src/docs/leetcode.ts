import indexEn from "../../docs/en/leetcode/index.json";
import tagsEn from "../../docs/en/leetcode/tags.json";
import indexZh from "../../docs/leetcode/index.json";
import tagsZh from "../../docs/leetcode/tags.json";
import { stripAnsi } from "@/docs/text";

export type Difficulty = "easy" | "medium" | "hard";
export type Tier = "core" | "extended";
export type Edition = "zh" | "en";

export interface ProblemIndexEntry {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  lists: string[];
  tier: Tier;
  premium: boolean;
  langs: string[];
}

export interface SolutionRef {
  file: string;
  sourceRepo: string;
  sourceUrl: string;
  sourceRevision: string;
  license: "MIT" | "CC-BY-SA-4.0";
  spdx: "MIT" | "CC-BY-SA-4.0";
  attribution: string;
  shareAlike: boolean;
  modifications: string[];
}

export interface ProblemSample {
  stdin: string;
  stdout: string;
  note?: string;
}

export interface Problem {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  lists: string[];
  tier: Tier;
  premium: boolean;
  langs: string[];
  summary: string;
  samples: ProblemSample[];
  notes: string[];
  links: { cn: string; en: string };
  io: { kind: string; out: string };
  solutions: Record<string, SolutionRef>;
}

interface ZhProblemFile {
  summary: string;
  samples: ProblemSample[];
  links: { cn: string; en: string };
  io: { kind: string; out: string };
  solutions: Record<string, SolutionRef>;
}

interface EnProblemFile {
  summary: string;
  notes: string[];
}

const zhProblems = import.meta.glob("../../docs/leetcode/problems/*/problem.json", {
  import: "default",
}) as Record<string, () => Promise<ZhProblemFile>>;
const enProblems = import.meta.glob("../../docs/en/leetcode/problems/*/problem.json", {
  import: "default",
}) as Record<string, () => Promise<EnProblemFile>>;
const sources = import.meta.glob("../../docs/leetcode/problems/*/*", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

export const leetcodeIndexZh = indexZh as ProblemIndexEntry[];
export const leetcodeIndexEn = indexEn as ProblemIndexEntry[];
export const leetcodeTagsZh = tagsZh as Record<string, string>;
export const leetcodeTagsEn = tagsEn as Record<string, string>;

// Language capsules and the toolbar LeetCode button both use this list.
export const LEETCODE_RUNTIMES = ["python", "ruby", "quickjs", "clang", "clangpp", "lua", "go", "rust", "java"] as const;

export function isLeetCodeRuntime(id: string) {
  return (LEETCODE_RUNTIMES as readonly string[]).includes(id);
}

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export function padProblem(id: number) {
  return String(id).padStart(4, "0");
}

function byId(rows: ProblemIndexEntry[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

const zhById = byId(leetcodeIndexZh);
const enById = byId(leetcodeIndexEn);

export function indexFor(edition: Edition) {
  return edition === "en" ? leetcodeIndexEn : leetcodeIndexZh;
}

export function tagsFor(edition: Edition) {
  return edition === "en" ? leetcodeTagsEn : leetcodeTagsZh;
}

export async function loadProblem(id: number, edition: Edition): Promise<Problem> {
  const zh = zhById.get(id);
  const en = enById.get(id);
  if (!zh || !en) throw new Error(`missing leetcode index entry ${id}`);
  const folder = padProblem(id);
  const loadZh = zhProblems[`../../docs/leetcode/problems/${folder}/problem.json`];
  const loadEn = enProblems[`../../docs/en/leetcode/problems/${folder}/problem.json`];
  if (!loadZh || !loadEn) throw new Error(`missing leetcode problem ${id}`);
  const zhBody = await loadZh();
  const enBody = await loadEn();
  const meta = edition === "en" ? en : zh;
  return {
    ...meta,
    summary: edition === "en" ? enBody.summary : zhBody.summary,
    samples: zhBody.samples,
    notes: enBody.notes,
    links: zhBody.links,
    io: zhBody.io,
    solutions: zhBody.solutions,
  };
}

export async function loadSolution(id: number, file: string): Promise<string> {
  const key = `../../docs/leetcode/problems/${padProblem(id)}/${file}`;
  const load = sources[key];
  if (!load) throw new Error(`missing solution ${id}/${file}`);
  return load();
}

export function stripTrailingNewlines(text: string) {
  return text.replace(/\n+$/, "");
}

/** Program stdout, after the echoed sample input the terminal prints ahead of it. */
export function programStdout(transcript: string, stdin: string) {
  let text = stripAnsi(transcript);
  const echoed = stdin.endsWith("\n") ? stdin : `${stdin}\n`;
  if (text.startsWith(echoed)) text = text.slice(echoed.length);
  return text;
}

export function outputsMatch(transcript: string, stdin: string, stdout: string) {
  return stripTrailingNewlines(programStdout(transcript, stdin)) === stripTrailingNewlines(stdout);
}
