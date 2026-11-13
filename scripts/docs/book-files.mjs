import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Markdown paths relative to a book directory.
 * Flat `*.md` stay as they are. `chapter_*` holds one more level of `*.md`,
 * in source order from the directory listing (callers sort when they need a stable order).
 * Other subdirectories are ignored here; the docs schema reports them.
 */
export function listBookMarkdown(dir) {
  const out = [];
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of names) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isFile()) {
      if (name.endsWith(".md")) out.push(name);
      continue;
    }
    if (!st.isDirectory() || !name.startsWith("chapter_")) continue;
    for (const child of readdirSync(full)) {
      const childPath = join(full, child);
      if (child.endsWith(".md") && statSync(childPath).isFile()) out.push(`${name}/${child}`);
    }
  }
  return out.sort();
}
