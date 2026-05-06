import { createRequire } from "module";
export * from "./types.js";
const require = createRequire(import.meta.url);
const mmd = require("./build/napi/Release/mmd-js.node");
export const parse = (input) => mmd.parse(input);
export const ready = () => Promise.resolve();
export const read = (input, node) => input.subarray(node.start, node.start + node.len).toString();
export const readTitle = (input, node) => read(input, node)
    .replace(/^\s*#+\s*/, "")
    .replace(/\s*#+\s*$/, "");
export const walk = (node, fn) => {
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
