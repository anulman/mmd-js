import assert from "node:assert/strict";
import { copyFile, lstat, mkdir, readFile, realpath } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const demoDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(demoDir, "..");
const resolvedPackageJson = fileURLToPath(import.meta.resolve("mmd-js/package.json"));
const packageDir = dirname(resolvedPackageJson);
const stat = await lstat(packageDir);
const actualPackageDir = stat.isSymbolicLink() ? await realpath(packageDir) : packageDir;
const actualPackageJson = JSON.parse(await readFile(resolvedPackageJson, "utf8"));

assert.equal(actualPackageJson.name, "mmd-js", "demo resolved an unexpected package name");
await mkdir(actualPackageDir, { recursive: true });

// Vercel builds from a clean checkout with `demo` as the root directory.
// The demo depends on the local parent package via `file:..`, but that package
// intentionally does not track generated root JS/d.ts build artifacts. Generate
// the TypeScript entrypoints into the installed local file dependency snapshot
// so Next can resolve `mmd-js/wasm.js` without committing root package outputs.
execFileSync(
  "pnpm",
  [
    "exec",
    "tsc",
    "-p",
    repoRoot,
    "--noEmit",
    "false",
    "--declaration",
    "true",
    "--outDir",
    actualPackageDir,
  ],
  { cwd: demoDir, stdio: "inherit" },
);

// Emscripten is not available in Vercel's normal Next build. Keep the demo's
// browser WASM runtime as a deploy asset and copy only the glue module into the
// local package snapshot that Next resolves.
await copyFile(resolve(demoDir, "public/mmd.wasm.js"), resolve(actualPackageDir, "mmd.wasm.js"));

console.log(`prepared local mmd-js package for demo build at ${actualPackageDir}`);
