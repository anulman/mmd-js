import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import * as native from "../index.js";
import * as wasm from "../wasm.js";
import { normalizeToken } from "./helpers/normalize-token.mjs";

const fixturePath = "packages/MultiMarkdown-6/tests/MMD6Tests/Integrated.text";
const snapshotPath = "tests/fixtures/mmd6-integrated.snapshot.json";

async function readFixture() {
  return readFile(fixturePath);
}

async function readSnapshot() {
  return JSON.parse(await readFile(snapshotPath, "utf8"));
}

test("native parser matches the MMD6 Integrated.text characterization", async () => {
  const fixture = await readFixture();
  const expected = await readSnapshot();

  // The native addon currently consumes a C string. Add an explicit NUL byte so
  // the fixture is parsed deterministically instead of relying on Buffer slack.
  const actual = normalizeToken(native.parse(Buffer.concat([fixture, Buffer.of(0)])));

  assert.deepStrictEqual(actual, expected);
});

test("Node-loaded WASM parser matches the MMD6 Integrated.text characterization", async () => {
  const fixture = await readFixture();
  const expected = await readSnapshot();

  await wasm.load(resolve("mmd.wasm"));
  const actual = normalizeToken(
    wasm.parse(fixture.buffer.slice(fixture.byteOffset, fixture.byteOffset + fixture.byteLength))
  );

  assert.deepStrictEqual(actual, expected);
});
