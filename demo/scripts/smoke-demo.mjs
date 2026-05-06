import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const chromiumExecutable = process.env.CHROMIUM_BIN ?? [
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
].find((candidate) => existsSync(candidate));

if (!chromiumExecutable) {
  throw new Error("Set CHROMIUM_BIN to a Chromium/Chrome executable");
}

const port = Number(process.env.PORT ?? 3123);
const child = spawn("corepack", ["pnpm@8.15.9", "start", "--", "-p", String(port)], {
  cwd: new URL("..", import.meta.url),
  detached: true,
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
child.stdout.setEncoding("utf8").on("data", (chunk) => (serverOutput += chunk));
child.stderr.setEncoding("utf8").on("data", (chunk) => (serverOutput += chunk));

const stopServer = () => {
  if (!child.killed) {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
};

process.on("exit", stopServer);
process.on("SIGINT", () => {
  stopServer();
  process.exit(130);
});

try {
  await waitForServer(`http://127.0.0.1:${port}/`);

  const browser = await chromium.launch({ executablePath: chromiumExecutable, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const consoleMessages = [];
  const pageErrors = [];
  const badResponses = [];
  const wasmResponses = [];

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      const location = message.location();
      consoleMessages.push(`${message.type()}: ${message.text()} @ ${location.url}:${location.lineNumber}:${location.columnNumber}`);
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.stack ?? String(error)));
  page.on("response", (response) => {
    const pathname = new URL(response.url()).pathname;
    if (pathname === "/mmd.wasm") {
      wasmResponses.push(response.status());
    }
    if (response.status() >= 400) {
      badResponses.push(`${response.status()} ${pathname}`);
    }
  });

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Parse sample" }).click();
  await page.getByRole("heading", { name: "MMD7 Demo Smoke" }).waitFor();

  await assertVisibleText(page, "MMD7 WASM loaded from /mmd.wasm");
  await assertVisibleText(page, "First Section");
  await assertVisibleText(page, "This section was parsed by the MMD7 WASM AST.");
  await assertVisibleText(page, "Second Section");
  await assertVisibleText(page, "The browser demo is using the local mmd-js package.");

  assert.deepEqual(pageErrors, [], "browser page errors");
  assert.deepEqual(badResponses, [], "browser HTTP errors");
  assert.deepEqual(consoleMessages, [], "browser console warnings/errors");
  assert.ok(wasmResponses.includes(200), `expected /mmd.wasm 200 response, saw ${wasmResponses.join(", ") || "none"}`);

  await browser.close();
  console.log("demo smoke passed");
} finally {
  stopServer();
}

async function assertVisibleText(page, text) {
  await page.getByText(text, { exact: true }).waitFor();
}

async function waitForServer(url) {
  const deadline = Date.now() + 30_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}\n${lastError?.stack ?? lastError}\n${serverOutput}`);
}
