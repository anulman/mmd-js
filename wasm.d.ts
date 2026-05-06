import type * as m from "./types.js";
export * from "./types.js";
export type Wasm = {
    _malloc: (size: number) => number;
    _free: (ptr: number) => void;
    _parse: (inputPtr: number, inputLen: number) => number;
    HEAPU8: Uint8Array;
    rootNode: m.Node | null;
    nodeObjectMap: Map<number, m.Node>;
};
export declare const load: (locateFile?: string | ((path: string) => string) | undefined) => Promise<Wasm>;
export declare const ready: () => Promise<Wasm>;
export declare const parse: (input: ArrayBuffer) => m.Node;
export declare const read: (input: ArrayBuffer, node: m.Node, decoder?: TextDecoder) => string;
export declare const readTitle: (input: ArrayBuffer, node: m.Node) => string;
export declare const walk: (node: m.Node, fn: (node: m.Node) => void | {
    stopWalking: boolean;
}) => void;
