import { createRequire } from "module";
import type * as m from "./types.js";

export * from "./types.js";

const require = createRequire(import.meta.url);
const mmd = require("./build/napi/Release/mmd-js.node") as typeof m;

export const parse = (input: Buffer): m.Node => mmd.parse(input);
export const ready = () => Promise.resolve();
export const read = (input: Buffer, node: m.Node) =>
  input.subarray(node.start, node.start + node.len).toString();
export const readTitle = (input: Buffer, node: m.Node) =>
  read(input, node)
    .replace(/^\s*#+\s*/, "")
    .replace(/\s*#+\s*$/, "");

export const walk = (
  node: m.Node,
  fn: (node: m.Node) => void | { stopWalking: boolean }
) => {
  if (fn(node)?.stopWalking) {
    return;
  }

  if (node.child) {
    walk(node.child, fn);
  }

  if (node.content) {
    walk(node.content, fn);
  }

  if (node.next) {
    walk(node.next, fn);
  }
};
