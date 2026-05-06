import assert from "node:assert/strict";
import { lstat, realpath, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const demoDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(demoDir, "..");
const pkg = JSON.parse(await readFile(resolve(demoDir, "package.json"), "utf8"));
const lockfile = await readFile(resolve(demoDir, "pnpm-lock.yaml"), "utf8");

assert.equal(pkg.dependencies["mmd-js"], "file:..", "demo must depend on the local package via file:..");
assert.match(lockfile, /mmd-js:\s*\n\s*specifier: file:\.\./, "lockfile importer must pin mmd-js to file:..");
assert.match(lockfile, /file:\.\./, "lockfile must resolve mmd-js from the local parent package");

const resolvedPackageJson = fileURLToPath(import.meta.resolve("mmd-js/package.json"));
const packageDir = dirname(resolvedPackageJson);
const stat = await lstat(packageDir);
const actualPackageDir = stat.isSymbolicLink() ? await realpath(packageDir) : packageDir;
const actualPackageJson = JSON.parse(await readFile(resolvedPackageJson, "utf8"));

assert.equal(actualPackageJson.name, "mmd-js", "demo resolved an unexpected package name");
assert.equal(actualPackageJson.version, "0.3.0", "demo resolved an unexpected mmd-js version");
assert.match(
  actualPackageDir,
  /node_modules[/\\]\.pnpm[/\\]file\+\.\.[/\\]node_modules[/\\]mmd-js$/,
  `demo resolved mmd-js from ${actualPackageDir}, expected pnpm's local file:.. package store`
);

console.log(`mmd-js local file dependency verified from ${repoRoot}: ${actualPackageDir}`);
