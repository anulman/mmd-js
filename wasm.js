import Mmd from "./mmd.wasm.js";
export * from "./types.js";
const defaultDecoder = new TextDecoder();
const nodeObjectMap = new Map();
let _wasm;
let _wasmPromise;
export const load = async (locateFile) => {
    if (_wasm) {
        console.warn("wasm already loaded; returning cached instance");
        return _wasm;
    }
    if (_wasmPromise) {
        return _wasmPromise;
    }
    _wasmPromise = Mmd({
        arguments: [],
        rootNode: null,
        nodeObjectMap,
        locateFile: typeof locateFile === "string" ? () => locateFile : locateFile,
    });
    _wasmPromise
        .then((wasm) => {
        _wasm = wasm;
        _wasmPromise = undefined;
    })
        .catch(() => {
        _wasmPromise = undefined;
    });
    return _wasmPromise;
};
export const ready = async () => _wasm ?? _wasmPromise ?? Promise.reject("wasm not loaded nor loading");
export const parse = (input) => {
    if (!_wasm) {
        throw new Error("load() must be called && complete before calling parse()");
    }
    const dataPtr = _wasm._malloc(input.byteLength + 1);
    const dataOnHeap = new Uint8Array(_wasm.HEAPU8.buffer, dataPtr, input.byteLength + 1);
    dataOnHeap.set(new Uint8Array(input));
    dataOnHeap.set(new Uint8Array([0]), input.byteLength);
    const result = _wasm._parse(dataOnHeap.byteOffset, input.byteLength);
    _wasm._free(dataPtr);
    const root = _wasm.rootNode;
    _wasm.rootNode = null;
    _wasm.nodeObjectMap.clear();
    if (result !== 0 || !root) {
        throw new Error("root node not found");
    }
    return root;
};
export const read = (input, node, decoder = defaultDecoder) => decoder.decode(input.slice(node.start, node.start + node.len));
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
