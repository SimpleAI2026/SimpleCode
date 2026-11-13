#!/usr/bin/env node
// Drawer, chapter Run, TypeScript comment, backup undo, coming soon, screenshots.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, statSync } from "node:fs";
import { PNG } from "pngjs";
import { chromium } from "playwright";

const PORT = Number(process.env.LEARN_PORT ?? 4323);
const BASE = `http://127.0.0.1:${PORT}`;
const shotDir = "tests/screenshots";
const artifactDir = "/opt/cursor/artifacts";

const server = spawn("yarn", ["vite", "preview", "--host", "127.0.0.1", "--port", String(PORT), "--strictPort"], {
  stdio: ["ignore", "pipe", "pipe"],
});
const stop = () => {
  try {
    server.kill("SIGTERM");
  } catch {
    /* already gone */
  }
};
process.on("exit", stop);

function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

async function waitForServer() {
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("preview server did not start");
}

function launchBrowser() {
  const options = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
  return chromium.launch(options).catch(() => chromium.launch({ channel: "chrome" }));
}

function readPng(path) {
  return readFileSync(path);
}

async function showToc(page) {
  await openLearn(page);
  const back = page.getByRole("button", { name: "返回目录" });
  if (await back.count()) await back.click();
  await page.waitForSelector('[data-testid="docs-search"]');
}

/** Chapter numbers follow each language's tutorial, so fixtures are found by content. */
async function openChapterMatching(page, match) {
  const links = page.locator('[data-testid="chapter-link"]');
  const n = await links.count();
  for (let i = 0; i < n; i++) {
    await showToc(page);
    await links.nth(i).click();
    await page.waitForSelector('[data-testid="docs-chapter"] [data-testid="doc-code-block"]');
    if (await match(page)) return true;
  }
  return false;
}

let failed = 0;
function check(ok, message) {
  if (!ok) {
    failed++;
    console.log(`✗ ${message}`);
  } else console.log(`✓ ${message}`);
}

async function saveShot(page, name, locator) {
  mkdirSync(shotDir, { recursive: true });
  mkdirSync(artifactDir, { recursive: true });
  const target = locator ?? page;
  for (const dir of [shotDir, artifactDir]) {
    const path = `${dir}/${name}`;
    await target.screenshot({ path });
    const size = statSync(path).size;
    check(size > 10_000, `${name} ${size} bytes`);
  }
}

function monoRatio(path) {
  const png = PNG.sync.read(readPng(path));
  let colored = 0;
  let total = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] < 16) continue;
    total++;
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    if (Math.abs(r - g) > 2 || Math.abs(g - b) > 2) colored++;
  }
  return total ? 1 - colored / total : 1;
}

async function setTheme(page, mode) {
  await page.evaluate((value) => localStorage.setItem("simplecode:theme", value), mode);
  await page.reload();
  await page.waitForSelector('[data-testid="study-mode-learn"]');
}

async function openLearn(page) {
  if ((await page.getAttribute('[data-testid="study-mode-learn"]', "aria-expanded")) !== "true") {
    await page.click('[data-testid="study-mode-learn"]');
  }
  await page.waitForSelector('[data-testid="docs-drawer"]');
}

async function actionMetrics(page, ids) {
  return page.evaluate((ids) => {
    return ids.map((id) => {
      const el = document.querySelector(`[data-testid="${id}"]`);
      if (!el) return null;
      const box = el.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(el);
      const text = range.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        id,
        h: box.height,
        top: box.top,
        mid: box.top + box.height / 2,
        textMid: text.top + text.height / 2,
        fontSize: style.fontSize,
        radius: style.borderRadius,
      };
    });
  }, ids);
}

function actionsAligned(metrics) {
  const base = metrics[0];
  if (!base) return false;
  return metrics.every(
    (item) =>
      item &&
      Math.abs(item.h - base.h) <= 1 &&
      Math.abs(item.top - base.top) <= 1 &&
      Math.abs(item.textMid - item.mid) <= 2 &&
      item.fontSize === base.fontSize &&
      item.radius === base.radius &&
      item.h >= 27 &&
      item.h <= 29,
  );
}

async function assertLeetCode(page) {
  await page.click('[data-testid="docs-close"]');
  await saveShot(page, "leetcode-switch.png");
  const before = await page.evaluate(() =>
    [...document.querySelectorAll("[data-testid^=lang-]")].map((el) => ({
      id: el.getAttribute("data-testid").replace(/^lang-/, ""),
      status: el.getAttribute("data-status"),
    })),
  );
  await page.click('[data-testid="study-mode-leetcode"]');
  await page.waitForSelector('[data-testid="leetcode-heading-easy"]');
  await page.waitForSelector('[data-testid="leetcode-heading-hard"]');
  const mode = await page.getAttribute('[data-testid="docs-drawer"]', "data-mode");
  const title = await page.textContent('[data-testid="docs-title"]');
  const headings = await page.locator("[data-testid^=leetcode-heading-]").allTextContents();
  const offered = await page.$$eval("[data-testid=leetcode-lang]", (els) => els.map((el) => el.getAttribute("data-lang")));
  const after = await page.evaluate(() =>
    [...document.querySelectorAll("[data-testid^=lang-]")].map((el) => ({
      id: el.getAttribute("data-testid").replace(/^lang-/, ""),
      status: el.getAttribute("data-status"),
    })),
  );
  const runnable = new Set(["python", "ruby", "quickjs", "clang", "clangpp", "lua", "go", "rust", "java"]);
  const downloaded = new Set(before.filter((row) => row.status === "cached" || row.status === "ready").map((row) => row.id));
  const flipped = before.filter((row) => {
    const next = after.find((item) => item.id === row.id);
    return row.status !== "downloading" && next?.status === "downloading";
  });
  check(mode === "leetcode" && title?.trim() === "LeetCode", `leetcode drawer ${mode} ${title}`);
  check(headings.some((text) => text.includes("简单")) && headings.some((text) => text.includes("中等")) && headings.some((text) => text.includes("困难")), `zh groups ${headings.join(" | ")}`);
  check(offered.includes("python") && offered.every((id) => runnable.has(id) && downloaded.has(id)), `langs ${offered.join(",")}`);
  check(flipped.length === 0, `leetcode click started a download ${flipped.map((row) => row.id).join(",")}`);
  check((await page.locator('[data-testid=leetcode-problem]').count()) >= 200, "problem list includes the catalog");
  await saveShot(page, "leetcode-toc-zh.png");
  await saveShot(page, "leetcode-langs.png", page.locator('[data-testid="docs-drawer"]'));

  await page.locator('[data-testid="leetcode-problem"][data-id="1"]').click();
  await page.waitForSelector('[data-testid="leetcode-problem-page"]');
  check((await page.locator('[data-testid=leetcode-solution]').count()) === 0, "solution stays hidden");
  check((await page.textContent('[data-testid=leetcode-reveal]'))?.includes("查看题解"), "reveal label");
  await saveShot(page, "leetcode-problem-hidden.png", page.locator('[data-testid="docs-drawer"]'));
  await page.click('[data-testid="leetcode-reveal"]');
  await page.waitForFunction(() => document.querySelector('[data-testid="leetcode-solution"]')?.textContent?.includes("twoSum"));
  const solution = await page.textContent('[data-testid="leetcode-solution"]');
  check(solution?.includes("twoSum") && solution?.includes("kamyu104"), "revealed python solution");
  await saveShot(page, "leetcode-problem-revealed.png", page.locator('[data-testid="docs-drawer"]'));
  const withSolution = await actionMetrics(page, ["leetcode-reveal", "leetcode-run-sample", "leetcode-load-run"]);
  check(actionsAligned(withSolution), `solution actions share a line (${JSON.stringify(withSolution)})`);

  await page.click('[data-testid="lang-quickjs"]');
  await page.waitForSelector('[data-testid="lang-quickjs"][data-status="ready"]', { timeout: 180_000 });
  await page.waitForSelector('[data-testid="leetcode-no-solution"]');
  const withoutSolution = await actionMetrics(page, ["leetcode-no-solution", "leetcode-run-sample"]);
  check(actionsAligned(withoutSolution), `missing-solution row shares a line (${JSON.stringify(withoutSolution)})`);
  check((await page.textContent('[data-testid="leetcode-no-solution"]'))?.includes("这门语言还没有题解"), "Chinese missing-solution notice");
  await page.getByTestId("locale-en").click();
  await page.waitForFunction(() => (document.querySelector('[data-testid="leetcode-no-solution"]')?.textContent || "").includes("No solution"));
  const englishRow = await actionMetrics(page, ["leetcode-no-solution", "leetcode-run-sample"]);
  check(actionsAligned(englishRow), `English missing-solution row shares a line (${JSON.stringify(englishRow)})`);
  await page.getByTestId("locale-zh").click();
  await page.waitForFunction(() => (document.querySelector('[data-testid="leetcode-no-solution"]')?.textContent || "").includes("这门语言还没有题解"));
  await page.click('[data-testid="lang-python"]');
  await page.waitForSelector('[data-testid="leetcode-reveal"]');

  await page.getByRole("button", { name: "返回目录" }).click();
  await page.waitForSelector('[data-testid="leetcode-list"]');
  await page.getByTestId("locale-en").click();
  await page.waitForFunction(() => document.querySelector('[data-testid="leetcode-heading-easy"]')?.textContent?.includes("Easy"));
  const enHeadings = await page.locator("[data-testid^=leetcode-heading-]").allTextContents();
  const enTitle = await page.locator('[data-testid="leetcode-problem"][data-id="1"]').innerText();
  check(enHeadings.some((text) => text.includes("Easy")) && enHeadings.some((text) => text.includes("Medium")) && enHeadings.some((text) => text.includes("Hard")) && enTitle.includes("Two Sum"), `en groups ${enTitle}`);
  await saveShot(page, "leetcode-toc-en.png");
  await page.getByTestId("locale-zh").click();
  await page.waitForFunction(() => document.querySelector('[data-testid="leetcode-heading-easy"]')?.textContent?.includes("简单"));
  await page.click('[data-testid="study-mode-learn"]');
  await page.waitForFunction(() => document.querySelector('[data-testid="docs-title"]')?.textContent?.includes("Python 快速入门"));
}

async function assertToolbarClear(page, ids = ["run", "study-mode-learn", "study-mode-leetcode"]) {
  const boxes = await page.evaluate((ids) => {
    const drawer = document.querySelector('[data-testid="docs-drawer"]').getBoundingClientRect();
    return ids.map((id) => {
      const el = document.querySelector(`[data-testid="${id}"]`);
      if (!el) return { id, intersects: true, covered: true, visible: false };
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      const intersects = !(r.right <= drawer.left || r.left >= drawer.right || r.bottom <= drawer.top || r.top >= drawer.bottom);
      return { id, intersects, covered: !!hit?.closest("[data-testid='docs-drawer']"), visible: r.width > 0 && r.height > 0 };
    });
  }, ids);
  check(
    boxes.every((b) => b.visible && !b.intersects && !b.covered),
    `toolbar stays clear of the drawer (${boxes.map((b) => `${b.id}:${b.intersects ? "overlap" : "ok"}`).join(" ")})`,
  );
}

/** Wait until this block's run reaches a terminal status. A previous example can still show "done". */
async function waitForBlock(page, block, statuses = ["done", "failed", "crash", "terminated"]) {
  const id = await block.getAttribute("data-block");
  await page.waitForFunction(
    ({ id, statuses }) => {
      const el = document.querySelector('[data-testid="run-status"]');
      const status = el?.getAttribute("data-status") ?? "";
      return el?.getAttribute("data-source") === id && statuses.includes(status);
    },
    { id, statuses },
    { timeout: 180_000 },
  );
}

try {
  await waitForServer();
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on("pageerror", (err) => console.log("  [pageerror]", err.message));
  await page.goto(BASE);
  await page.evaluate(() => localStorage.removeItem("simplecode:learn:autoStop"));
  await setTheme(page, "light");
  await page.waitForSelector('[data-testid="lang-python"]');
  await openLearn(page);
  const title = await page.textContent('[data-testid="docs-title"]');
  check(title?.includes("Python 快速入门"), `drawer title ${title}`);
  await assertToolbarClear(page);
  await saveShot(page, "learn-drawer-light.png");
  await saveShot(page, "learn-toolbar.png");
  const lightDrawer = "/tmp/learn-drawer-light-element.png";
  await page.locator('[data-testid="docs-drawer"]').screenshot({ path: lightDrawer });
  const lightRatio = monoRatio(lightDrawer);
  check(lightRatio >= 0.99, `light drawer grayscale ${(lightRatio * 100).toFixed(2)}%`);

  await setTheme(page, "dark");
  await openLearn(page);
  await assertToolbarClear(page);
  await saveShot(page, "learn-drawer-dark.png");
  const darkDrawer = "/tmp/learn-drawer-dark-element.png";
  await page.locator('[data-testid="docs-drawer"]').screenshot({ path: darkDrawer });
  const darkRatio = monoRatio(darkDrawer);
  check(darkRatio >= 0.99, `dark drawer grayscale ${(darkRatio * 100).toFixed(2)}%`);

  await setTheme(page, "light");
  await openLearn(page);
  const foundGreeting = await openChapterMatching(page, async (page) => {
    const block = page.locator('[data-testid="docs-chapter"] [data-testid="doc-code-block"]').first();
    const code = await block.getAttribute("data-code");
    const expectText = await block.getAttribute("data-expect");
    return !!(code?.includes('input("Name?")') && expectText === "Hello, Ada!");
  });
  check(foundGreeting, "greeting chapter opens on input");
  await saveShot(page, "learn-chapter.png", page.locator('[data-testid="docs-drawer"]'));
  const block = page.locator('[data-testid="docs-chapter"] [data-testid="doc-code-block"]').first();
  const code = await block.getAttribute("data-code");
  const expectText = await block.getAttribute("data-expect");
  await block.locator('[data-testid="doc-run"]').click();
  await waitForBlock(page, block);
  const status = await page.getAttribute('[data-testid="run-status"]', "data-status");
  const editorValue = await page.evaluate(() => globalThis.__simplecodeEditor.getValue());
  const transcript = stripAnsi(await page.evaluate(() => globalThis.__simplecodeTerminal.transcript));
  check(status === "done" && editorValue === code && transcript.includes(expectText), `run from doc status=${status}`);
  await saveShot(page, "learn-after-run.png");
  await assertLeetCode(page);

  await page.click('[data-testid="docs-close"]');
  await page.click('[data-testid="lang-ruby"]');
  await openLearn(page);
  const rubyTitle = await page.textContent('[data-testid="docs-title"]');
  check(rubyTitle?.includes("Ruby 快速入门") && !(await page.$('[data-testid="docs-soon"]')), `ruby book opens ${rubyTitle}`);
  await page.click('[data-testid="chapter-link"][data-chapter="1"]');
  await page.waitForSelector('[data-testid="docs-chapter"]');
  await saveShot(page, "learn-ruby-chapter.png", page.locator('[data-testid="docs-drawer"]'));
  await page.click('[data-testid="docs-close"]');
  await page.click('[data-testid="lang-sqlite"]');
  await openLearn(page);
  const sqlTitle = await page.textContent('[data-testid="docs-title"]');
  check(sqlTitle?.includes("SQL 快速入门") && !(await page.$('[data-testid="docs-soon"]')), `sql book opens ${sqlTitle}`);
  await page.click('[data-testid="chapter-link"][data-chapter="1"]');
  await page.waitForSelector('[data-testid="docs-chapter"]');
  await saveShot(page, "learn-sql-chapter.png", page.locator('[data-testid="docs-drawer"]'));
  await page.click('[data-testid="docs-close"]');
  await page.click('[data-testid="lang-clang"]');
  await openLearn(page);
  const cTitle = await page.textContent('[data-testid="docs-title"]');
  check(cTitle?.includes("C 快速入门") && !cTitle?.includes("C++") && !(await page.$('[data-testid="docs-soon"]')), `c book opens ${cTitle}`);
  await page.click('[data-testid="docs-close"]');
  await page.click('[data-testid="lang-clangpp"]');
  await openLearn(page);
  const cppTitle = await page.textContent('[data-testid="docs-title"]');
  check(cppTitle?.includes("C++ 快速入门") && !(await page.$('[data-testid="docs-soon"]')), `cpp book opens ${cppTitle}`);
  await page.click('[data-testid="docs-close"]');
  await page.click('[data-testid="lang-php-cgi"]');
  await openLearn(page);
  const phpTitle = await page.textContent('[data-testid="docs-title"]');
  check(phpTitle?.includes("PHP 快速入门") && !(await page.$('[data-testid="docs-soon"]')), `php book opens ${phpTitle}`);
  await page.click('[data-testid="docs-close"]');
  await page.click('[data-testid="lang-lua"]');
  await openLearn(page);
  const luaTitle = await page.textContent('[data-testid="docs-title"]');
  check(luaTitle?.includes("Lua 快速入门") && !(await page.$('[data-testid="docs-soon"]')), `lua book opens ${luaTitle}`);
  await page.click('[data-testid="chapter-link"][data-chapter="1"]');
  await page.waitForSelector('[data-testid="docs-chapter"]');
  await saveShot(page, "learn-lua-chapter.png", page.locator('[data-testid="docs-drawer"]'));
  const luaBlock = page.locator('[data-testid="docs-chapter"] [data-testid="doc-code-block"][data-runnable="1"]').first();
  const luaExpect = await luaBlock.getAttribute("data-expect");
  await luaBlock.locator('[data-testid="doc-run"]').click();
  await waitForBlock(page, luaBlock);
  const luaOut = stripAnsi(await page.evaluate(() => globalThis.__simplecodeTerminal.transcript));
  check(luaOut.includes(luaExpect), `lua chapter run ${luaExpect}`);
  await saveShot(page, "learn-lua-run.png");
  await page.click('[data-testid="docs-close"]');

  await page.click('[data-testid="lang-python"]');
  await page.waitForSelector('[data-testid="lang-python"][data-status="ready"]', { timeout: 180_000 });
  const draft = 'print("keep-me")\n';
  await page.evaluate((value) => globalThis.__simplecodeEditor.setValue(value), draft);
  await showToc(page);
  await page.click('[data-testid="chapter-link"][data-chapter="1"]');
  await page.waitForSelector('[data-testid="docs-chapter"]');
  const chapterOne = page.locator('[data-testid="doc-code-block"]').first();
  await chapterOne.locator('[data-testid="doc-run"]').click();
  await waitForBlock(page, chapterOne);
  await page.click('[data-testid="doc-undo"]');
  const restored = await page.evaluate(() => globalThis.__simplecodeEditor.getValue());
  check(restored === draft, "undo restores the editor");

  await showToc(page);
  const foundLoop = await openChapterMatching(page, async (page) => !!(await page.$('[data-smoke="skip"] [data-testid="doc-run"]')));
  check(foundLoop, "a chapter keeps an infinite loop out of smoke");
  const looping = page.locator('[data-smoke="skip"]').first();
  await looping.locator('[data-testid="doc-run"]').click();
  await waitForBlock(page, looping, ["run"]);
  const other = page.locator('[data-testid="doc-code-block"][data-runnable="1"]:not([data-smoke="skip"])').first();
  const otherCode = await other.getAttribute("data-code");
  await other.locator('[data-testid="doc-run"]').click();
  await page.waitForSelector('[data-testid="doc-confirm"]');
  await page.click('[data-testid="doc-confirm-yes"]');
  await waitForBlock(page, other);
  const afterStop = await page.evaluate(() => globalThis.__simplecodeEditor.getValue());
  check(afterStop === otherCode, "confirm stop runs the next example");

  await page.click('[data-testid="docs-close"]');
  await page.click('[data-testid="lang-quickjs"]');
  await page.waitForSelector('[data-testid="lang-quickjs"][data-status="ready"]', { timeout: 180_000 });
  await showToc(page);
  check((await page.textContent('[data-testid="docs-title"]'))?.includes("JavaScript 快速入门"), "javascript book label");
  await page.click('[data-testid="chapter-link"][data-chapter="4"]');
  await page.waitForSelector('[data-testid="docs-chapter"]');
  await saveShot(page, "learn-js-chapter.png");
  await showToc(page);
  const foundTs = await openChapterMatching(page, async (page) => !!(await page.$('[data-lang="ts"] [data-testid="doc-run"]')));
  check(foundTs, "typescript chapter");
  const ts = page.locator('[data-lang="ts"]').first();
  const tsExpect = await ts.getAttribute("data-expect");
  await ts.locator('[data-testid="doc-run"]').click();
  await waitForBlock(page, ts);
  const tsEditor = await page.evaluate(() => globalThis.__simplecodeEditor.getValue());
  const tsOut = stripAnsi(await page.evaluate(() => globalThis.__simplecodeTerminal.transcript));
  const filename = await page.textContent('[data-testid="filename"]');
  check(
    tsEditor.includes("由 TypeScript 转译") && tsOut.includes(tsExpect) && filename === "main.js",
    `ts block transpiled into the editor (file=${filename}, expect=${tsExpect}, editor=${tsEditor.slice(0, 80).replaceAll("\n", " ")})`,
  );

  await page.click('[data-testid="docs-close"]');
  await page.click('[data-testid="lang-shell"]');
  await openLearn(page);
  const shellTitle = await page.textContent('[data-testid="docs-title"]');
  check(shellTitle?.includes("Shell 快速入门") && !(await page.$('[data-testid="docs-soon"]')), `shell book opens ${shellTitle}`);
  await page.click('[data-testid="chapter-link"][data-chapter="1"]');
  await page.waitForSelector('[data-testid="docs-chapter"]');
  await saveShot(page, "learn-shell-chapter.png");
  const shellBlock = page.locator('[data-testid="docs-chapter"] [data-testid="doc-code-block"][data-runnable="1"]').first();
  const shellExpect = await shellBlock.getAttribute("data-expect");
  await shellBlock.locator('[data-testid="doc-run"]').click();
  await waitForBlock(page, shellBlock);
  const shellOut = stripAnsi(await page.evaluate(() => globalThis.__simplecodeTerminal.transcript));
  check(shellOut.includes(shellExpect), `shell chapter run ${shellExpect}`);
  await saveShot(page, "learn-shell-run.png");
  await page.click('[data-testid="docs-close"]');

  await page.click('[data-testid="lang-linux"]');
  await page.waitForSelector('[data-testid="lang-linux"][data-status="ready"]', { timeout: 180_000 });
  const linuxLabel = await page.textContent('[data-testid="lang-linux"]');
  check(linuxLabel?.includes("Linux") && linuxLabel?.includes("Lx"), `linux sidebar label ${linuxLabel}`);
  const linuxMono = await page.locator('[data-testid="lang-linux"] span').first().evaluate((el) => {
    const color = getComputedStyle(el).color;
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return false;
    return Math.abs(Number(match[1]) - Number(match[2])) <= 2 && Math.abs(Number(match[2]) - Number(match[3])) <= 2;
  });
  check(linuxMono, "linux icon is monochrome");
  await openLearn(page);
  const linuxTitle = await page.textContent('[data-testid="docs-title"]');
  check(linuxTitle?.includes("Linux 快速入门") && !(await page.$('[data-testid="docs-soon"]')), `linux book opens ${linuxTitle}`);
  check((await page.locator('[data-testid="study-mode-leetcode"]').count()) === 0, "linux hides the LeetCode button");
  await assertToolbarClear(page, ["run", "study-mode-learn"]);
  const linuxDrawer = "/tmp/learn-linux-drawer.png";
  await page.locator('[data-testid="docs-drawer"]').screenshot({ path: linuxDrawer });
  check(monoRatio(linuxDrawer) >= 0.99, "linux drawer grayscale");
  await page.click('[data-testid="chapter-link"][data-chapter="1"]');
  await page.waitForSelector('[data-testid="docs-chapter"] [data-testid="doc-code-block"]');
  const linuxBlock = page.locator('[data-testid="docs-chapter"] [data-testid="doc-code-block"][data-runnable="1"]').first();
  const linuxExpect = await linuxBlock.getAttribute("data-expect");
  await linuxBlock.locator('[data-testid="doc-run"]').click();
  await waitForBlock(page, linuxBlock);
  const linuxOut = stripAnsi(await page.evaluate(() => globalThis.__simplecodeTerminal.transcript));
  check(linuxOut.includes(linuxExpect), `linux chapter run ${linuxExpect}`);
  await page.waitForFunction(() => (globalThis.__simplecodeTerminal.transcript || "").includes("~%"), null, { timeout: 15_000 });
  // The drawer covers the right side of the terminal. Click the visible left edge.
  await page.locator('[data-testid="terminal"]').click({ position: { x: 24, y: 24 } });
  await page.keyboard.type("echo typed-ok");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => (globalThis.__simplecodeTerminal.transcript || "").includes("typed-ok"), null, { timeout: 15_000 });
  check(true, "linux serial accepts a typed command");
  await page.click('[data-testid="docs-close"]');

  await page.click('[data-testid="lang-go"]');
  await page.waitForSelector('[data-testid="lang-go"][data-status="ready"]', { timeout: 180_000 });
  await showToc(page);
  await page.click('[data-testid="chapter-link"][data-chapter="9"]');
  await page.waitForSelector('[data-testid="docs-chapter"]');
  const goCount = await page.locator('[data-testid="doc-code-block"]').count();
  let goBlock = page.locator('[data-testid="doc-code-block"]').first();
  for (let i = 0; i < goCount; i++) {
    const sample = await page.locator('[data-testid="doc-code-block"]').nth(i).getAttribute("data-code");
    if (sample?.includes("make(chan int, 1)") && sample.includes("func main")) {
      goBlock = page.locator('[data-testid="doc-code-block"]').nth(i);
      break;
    }
  }
  const goCode = (await goBlock.getAttribute("data-code")) ?? "";
  const sourceLines = goCode.replace(/\n$/, "").split("\n").length;
  const renderedLines = await goBlock.locator(".line").count();
  const gap = await goBlock.locator("pre").evaluate((pre) => {
    const lines = [...pre.querySelectorAll(".line")];
    const tops = lines.map((node) => node.getBoundingClientRect().top);
    const height = lines[0]?.getBoundingClientRect().height ?? 0;
    const worst = tops.slice(1).reduce((max, top, i) => Math.max(max, Math.abs(top - tops[i] - height)), 0);
    return { height, worst };
  });
  check(renderedLines === sourceLines && gap.worst <= 1, `code lines rendered=${renderedLines} source=${sourceLines} gap=${gap.worst.toFixed(2)}`);
  await saveShot(page, "learn-go-chapter.png");
  await goBlock.scrollIntoViewIfNeeded();
  await saveShot(page, "learn-code-lines.png", goBlock);
  const buttons = await page.evaluate(() => {
    const text = (el) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
    const a = document.querySelector('[data-testid="run"]');
    const b = document.querySelector('[data-testid="doc-run"]');
    const sa = getComputedStyle(a);
    const sb = getComputedStyle(b);
    return {
      label: text(a) === "Run" && text(b) === "Run",
      height: sa.height === sb.height,
      fontSize: sa.fontSize === sb.fontSize,
      background: sa.backgroundColor === sb.backgroundColor,
      heightPx: sa.height,
    };
  });
  check(
    buttons.label && buttons.height && buttons.fontSize && buttons.background && buttons.heightPx === "28px",
    `run buttons match (${JSON.stringify(buttons)})`,
  );
  await saveShot(page, "learn-run-buttons.png");

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.route("**/*ruby*.wasm", async (route) => {
    await new Promise((r) => setTimeout(r, 700));
    await route.continue();
  });
  const fresh = await context.newPage();
  await fresh.goto(BASE);
  await fresh.waitForSelector('[data-testid="study-mode-learn"]');
  await fresh.click('[data-testid="study-mode-learn"]');
  await fresh.click('[data-testid="chapter-link"][data-chapter="0"]');
  await fresh.waitForSelector('[data-lang="ruby"] [data-testid="doc-run"]');
  const ruby = fresh.locator('[data-lang="ruby"]').first();
  await ruby.locator('[data-testid="doc-run"]').click();
  await fresh.waitForFunction(
    () => /下载/.test(document.querySelector('[data-lang="ruby"] [data-testid="doc-download"]')?.textContent ?? ""),
    null,
    { timeout: 20_000 },
  );
  check(true, "ruby download progress shows on the doc button");
  await waitForBlock(fresh, ruby);
  const rubyOut = stripAnsi(await fresh.evaluate(() => globalThis.__simplecodeTerminal.transcript));
  check(rubyOut.includes("42 from Ruby"), "cross-language ruby block");

  const overview = page;
  await overview.click('[data-testid="docs-close"]').catch(() => {});
  await browser.close();
} finally {
  stop();
}
console.log(failed ? `\n${failed} learn check(s) failed` : "\nlearn checks passed");
process.exit(failed ? 1 : 0);
