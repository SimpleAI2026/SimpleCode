#!/usr/bin/env node
// LeetCode toolbar is limited to LEETCODE_RUNTIMES. Hidden sections keep Quick Start.
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = Number(process.env.LEETCODE_SCOPE_PORT ?? 4329);
const BASE = `http://127.0.0.1:${PORT}`;
const HIDDEN = ["sqlite", "php-cgi", "shell", "linux", "numpy"];

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

let failed = 0;
function check(ok, message) {
  if (!ok) {
    failed++;
    console.log(`FAIL ${message}`);
  } else console.log(`ok ${message}`);
}

async function leetCount(page) {
  return page.getByTestId("study-mode-leetcode").count();
}

await waitForServer();
const browser = await launchBrowser();
try {
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await page.goto(BASE);
  await page.waitForSelector('[data-testid="lang-python"][data-status="ready"]', { timeout: 180_000 });
  check((await leetCount(page)) === 1, "Python shows the LeetCode button");
  check((await page.getByTestId("study-mode-learn").count()) === 1, "Python keeps Quick Start");

  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.includes("/wasm/") && !url.includes("manifest.json")) {
      try {
        await route.abort();
      } catch {
        /* closed */
      }
      return;
    }
    await route.continue();
  });

  for (const id of HIDDEN) {
    await page.getByTestId(`lang-${id}`).click();
    await page.waitForFunction((runtime) => document.querySelector(`[data-testid="lang-${runtime}"]`)?.getAttribute("aria-current") === "true", id);
    const count = await leetCount(page);
    const learn = await page.getByTestId("study-mode-learn").count();
    const group = await page.getByTestId("study-mode").count();
    check(count === 0 && learn === 1 && group === 1, `${id} hides LeetCode (count=${count})`);
  }

  await page.close();

  const stored = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await stored.addInitScript(() => {
    localStorage.setItem("simplecode:study-mode", "leetcode");
  });
  const scoped = await stored.newPage();
  await scoped.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.includes("/wasm/pyodide/") || url.includes("/wasm/linux")) {
      try {
        await route.abort();
      } catch {
        /* closed */
      }
      return;
    }
    await route.continue();
  });
  await scoped.goto(BASE);
  await scoped.waitForSelector('[data-testid="lang-python"][data-status="ready"]', { timeout: 180_000 });
  check((await leetCount(scoped)) === 1, "stored LeetCode mode still shows the button on Python");
  await scoped.getByTestId("lang-numpy").click();
  await scoped.waitForFunction(() => {
    const el = document.querySelector('[data-testid="lang-numpy"]');
    const status = el?.getAttribute("data-status");
    return el?.getAttribute("aria-current") === "true" && status && status !== "downloading";
  });
  await scoped.keyboard.press("Control+j");
  await scoped.getByTestId("docs-drawer").waitFor();
  const mode = await scoped.getByTestId("docs-drawer").getAttribute("data-mode");
  const current = await scoped.locator('[data-testid^="lang-"][aria-current="true"]').getAttribute("data-testid");
  const saved = await scoped.evaluate(() => localStorage.getItem("simplecode:study-mode"));
  const pressed = await scoped.getByTestId("study-mode-learn").getAttribute("aria-pressed");
  check(
    current === "lang-numpy" && mode === "learn" && saved === "learn" && pressed === "true" && (await leetCount(scoped)) === 0,
    `numpy stays put and the drawer falls back to learn (${current}, ${mode}, ${saved})`,
  );
  check((await scoped.getByTestId("leetcode-list").count()) === 0, "DeepLearning does not open the problem list");
  await scoped.reload();
  await scoped.waitForSelector('[data-testid="lang-numpy"][aria-current="true"]');
  check((await leetCount(scoped)) === 0, "reloading DeepLearning keeps LeetCode hidden");
  await scoped.keyboard.press("Control+j");
  await scoped.getByTestId("docs-drawer").waitFor();
  const again = await scoped.getByTestId("docs-drawer").getAttribute("data-mode");
  const still = await scoped.locator('[data-testid^="lang-"][aria-current="true"]').getAttribute("data-testid");
  check(again === "learn" && still === "lang-numpy", `reload shortcut stays on the tutorial (${still}, ${again})`);
  await scoped.close();
  await stored.close();
} finally {
  await browser.close().catch(() => {});
  stop();
}

if (failed) {
  console.error(`${failed} leetcode scope check(s) failed`);
  process.exit(1);
}
console.log("ok leetcode scope checks passed");
