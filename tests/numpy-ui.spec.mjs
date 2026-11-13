#!/usr/bin/env node
// DeepLearning sidebar row: label, progress bar on the button edge, book switcher, terminal reset.
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
  check((await page2.getByTestId("study-mode-leetcode").count()) === 0, "DeepLearning hides LeetCode while the book switcher is used");
  await page2.getByTestId("study-mode-learn").click();
  await page2.getByTestId("docs-books").waitFor();
  const books = await page2.getByTestId("docs-books").innerText();
  check(books.includes("DeepLearning") && books.includes("NumPy"), `book switcher ${JSON.stringify(books)}`);
  await page2.getByTestId("docs-book-numpy").click();
  await page2.getByTestId("docs-drawer").waitFor();
  const toc = await page2.getByTestId("docs-drawer").innerText();
  check(toc.includes("NumPy"), "NumPy quick start opens from the switcher");
  await page2.getByTestId("docs-book-dl").click();
  await page2.waitForFunction(() => document.querySelector('[data-testid="docs-book-dl"]')?.getAttribute("aria-pressed") === "true");
  check((await page2.getByTestId("study-mode-leetcode").count()) === 0, "switching DeepLearning books keeps LeetCode hidden");

  await page2.getByTestId("locale-en").click();
  const enLabel = await page2.getByTestId("lang-numpy").innerText();
  check(enLabel.includes("DeepLearning") && enLabel.includes("Python (NumPy)"), `English label ${JSON.stringify(enLabel)}`);
  const enBooks = await page2.getByTestId("docs-books").innerText();
  check(enBooks.includes("DeepLearning") && enBooks.includes("NumPy"), `English books ${JSON.stringify(enBooks)}`);
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
