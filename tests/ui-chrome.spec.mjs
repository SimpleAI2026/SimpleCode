#!/usr/bin/env node
// About dialog, locale persistence, English Quick Start, progress bar on the button edge.
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = Number(process.env.UI_PORT ?? 4325);
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

async function openAbout(page) {
  await page.getByTestId("about-button").click();
  await page.getByTestId("about-dialog").waitFor();
}

async function checkRepoLink(page, label) {
  const link = page.getByTestId("about-repo");
  const href = await link.getAttribute("href");
  const target = await link.getAttribute("target");
  const rel = await link.getAttribute("rel");
  const text = (await link.innerText()).trim();
  check(
    href === "https://github.com/linkxzhou/SimpleCode" && target === "_blank" && rel === "noopener noreferrer" && text === label,
    `about repo link (${label})`,
  );
}

await waitForServer();
const browser = await launchBrowser();
try {
  const page = await (await browser.newContext()).newPage();
  await page.goto(BASE);
  await page.getByTestId("sidebar-title").waitFor();

  await openAbout(page);
  const zh = await page.getByTestId("about-dialog").innerText();
  check(zh.includes("Linux") && zh.includes("Rust") && zh.includes("Monaco") && zh.includes("Cache API") && zh.includes("快速入门"), "about dialog in Chinese");
  await checkRepoLink(page, "GitHub 仓库");
  await page.keyboard.press("Escape");
  await page.getByTestId("about-dialog").waitFor({ state: "hidden" });
  check(true, "about dialog closes");

  await page.getByTestId("locale-en").click();
  await openAbout(page);
  const en = await page.getByTestId("about-dialog").innerText();
  check(
    en.includes("Fifteen languages") && en.includes("NumPy") && en.includes("DeepLearning") && en.includes("Linux") && en.includes("Rust") && en.includes("Java") && en.includes("Monaco") && en.includes("Quick Start"),
    "about dialog in English",
  );
  await checkRepoLink(page, "GitHub repository");
  await page.keyboard.press("Escape");

  await page.reload();
  await page.getByTestId("locale-en").waitFor();
  const pressed = await page.getByTestId("locale-en").getAttribute("aria-pressed");
  const stored = await page.evaluate(() => localStorage.getItem("simplecode:locale"));
  check(pressed === "true" && stored === "en", `locale persisted (${pressed}, ${stored})`);

  await page.getByTestId("study-mode-learn").click();
  await page.getByTestId("docs-search").waitFor();
  check((await page.getByTestId("docs-en-placeholder").count()) === 0, "English Python book has no placeholder");
  const toc = await page.getByTestId("docs-drawer").innerText();
  check(toc.includes("Python Environment Setup"), "English chapter titles in the table of contents");
  await page.getByTestId("chapter-link").first().click();
  const chapterRoot = page.getByTestId("docs-chapter");
  await chapterRoot.locator("[data-testid=doc-code-block]").first().waitFor();
  const chapter = await chapterRoot.innerText();
  check(chapter.includes("Python Tutorial") && chapter.includes("print"), "English chapter body");
  await page.getByTestId("docs-close").click();

  await page.getByTestId("sidebar-toggle").click();
  await page.waitForFunction(() => document.querySelector("[data-testid=sidebar]")?.getAttribute("data-collapsed") === "true");
  check((await page.getByTestId("about-button").count()) === 1, "about button remains when collapsed");
  await openAbout(page);
  check(await page.getByTestId("about-dialog").isVisible(), "about dialog opens from the collapsed sidebar");
  await page.close();

  const context = await browser.newContext();
  const progressPage = await context.newPage();
  let release = () => {};
  const held = new Promise((resolve) => {
    release = resolve;
  });
  await progressPage.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.includes("/wasm/") && !url.includes("manifest.json")) {
      await held;
      try {
        await route.abort();
      } catch {
        /* page already closed */
      }
      return;
    }
    await route.continue();
  });
  try {
    await progressPage.goto(BASE);
    const bar = progressPage.getByTestId("wasm-progress");
    await bar.waitFor({ state: "visible", timeout: 8000 });
    const box = await bar.evaluate((el) => {
      const button = el.closest("button");
      const barRect = el.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
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
      `progress bar on button bottom edge ${JSON.stringify(box)}`,
    );
  } finally {
    release();
    await progressPage.close().catch(() => {});
    await context.close().catch(() => {});
  }
} finally {
  await browser.close().catch(() => {});
  stop();
}

if (failed) {
  console.error(`${failed} ui chrome check(s) failed`);
  process.exit(1);
}
console.log("✓ ui chrome checks passed");
