#!/usr/bin/env node
// Older 200-problem solution importer.
// The catalog is now built by scripts/leetcode/from_leetcode_go.py.
// Running this importer rewrites index.json back to that older 200-problem set.
// Caches belong in thirdparty/cache/leetcode (gitignored) or $LEETCODE_SRC.
// This does not download at test time. See docs/leetcode/SOURCES.md.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const src = process.env.LEETCODE_SRC ?? "thirdparty/cache/leetcode";
if (!existsSync(src)) {
  console.error(`missing ${src}`);
  console.error("Clone the commits in docs/leetcode/sources.lock.json into that directory, then re-run.");
  process.exit(1);
}

const child = spawnSync("python3", ["scripts/leetcode/build_catalog.py"], {
  stdio: "inherit",
  env: { ...process.env, LEETCODE_SRC: src },
});
process.exit(child.status ?? 1);
