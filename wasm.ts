import type * as m from "./types.js";
import Mmd from "./mmd.wasm.js";

export type Wasm = {
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  _parse: (inputPtr: number) => m.Token;
  HEAPU8: Uint8Array;
  rootToken: m.Token | null;
  tokenObjectMap: Map<number, m.Token>;
};

const decoder = new TextDecoder();
const tokenObjectMap: Map<number, m.Token> = new Map();

let _wasm: Wasm;
let _wasmPromise: undefined | Promise<Wasm>;

export const load = async (locateFile: string | ((path: string) => string)) => {
  if (_wasm) {
    console.warn("wasm already loaded; returning cached instance");

    return _wasm;
  }

  if (_wasmPromise) {
    return _wasmPromise;
  }

  _wasmPromise = Mmd({
    arguments: [],
    rootToken: null,
    tokenObjectMap,
    locateFile: typeof locateFile === "string" ? () => locateFile : locateFile,
  });

  _wasmPromise!
    .then((wasm) => {
      _wasm = wasm;
      _wasmPromise = undefined;
    })
    .catch(() => {
      _wasmPromise = undefined;
    });

  return _wasmPromise;
};

export const ready = async () =>
  _wasm ?? _wasmPromise ?? Promise.reject("wasm not loaded nor loading");

export const parse = (input: ArrayBuffer): m.Token => {
  if (!_wasm) {
    throw new Error("load() must be called && complete before calling parse()");
  }

  const dataPtr = _wasm._malloc(input.byteLength + 1);
  const dataOnHeap = new Uint8Array(
    _wasm.HEAPU8.buffer,
    dataPtr,
    input.byteLength + 1
  );

  dataOnHeap.set(new Uint8Array(input));
  dataOnHeap.set(new Uint8Array([0]), input.byteLength);

  _wasm._parse(dataOnHeap.byteOffset);
  _wasm._free(dataPtr);

  const root = _wasm.rootToken;
  _wasm.rootToken = null;
  _wasm.tokenObjectMap.clear();

  if (!root) {
    throw new Error("root token not found");
  }

  return root;
};

export const read = (input: ArrayBuffer, token: m.Token) =>
  decoder.decode(input.slice(token.start, token.start + token.len));

export const readTitle = (input: ArrayBuffer, token: m.Token) =>
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
