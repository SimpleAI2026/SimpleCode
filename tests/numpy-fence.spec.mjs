#!/usr/bin/env node
// NumPy sidebar row runs a tutorial fence on the shared Pyodide worker.
// DeepLearning's drawer stays on the d2l book.
import { mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = Number(process.env.NUMPY_FENCE_PORT ?? 4332);
const BASE = `http://127.0.0.1:${PORT}`;
const SHOTS = process.env.NUMPY_FENCE_SHOTS ?? "/opt/cursor/artifacts";

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

async function runOverview(page, expectText) {
  if ((await page.getByTestId("docs-drawer").count()) === 0) {
    await page.getByTestId("study-mode-learn").click();
  }
  await page.getByTestId("docs-drawer").waitFor();
  if ((await page.locator('[data-testid="docs-chapter"]').count()) === 0) {
    await page.locator('[data-testid="chapter-link"][data-chapter="0"]').click();
  }
  await page.locator('[data-testid="docs-chapter"] [data-testid="doc-code-block"]').first().waitFor();
  const block = page.locator(`[data-testid="doc-code-block"][data-expect="${expectText}"]`);
  await block.getByTestId("doc-run").click();
  const id = await block.getAttribute("data-block");
  await page.waitForFunction(
    (blockId) => {
      const el = document.querySelector('[data-testid="run-status"]');
      const status = el?.getAttribute("data-status") ?? "";
      return el?.getAttribute("data-source") === blockId && ["done", "failed", "crash", "terminated"].includes(status);
    },
    id,
    { timeout: 180000 },
  );
  const status = await page.getAttribute('[data-testid="run-status"]', "data-status");
  const out = await page.evaluate(() => globalThis.__simplecodeTerminal?.transcript ?? "");
  return { status, out };
}

await waitForServer();
mkdirSync(SHOTS, { recursive: true });
const browser = await launchBrowser();
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    localStorage.setItem("simplecode:learn:width", "440");
  });
  const page = await context.newPage();
  page.on("pageerror", (err) => console.log("  [pageerror]", err.message));
  await page.goto(BASE);
  await page.getByTestId("lang-np").scrollIntoViewIfNeeded();
  await page.getByTestId("lang-np").click();
  await page.waitForSelector('[data-testid="lang-np"][data-status="ready"]', { timeout: 180000 });
  const order = await page.evaluate(() =>
    [...document.querySelectorAll("[data-testid^=lang-]")].map((el) => el.getAttribute("data-testid")),
  );
  const dlAt = order.indexOf("lang-numpy");
  const npAt = order.indexOf("lang-np");
  check(dlAt >= 0 && npAt >= 0 && Math.abs(dlAt - npAt) === 1, `NumPy sits beside DeepLearning (${order.join(",")})`);
  check((await page.getByTestId("study-mode-leetcode").count()) === 0, "NumPy has no LeetCode button");

  const zh = await runOverview(page, "3 16");
  const current = await page.locator('[data-testid^="lang-"][aria-current="true"]').getAttribute("data-testid");
  check(zh.status === "done" && zh.out.includes("3 16"), `NumPy fence ${zh.status} ${JSON.stringify(zh.out.trim().slice(-120))}`);
  check(current === "lang-np", `fence stays on NumPy (${current})`);
  check((await page.getByTestId("docs-books").count()) === 0, "NumPy drawer has no book switcher");
  await page.getByTestId("lang-np").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/numpy-zh-run.png` });

  await page.evaluate(() => performance.clearResourceTimings());
  await page.getByTestId("lang-numpy").click();
  await page.waitForSelector('[data-testid="lang-numpy"][data-status="ready"]', { timeout: 15000 });
  const refetched = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => name.includes("/wasm/pyodide/")),
  );
  check(refetched.length === 0, `DeepLearning reuses the NumPy download (${refetched.length})`);
  await page.waitForFunction(() => (document.querySelector('[data-testid="docs-drawer"]')?.textContent ?? "").includes("安装"));
  const dlText = await page.getByTestId("docs-drawer").innerText();
  check(
    dlText.includes("安装") && !dlText.includes("创建数组") && !dlText.includes("NumPy einsum") && (await page.getByTestId("docs-books").count()) === 0,
    "DeepLearning drawer has no NumPy chapters",
  );
  check((await page.getByTestId("study-mode-leetcode").count()) === 0, "DeepLearning still hides LeetCode");
  await page.getByTestId("lang-numpy").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/numpy-zh-dl.png` });

  await page.getByTestId("locale-en").click();
  await page.waitForFunction(() => (document.querySelector('[data-testid="docs-drawer"]')?.textContent ?? "").includes("Installation"));
  const enDl = await page.getByTestId("docs-drawer").innerText();
  check(enDl.includes("Installation") && !enDl.includes("Creating arrays"), "English DeepLearning drawer has no NumPy chapters");
  await page.getByTestId("lang-numpy").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/numpy-en-dl.png` });

  await page.evaluate(() => performance.clearResourceTimings());
  await page.getByTestId("lang-np").click();
  await page.waitForSelector('[data-testid="lang-np"][aria-current="true"]');
  await page.waitForFunction(() => (document.querySelector('[data-testid="docs-title"]')?.textContent ?? "").includes("NumPy"));
  const en = await runOverview(page, "3 16");
  const again = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => name.includes("/wasm/pyodide/")),
  );
  check(again.length === 0, `switching back does not download Pyodide again (${again.length})`);
  const still = await page.locator('[data-testid^="lang-"][aria-current="true"]').getAttribute("data-testid");
  check(en.status === "done" && en.out.includes("3 16"), `English NumPy fence ${en.status} ${JSON.stringify(en.out.trim().slice(-120))}`);
  check(still === "lang-np", `English fence stays on NumPy (${still})`);
  const enLabel = await page.getByTestId("lang-np").innerText();
  check(enLabel.includes("NumPy") && !enLabel.includes("DeepLearning"), `English sidebar label ${JSON.stringify(enLabel)}`);
  await page.getByTestId("lang-np").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/numpy-en-run.png` });
} finally {
  await browser.close().catch(() => {});
  stop();
}

if (failed) {
  console.error(`${failed} numpy fence check(s) failed`);
  process.exit(1);
}
console.log("numpy fence checks passed");
