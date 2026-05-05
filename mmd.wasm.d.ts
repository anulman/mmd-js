import type { Token } from "./types.js";

export type MmdWasmModule = {
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  _parse: (inputPtr: number) => Token;
  HEAPU8: Uint8Array;
  rootToken: Token | null;
  tokenObjectMap: Map<number, Token>;
};

export type MmdWasmOptions = {
  arguments?: string[];
  rootToken?: Token | null;
  tokenObjectMap?: Map<number, Token>;
  locateFile?: (path: string) => string;
};

declare const Mmd: (options?: MmdWasmOptions) => Promise<MmdWasmModule>;

export default Mmd;
