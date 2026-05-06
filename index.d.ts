/// <reference types="node" />
import type * as m from "./types.js";
export * from "./types.js";
export declare const parse: (input: Buffer) => m.Node;
export declare const ready: () => Promise<void>;
export declare const read: (input: Buffer, node: m.Node) => string;
export declare const readTitle: (input: Buffer, node: m.Node) => string;
export declare const walk: (node: m.Node, fn: (node: m.Node) => void | {
    stopWalking: boolean;
}) => void;
