import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import * as native from "../index.js";
import * as wasm from "../wasm.js";
import { normalizeNode } from "./helpers/normalize-node.mjs";
import { parseMmd7Ast } from "./helpers/parse-mmd7-ast.mjs";

const fixturePath = "packages/MultiMarkdown-7/tests/MMD7Tests/Integrated.text";
const astPath = "packages/MultiMarkdown-7/tests/MMD7Tests/Integrated.ast";

async function readFixture() {
  return readFile(fixturePath);
}

async function readExpectedAst() {
  return normalizeNode(parseMmd7Ast(await readFile(astPath, "utf8")));
}

function normalizeForUpstream(node) {
  if (!node) return null;
  const copy = { type: node.type, start: node.start, len: node.len };
  if (node.child) copy.child = normalizeForUpstream(node.child);
  if (node.content) copy.content = normalizeForUpstream(node.content);
  if (node.next) copy.next = normalizeForUpstream(node.next);
  return copy;
}

test("native parser matches the MMD7 Integrated.ast fixture", async () => {
  const fixture = await readFixture();
  const expected = normalizeForUpstream(parseMmd7Ast(await readFile(astPath, "utf8")));
  const actual = normalizeForUpstream(native.parse(fixture));

  assert.deepStrictEqual(actual, expected);

});

test("Node-loaded WASM parser matches native MMD7 Integrated.text output", async () => {
  const fixture = await readFixture();
  const nativeActual = normalizeNode(native.parse(fixture));

  await wasm.load(resolve("mmd.wasm"));
  const wasmActual = normalizeNode(
    wasm.parse(fixture.buffer.slice(fixture.byteOffset, fixture.byteOffset + fixture.byteLength))
  );

  assert.deepStrictEqual(wasmActual, nativeActual);
});
