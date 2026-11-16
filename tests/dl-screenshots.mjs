#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 4391;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = "/opt/cursor/artifacts/screenshots";
mkdirSync(OUT, { recursive: true });

const server = spawn("yarn", ["vite", "preview", "--host", "127.0.0.1", "--port", String(PORT), "--strictPort"], {
  stdio: ["ignore", "pipe", "pipe"],
  cwd: "/workspace",
});
const stop = () => {
  try {
    server.kill("SIGTERM");
  } catch {
    /* gone */
  }
};
process.on("exit", stop);

async function waitForServer() {
  for (let i = 0; i < 150; i++) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("preview did not start");
}

const browser = await chromium
  .launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
  .catch(() => chromium.launch({ channel: "chrome" }));

try {
  await waitForServer();

  const progress = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await progress.newPage();
  let release = () => {};
  const held = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.includes("/wasm/pyodide/")) {
      await new Promise((r) => setTimeout(r, 400));
      await held;
      await route.continue();
      return;
    }
    await route.continue();
  });
  await page.goto(BASE);
  await page.getByTestId("lang-dl").click();
  await page.getByTestId("lang-dl").getByTestId("wasm-progress").waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/dl-sidebar-progress.png` });
  release();
  await page.close();
  await progress.close();

  const main = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const app = await main.newPage();
  await app.goto(BASE);
  await app.evaluate((id) => globalThis.__simplecodeSelect(id), "numpy");
  await app.waitForSelector('[data-testid="lang-dl"][data-status="ready"]', { timeout: 180000 });
  await app.evaluate((id) => globalThis.__simplecodeSelect(id), "np");
  await app.waitForSelector('[data-testid="lang-np"][data-status="ready"]', { timeout: 180000 });
  await app.getByTestId("study-mode-learn").click();
  await app.getByTestId("chapter-link").nth(1).click();
  await app.locator('[data-testid="docs-chapter"] [data-testid="doc-code-block"]').first().waitFor();
  await app.screenshot({ path: `${OUT}/numpy-tutorial.png` });

  const code = `from minitorch import nn, optim, tensor, cross_entropy, datasets
xtr, ytr, xte, yte = datasets.fashion_mnist(n_train=600, n_test=200)
net = nn.Sequential(nn.Linear(784, 32), nn.ReLU(), nn.Linear(32, 10))
for param in net.parameters():
    flat = param.data.reshape(-1)
    for i in range(flat.size):
        bit = (i * 1103515245 + 12345) & 0x7FFFFFFF
        flat[i] = ((bit % 10000) / 10000.0 - 0.5) * 0.08
opt = optim.SGD(net.parameters(), lr=0.5)
loss = None
for epoch in range(3):
    for start in range(0, xtr.shape[0], 80):
        opt.zero_grad()
        logits = net(tensor(xtr[start:start + 80]))
        loss = cross_entropy(logits, ytr[start:start + 80])
        loss.backward()
        opt.step()
    pred = net(tensor(xte)).data.argmax(axis=1)
    acc = float((pred == yte).mean())
    print("epoch", epoch, "loss", round(loss.item(), 4), "acc", round(acc, 3))
`;
  await app.evaluate((source) => globalThis.__simplecodeEditor.setValue(source), code);
  await app.evaluate(() => globalThis.__simplecodeRun({ source: "screenshot" }));
  await app.waitForFunction(
    () => {
      const status = document.querySelector('[data-testid="run-status"]')?.getAttribute("data-status") ?? "";
      const text = globalThis.__simplecodeTerminal?.transcript ?? "";
      return ["done", "failed", "crash"].includes(status) && text.includes("acc");
    },
    null,
    { timeout: 120000 },
  );
  await app.screenshot({ path: `${OUT}/dl-training.png` });

  await app.getByTestId("locale-en").click();
  await app.getByTestId("lang-dl").waitFor();
  await app.waitForFunction(() => (document.querySelector('[data-testid="lang-dl"]')?.textContent ?? "").includes("DeepLearning"));
  await app.screenshot({ path: `${OUT}/dl-english-ui.png` });
  await app.close();
  await main.close();
  console.log("screenshots written");
} finally {
  await browser.close().catch(() => {});
  stop();
}
