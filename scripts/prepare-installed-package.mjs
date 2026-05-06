import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const writeIfMissing = (relativePath, content) => {
  const target = path.join(root, relativePath);
  if (!existsSync(target)) {
    writeFileSync(target, content);
    console.log(`created ${relativePath}`);
  }
};

const readIfExists = (relativePath) => {
  const target = path.join(root, relativePath);
  return existsSync(target) ? readFileSync(target, "utf8") : undefined;
};

const typesSource = readIfExists("types.ts") ?? readIfExists("types.d.ts") ?? "";
const enumBody = typesSource.match(/export enum Type \{([\s\S]*?)\n\}/)?.[1] ?? "";
const enumEntries = [];
for (const line of enumBody.split("\n")) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(-?\d+)\s*,?/);
  if (match) {
    enumEntries.push(`  ${match[1]}: ${match[2]}`);
  }
}

writeIfMissing(
  "types.js",
  `export const Type = Object.freeze({\n${enumEntries.join(",\n")}\n});\n`,
);

if (typesSource && !existsSync(path.join(root, "types.d.ts"))) {
  writeFileSync(path.join(root, "types.d.ts"), typesSource);
  console.log("created types.d.ts");
}

writeIfMissing(
  "index.js",
  `import { createRequire } from "node:module";\nimport path from "node:path";\nimport { fileURLToPath } from "node:url";\n\nexport * from "./types.js";\n\nconst require = createRequire(import.meta.url);\nconst root = path.dirname(fileURLToPath(import.meta.url));\nconst mmd = require("node-gyp-build")(root);\n\nexport const parse = (input) => mmd.parse(input);\nexport const ready = () => Promise.resolve();\nexport const read = (input, node) => Buffer.from(input).subarray(node.start, node.start + node.len).toString();\nexport const readTitle = (input, node) =>\n  read(input, node).replace(/^\\s*#+\\s*/, "").replace(/\\s*#+\\s*$/, "");\nexport const walk = (node, fn) => {\n  if (fn(node)?.stopWalking) return;\n  if (node.child) walk(node.child, fn);\n  if (node.content) walk(node.content, fn);\n  if (node.next) walk(node.next, fn);\n};\n`,
);

writeIfMissing(
  "index.d.ts",
  `export * from "./types.js";\n`,
);

writeIfMissing(
  "wasm.js",
  `import * as m from "./types.js";\n\nexport * from "./types.js";\n\nconst defaultDecoder = new TextDecoder();\nconst nodeObjectMap = new Map();\nlet _wasm;\nlet _wasmPromise;\nlet _mmdFactory;\n\nconst factory = async () => {\n  _mmdFactory ??= import(/* webpackIgnore: true */ "/mmd.wasm.js").then((mod) => mod.default ?? mod);\n  return _mmdFactory;\n};\n\nexport const load = async (locateFile) => {\n  if (_wasm) return _wasm;\n  if (_wasmPromise) return _wasmPromise;\n\n  const Mmd = await factory();\n  _wasmPromise = Mmd({\n    arguments: [],\n    rootNode: null,\n    nodeObjectMap,\n    locateFile: typeof locateFile === "string" ? () => locateFile : locateFile,\n  });\n\n  _wasmPromise.then((wasm) => {\n    _wasm = wasm;\n    _wasmPromise = undefined;\n  }).catch(() => {\n    _wasmPromise = undefined;\n  });\n\n  return _wasmPromise;\n};\n\nexport const ready = async () =>\n  _wasm ?? _wasmPromise ?? Promise.reject("wasm not loaded nor loading");\n\nexport const parse = (input) => {\n  if (!_wasm) throw new Error("load() must be called && complete before calling parse()");\n\n  const dataPtr = _wasm._malloc(input.byteLength + 1);\n  const dataOnHeap = new Uint8Array(_wasm.HEAPU8.buffer, dataPtr, input.byteLength + 1);\n\n  dataOnHeap.set(new Uint8Array(input));\n  dataOnHeap.set(new Uint8Array([0]), input.byteLength);\n\n  const result = _wasm._parse(dataOnHeap.byteOffset, input.byteLength);\n  _wasm._free(dataPtr);\n\n  const root = _wasm.rootNode;\n  _wasm.rootNode = null;\n  _wasm.nodeObjectMap.clear();\n\n  if (result !== 0 || !root) throw new Error("root node not found");\n  return root;\n};\n\nexport const read = (input, node, decoder = defaultDecoder) =>\n  decoder.decode(input.slice(node.start, node.start + node.len));\n\nexport const readTitle = (input, node) =>\n  read(input, node).replace(/^\\s*#+\\s*/, "").replace(/\\s*#+\\s*$/, "");\n\nexport const walk = (node, fn) => {\n  if (fn(node)?.stopWalking) return;\n  if (node.child) walk(node.child, fn);\n  if (node.content) walk(node.content, fn);\n  if (node.next) walk(node.next, fn);\n};\n`,
);

writeIfMissing(
  "wasm.d.ts",
  `export * from "./types.js";\nexport type Wasm = unknown;\nexport declare const load: (locateFile?: string | ((path: string) => string)) => Promise<Wasm>;\nexport declare const ready: () => Promise<unknown>;\nexport declare const parse: (input: ArrayBuffer) => m.Node;\nexport declare const read: (input: ArrayBuffer, node: m.Node, decoder?: TextDecoder) => string;\nexport declare const readTitle: (input: ArrayBuffer, node: m.Node) => string;\nexport declare const walk: (node: m.Node, fn: (node: m.Node) => void | { stopWalking: boolean }) => void;\nimport type * as m from "./types.js";\n`,
);
