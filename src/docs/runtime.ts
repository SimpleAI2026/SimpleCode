export type RuntimeId = "python" | "ruby" | "quickjs" | "sqlite" | "clang" | "clangpp" | "php-cgi" | "lua" | "go" | "shell" | "rust" | "java" | "linux" | "numpy" | "np";

export type DocLang =
  | "python"
  | "py"
  | "ruby"
  | "rb"
  | "js"
  | "javascript"
  | "ts"
  | "typescript"
  | "sql"
  | "sqlite"
  | "c"
  | "cpp"
  | "c++"
  | "php"
  | "lua"
  | "go"
  | "sh"
  | "shell"
  | "bash"
  | "rust"
  | "rs"
  | "java"
  | "linux"
  | "numpy"
  | "np";

export const DOC_LANG_TO_RUNTIME: Record<DocLang, RuntimeId> = {
  python: "python",
  py: "python",
  ruby: "ruby",
  rb: "ruby",
  js: "quickjs",
  javascript: "quickjs",
  ts: "quickjs",
  typescript: "quickjs",
  sql: "sqlite",
  sqlite: "sqlite",
  c: "clang",
  cpp: "clangpp",
  "c++": "clangpp",
  php: "php-cgi",
  lua: "lua",
  go: "go",
  sh: "shell",
  shell: "shell",
  bash: "shell",
  rust: "rust",
  rs: "rust",
  java: "java",
  linux: "linux",
  numpy: "numpy",
  np: "numpy",
};

export const BOOKS = ["python", "ruby", "js", "sqlite", "c", "cpp", "php", "lua", "go", "shell", "rust", "java", "linux", "numpy", "dl"] as const;
export type BookId = (typeof BOOKS)[number];

/** Books with a full curriculum in this release. Other ids stay in the map and show “即将推出”. */
export const SHIPPED_BOOKS = ["python", "js", "go", "ruby", "sqlite", "c", "cpp", "php", "lua", "shell", "rust", "java", "linux", "numpy", "dl"] as const;

export const RUNTIME_TO_BOOK: Record<RuntimeId, BookId> = {
  python: "python",
  ruby: "ruby",
  quickjs: "js",
  sqlite: "sqlite",
  clang: "c",
  clangpp: "cpp",
  "php-cgi": "php",
  lua: "lua",
  go: "go",
  shell: "shell",
  rust: "rust",
  java: "java",
  linux: "linux",
  numpy: "dl",
  np: "numpy",
};

export const BOOK_TO_RUNTIME: Record<BookId, RuntimeId> = {
  python: "python",
  ruby: "ruby",
  js: "quickjs",
  sqlite: "sqlite",
  c: "clang",
  cpp: "clangpp",
  php: "php-cgi",
  lua: "lua",
  go: "go",
  shell: "shell",
  rust: "rust",
  java: "java",
  linux: "linux",
  numpy: "np",
  dl: "numpy",
};

/** One book per Pyodide sidebar row. The drawer does not switch between them. */
export const RUNTIME_BOOKS: Partial<Record<RuntimeId, readonly BookId[]>> = {
  numpy: ["dl"],
  np: ["numpy"],
};

const PYODIDE_RUNTIMES = new Set<RuntimeId>(["numpy", "np"]);

export function isPyodideRuntime(id: string): id is "numpy" | "np" {
  return PYODIDE_RUNTIMES.has(id as RuntimeId);
}

/**
 * Fence language `numpy` / `np` names the Pyodide engine. A tutorial block runs
 * on the sidebar row that owns its book, so NumPy stays on `np` and d2l stays
 * on `numpy`. Without a book, the fence still selects the DeepLearning row.
 */
export function runtimeForFence(lang: string, book?: string): RuntimeId | undefined {
  const fromFence = resolveRuntime(lang);
  if (!fromFence) return undefined;
  if (book && isBookId(book)) {
    const fromBook = BOOK_TO_RUNTIME[book];
    if (isPyodideRuntime(fromFence) && isPyodideRuntime(fromBook)) return fromBook;
  }
  return fromFence;
}

export const BOOK_LABEL: Record<BookId, string> = {
  python: "Python",
  ruby: "Ruby",
  js: "JavaScript",
  sqlite: "SQL",
  c: "C",
  cpp: "C++",
  php: "PHP",
  lua: "Lua",
  go: "Go",
  shell: "Shell",
  rust: "Rust",
  java: "Java",
  linux: "Linux",
  numpy: "NumPy",
  dl: "DeepLearning",
};

export const LEVEL_LABEL = {
  beginner: "入门",
  intermediate: "进阶",
  advanced: "高级",
} as const;

const RUNTIME_LABEL: Record<RuntimeId, string> = {
  python: "Python",
  ruby: "Ruby",
  quickjs: "JavaScript",
  sqlite: "SQL",
  clang: "C",
  clangpp: "C++",
  "php-cgi": "PHP",
  lua: "Lua",
  go: "Go",
  shell: "Shell",
  rust: "Rust",
  java: "Java",
  linux: "Linux",
  numpy: "Python (NumPy)",
  np: "NumPy",
};

export function resolveRuntime(lang: string): RuntimeId | undefined {
  const key = lang.trim().toLowerCase() as DocLang;
  return DOC_LANG_TO_RUNTIME[key];
}

export function runtimeLabel(id: RuntimeId): string {
  return RUNTIME_LABEL[id];
}

export function isBookId(id: string): id is BookId {
  return (BOOKS as readonly string[]).includes(id);
}
