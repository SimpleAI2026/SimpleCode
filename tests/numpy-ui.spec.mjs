#!/usr/bin/env node
// DeepLearning sidebar row: label, progress bar on the button edge, its own drawer, terminal reset.
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = Number(process.env.NUMPY_UI_PORT ?? 4328);
const BASE = `http://127.0.0.1:${PORT}`;

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
    console.log(`✗ ${message}`);
  } else console.log(`✓ ${message}`);
}

await waitForServer();
const browser = await launchBrowser();
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  let release = () => {};
  const held = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.includes("/wasm/pyodide/")) {
      await held;
      try {
        await route.abort();
      } catch {
        /* closed */
      }
      return;
    }
    await route.continue();
  });
  await page.goto(BASE);
  await page.getByTestId("lang-numpy").click();
  check((await page.getByTestId("study-mode-leetcode").count()) === 0, "DeepLearning hides the LeetCode button");
  check((await page.getByTestId("study-mode").count()) === 1, "study mode group stays");
  check((await page.getByTestId("study-mode-learn").count()) === 1, "DeepLearning keeps Quick Start");
  const button = page.getByTestId("lang-numpy");
  await button.waitFor();
  const label = await button.innerText();
  check(label.includes("DeepLearning") && label.includes("Python (NumPy)"), `sidebar label ${JSON.stringify(label)}`);
  const bar = button.getByTestId("wasm-progress");
  await bar.waitFor({ state: "visible", timeout: 8000 });
  const box = await bar.evaluate((el) => {
    const host = el.closest("button");
    const barRect = el.getBoundingClientRect();
    const buttonRect = host.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      marginTop: style.marginTop,
      marginBottom: style.marginBottom,
      bottomDelta: Math.abs(barRect.bottom - buttonRect.bottom),
      leftDelta: Math.abs(barRect.left - buttonRect.left),
      widthDelta: Math.abs(barRect.width - buttonRect.width),
      height: barRect.height,
    };
  });
  check(
    box.marginTop === "0px" &&
      box.marginBottom === "0px" &&
      box.bottomDelta < 1 &&
      box.leftDelta < 1 &&
      box.widthDelta < 1 &&
      box.height > 0 &&
      box.height <= 4,
    `numpy progress bar on the button edge ${JSON.stringify(box)}`,
  );
  release();
  await page.close();
  await context.close();

  const page2 = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await page2.goto(BASE);
  await page2.getByTestId("lang-numpy").click();
  await page2.waitForFunction(() => {
    const text = globalThis.__simplecodeTerminal?.transcript ?? "";
    return text.includes("DeepLearning");
  });
  await page2.getByTestId("lang-ruby").click();
  await page2.waitForFunction(() => {
    const text = globalThis.__simplecodeTerminal?.transcript ?? "";
    return text.includes("Ruby") && !text.includes("DeepLearning");
  });
  check(true, "switching away from DeepLearning clears the terminal");

  await page2.getByTestId("lang-numpy").click();
  check((await page2.getByTestId("study-mode-leetcode").count()) === 0, "DeepLearning hides LeetCode");
  await page2.getByTestId("study-mode-learn").click();
  await page2.getByTestId("docs-drawer").waitFor();
  await page2.waitForFunction(() => (document.querySelector('[data-testid="docs-drawer"]')?.textContent ?? "").includes("安装"));
  check((await page2.getByTestId("docs-books").count()) === 0, "DeepLearning has no book switcher");
  const dlToc = await page2.getByTestId("docs-drawer").innerText();
  check(dlToc.includes("安装") && !dlToc.includes("创建数组") && !dlToc.includes("NumPy einsum"), `DeepLearning drawer ${JSON.stringify(dlToc.slice(0, 180))}`);
  check((await page2.getByTestId("study-mode-leetcode").count()) === 0, "DeepLearning drawer keeps LeetCode hidden");

  await page2.getByTestId("lang-np").click();
  const npLabel = await page2.getByTestId("lang-np").innerText();
  check(npLabel.includes("NumPy") && !npLabel.includes("DeepLearning"), `NumPy label ${JSON.stringify(npLabel)}`);
  check((await page2.getByTestId("study-mode-leetcode").count()) === 0, "NumPy hides LeetCode");
  await page2.waitForFunction(() => (document.querySelector('[data-testid="docs-drawer"]')?.textContent ?? "").includes("创建数组"));
  const npToc = await page2.getByTestId("docs-drawer").innerText();
  check(npToc.includes("NumPy") && npToc.includes("创建数组") && !npToc.includes("安装"), `NumPy drawer ${JSON.stringify(npToc.slice(0, 180))}`);
  check((await page2.getByTestId("docs-books").count()) === 0, "NumPy has no book switcher");

  await page2.getByTestId("locale-en").click();
  await page2.waitForFunction(() => (document.querySelector('[data-testid="docs-drawer"]')?.textContent ?? "").includes("Creating arrays"));
  const enLabel = await page2.getByTestId("lang-np").innerText();
  check(enLabel.includes("NumPy") && !enLabel.includes("DeepLearning"), `English NumPy label ${JSON.stringify(enLabel)}`);
  const enNp = await page2.getByTestId("docs-drawer").innerText();
  check(enNp.includes("Creating arrays") && !enNp.includes("Installation"), `English NumPy drawer ${JSON.stringify(enNp.slice(0, 180))}`);
  await page2.getByTestId("lang-numpy").click();
  await page2.waitForFunction(() => (document.querySelector('[data-testid="docs-drawer"]')?.textContent ?? "").includes("Installation"));
  const enDlLabel = await page2.getByTestId("lang-numpy").innerText();
  check(enDlLabel.includes("DeepLearning") && enDlLabel.includes("Python (NumPy)"), `English DeepLearning label ${JSON.stringify(enDlLabel)}`);
  const enDl = await page2.getByTestId("docs-drawer").innerText();
  check(enDl.includes("Installation") && !enDl.includes("Creating arrays"), `English DeepLearning drawer ${JSON.stringify(enDl.slice(0, 180))}`);
  await page2.getByTestId("lang-ruby").click();
  await page2.waitForFunction(() => document.querySelector('[data-testid="lang-ruby"]')?.getAttribute("aria-current") === "true");
  check((await page2.getByTestId("study-mode-leetcode").count()) === 1, "LeetCode button returns on Ruby");
  await page2.close();
} finally {
  await browser.close().catch(() => {});
  stop();
}

if (failed) {
  console.error(`${failed} numpy ui check(s) failed`);
  process.exit(1);
}
console.log("✓ numpy ui checks passed");
