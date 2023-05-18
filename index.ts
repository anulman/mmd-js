import bindings from "bindings";
import type * as m from "./types.js";

const mmd = bindings("mmd-js");

export const parse = (input: Buffer): m.Token => mmd.parse(input);
export const ready = () => Promise.resolve();
export const read = (input: Buffer, token: m.Token) =>
  input.subarray(token.start, token.start + token.len).toString();
export const readTitle = (input: Buffer, token: m.Token) =>
  read(input, token)
    .replace(/^\s*#+\s*/, "")
    .replace(/\s*#+\s*$/, "");

export const walk = (
  token: m.Token,
  fn: (token: m.Token) => void | { stopWalking: boolean }
) => {
  if (fn(token)?.stopWalking) {
    return;
  }

  if (token.child) {
    walk(token.child, fn);
  }

  if (token.next) {
    walk(token.next, fn);
  }
};
