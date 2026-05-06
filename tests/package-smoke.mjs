import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const work = mkdtempSync(path.join(tmpdir(), "mmd-js-pack-smoke-"));

const run = (cmd, args, cwd = root) =>
  execFileSync(cmd, args, { cwd, stdio: "inherit", env: process.env });

try {
  const packOutput = execFileSync("npm", ["pack", "--json"], {
    cwd: root,
    encoding: "utf8",
    env: process.env,
  });
  // npm includes lifecycle script output before the JSON when prepack runs.
  const jsonStart = packOutput.lastIndexOf("[\n  {");
  assert.notEqual(jsonStart, -1, `could not find npm pack JSON in output:\n${packOutput}`);
  const [{ filename, files }] = JSON.parse(packOutput.slice(jsonStart));
  const packedFiles = new Set(files.map((file) => file.path));

  for (const required of [
    "index.js",
    "index.d.ts",
    "types.js",
    "types.d.ts",
    "wasm.js",
    "wasm.d.ts",
    "mmd.wasm.js",
    "mmd.wasm",
    "mmd.wasm.d.ts",
    "packages/MultiMarkdown-7/CMakeLists.txt",
    "packages/MultiMarkdown-7/LICENSE",
    "packages/MultiMarkdown-7/src/libMultiMarkdown7.h",
    "packages/MultiMarkdown-7/templates/version.h.in",
    "packages/napi/mmd.cpp",
  ]) {
    assert.ok(packedFiles.has(required), `npm package is missing ${required}`);
  }

  for (const excludedPrefix of [
    "packages/MultiMarkdown-7/tests/",
    "packages/MultiMarkdown-7/test/",
  ]) {
    assert.ok(
      !files.some((file) => file.path.startsWith(excludedPrefix)),
      `npm package should not include ${excludedPrefix}`
    );
  }

  run("npm", ["init", "-y"], work);
  run("npm", ["install", path.join(root, filename)], work);

  const smokeScript = path.join(work, "smoke.mjs");
  await import("node:fs").then(({ writeFileSync }) =>
    writeFileSync(
      smokeScript,
      `
        import assert from "node:assert/strict";
        import path from "node:path";
        import { createRequire } from "node:module";
        import { pathToFileURL } from "node:url";
        import * as native from "mmd-js";
        import * as wasm from "mmd-js/wasm.js";

        const input = Buffer.from("# Pack Smoke\\n\\nPublished package smoke test.\\n");
        const nativeRoot = native.parse(input);
        assert.equal(native.readTitle(input, nativeRoot.child).trim(), "Pack Smoke");

        const require = createRequire(import.meta.url);
        const packageJson = require.resolve("mmd-js/package.json");
        const wasmUrl = pathToFileURL(path.join(path.dirname(packageJson), "mmd.wasm")).href;
        await wasm.load(() => wasmUrl);
        const wasmRoot = wasm.parse(new Uint8Array(input).buffer);
        assert.equal(wasm.readTitle(input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength), wasmRoot.child).trim(), "Pack Smoke");
      `,
    ),
  );
  run(process.execPath, [smokeScript], work);
  console.log("package smoke passed");
} finally {
  rmSync(work, { recursive: true, force: true });
}
