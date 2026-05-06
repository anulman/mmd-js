import assert from "node:assert/strict";
import { createServer } from "node:http";
import { extname, resolve } from "node:path";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import test from "node:test";

const chromium = process.env.CHROMIUM_BIN ?? [
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
].find((candidate) => existsSync(candidate));

if (!chromium) {
  throw new Error("Set CHROMIUM_BIN to a Chromium/Chrome executable");
}
const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".wasm", "application/wasm"],
]);

function serveRepo() {
  const server = createServer(async (req, res) => {
    try {
      if (req.url === "/") {
        res.setHeader("content-type", "text/html; charset=utf-8");
        res.end(`<!doctype html><body>pending<script type="module">
          import * as mmd from "/wasm.js";
          try {
            await mmd.load("/mmd.wasm");
            const input = new TextEncoder().encode("# Browser smoke\\n\\nBody");
            const root = mmd.parse(input.buffer);
            document.body.textContent = root && root.type === 0 && root.len > 0 ? "PASS" : "FAIL: bad root";
          } catch (error) {
            document.body.textContent = "FAIL: " + (error && error.stack || error);
          }
        </script>`);
        return;
      }

      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      const filePath = resolve(pathname.slice(1));
      if (!filePath.startsWith(resolve("."))) {
        res.writeHead(403).end("forbidden");
        return;
      }

      res.setHeader("content-type", mime.get(extname(filePath)) ?? "application/octet-stream");
      res.end(await readFile(filePath));
    } catch (error) {
      res.writeHead(404).end(String(error));
    }
  });

  return new Promise((resolveServer) => {
    server.listen(0, "127.0.0.1", () => resolveServer(server));
  });
}

function dumpDom(url) {
  return new Promise((resolveDump, reject) => {
    const child = spawn(chromium, [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--dump-dom",
      url,
    ]);
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => (stdout += chunk));
    child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolveDump(stdout);
      } else {
        reject(new Error(`chromium exited ${code}\n${stderr}`));
      }
    });
  });
}

test("Chromium loads the browser WASM bundle and parses a tiny document", async (t) => {
  const server = await serveRepo();
  t.after(() => server.close());
  const { port } = server.address();
  const dom = await dumpDom(`http://127.0.0.1:${port}/`);
  assert.match(dom, /PASS/);
});
