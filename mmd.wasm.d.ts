import type { Node } from "./types.js";

export type MmdWasmModule = {
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  _parse: (inputPtr: number, inputLen: number) => number;
  HEAPU8: Uint8Array;
  rootNode: Node | null;
  nodeObjectMap: Map<number, Node>;
};

export type MmdWasmOptions = {
  arguments?: string[];
  rootNode?: Node | null;
  nodeObjectMap?: Map<number, Node>;
  locateFile?: (path: string) => string;
};

declare const Mmd: (options?: MmdWasmOptions) => Promise<MmdWasmModule>;

export default Mmd;
