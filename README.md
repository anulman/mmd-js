# mmd-js [![npm version](https://badge.fury.io/js/mmd-js.svg)](https://badge.fury.io/js/mmd-js)

`mmd-js` is a lightweight wrapper around the MultiMarkdown C library. As of the `0.4.x` line, it uses the MultiMarkdown 7 engine and exposes the MMD7 AST structure to JavaScript.

> **Breaking change:** `0.4.x` is not AST-compatible with `0.3.x` and earlier. Consumers that inspect node `type` values, tree shape, byte offsets, or fixture snapshots should treat the `0.4.x` upgrade as a breaking migration to the MMD7 engine and AST.

`mmd-js` is intentionally a parser/AST library, not a complete renderer. It gives Node.js and browser code access to MultiMarkdown parse trees, source spans, and small traversal/read helpers. HTML rendering, rich editor adapters, and semantic previews should live in separate packages or application layers built on top of this AST.

## Demo / Context

[![mmd-js demo](https://cdn.loom.com/sessions/thumbnails/b27203b5271a40a8a6a46897c7d928d4-with-play.gif)](https://www.loom.com/share/b27203b5271a40a8a6a46897c7d928d4 "mmd-js demo")

## Installation

```bash
npm install mmd-js
# or `yarn add mmd-js`
# or `pnpm add mmd-js`
```

## Usage

`mmd-js` currently exposes a small parser interface:

```ts
import * as mmd from "mmd-js";

// Usually you'd read a file, or maybe stdin
const buf = Buffer.from("Title: My Document\n\n# Header\n\nSome body text");

// Parse the MultiMarkdown document's root token from the buffer
const rootToken = mmd.parse(buf);

// Now you can walk the token tree
mmd.walk(rootToken, console.log);

// You can also render any node's text as a string
const text = mmd.read(buf, rootToken);
// const title = mmd.readTitle(buf, aTitleToken);

console.log(text);
// Title: My Document
//
// # Header
//
// Some body text
```

This API powers the `bin/demo.ts` script, which takes a MultiMarkdown file and:

- Creates a directory for each "Part" (header level-1)
- Creates a file for each "Section" within a part (header level-2)
- Prints the Section's content into the file, after stripping:
  - The section title itself;
  - Any footnotes or footnote anchors within the section's text; and
  - Any whitespace before / after the section's text

If you would like to do something `mmd-js` does not yet support, please [open an issue](https://github.com/anulman/mmd-js/issues/new).

### Wasm Notes

`mmd-js` also exposes a WebAssembly interface, with a few minor differences:

```ts
// Import the `/wasm.js` JS module instead of the default one
import * as mmd from "mmd-js/wasm.js";

// Load and instantiate the WebAssembly `.wasm` module.
// You may optionally pass a string (or string-returning function) to tell
// the JS where to find the `.wasm` file, if it is having trouble.
await mmd.load();

// Now you can use the same `mmd.*` APIs as above, albeit with
// browser-friendly `ArrayBuffer`s instead of Node.js `Buffer`s.
const buf = new TextEncoder().encode(
  "Title: My Document\n\n# Header\n\nSome body text"
);

// ...
```

## Development

### Installation

Tested with `pnpm`, but `npm` should work fine.

```bash
# clone the repo; CMake fetches the pinned MMD7 source during native/WASM builds
# $ git clone git@github.com:anulman/mmd-js.git

# install emscripten, for wasm builds
brew install emscripten

# install js/ts deps
pnpm install

# configure wasm before building
pnpm run wasm:configure
```

### Validation

The characterization tests use the pinned MMD7 fixture under `tests/fixtures/mmd7/` and compare parser output against the MMD7 integrated fixture expectations. The MMD7 source itself is fetched by CMake at the pinned commit during native/WASM builds.

Recommended validation commands:

```bash
corepack pnpm@8.15.9 install --frozen-lockfile
corepack pnpm@8.15.9 run build:js
./node_modules/.bin/cmake-js compile -O build/napi -C --CD CMAKE_POSITION_INDEPENDENT_CODE=ON
source /home/clawy/emsdk/emsdk_env.sh && corepack pnpm@8.15.9 run wasm:configure && corepack pnpm@8.15.9 run build:wasm
corepack pnpm@8.15.9 test
```

Notes:

- The native addon currently consumes a C string, so the snapshot/test path appends an explicit NUL terminator before native parsing. WASM already writes a NUL terminator into linear memory.
- The Chromium smoke test uses `/usr/bin/chromium-browser` by default; set `CHROMIUM_BIN=/path/to/chromium` if needed.

### Build && Run

```bash
pnpm build:napi # builds a node.js addon
pnpm build:wasm # builds a wasm module
pnpm build:js # compiles and emits typescript to js
pnpm build # runs all of the above

pnpm test # runs native, Node-loaded WASM, and Chromium WASM smoke tests
pnpm test:update-snapshots # refreshes committed characterization snapshots

pnpm demo:bin # invokes `bin/demo.ts`; pass it a filepath
pnpm demo:web # starts the `demo/` dir's next.js dev server
```

### Publishing

```bash
pnpm version [patch|minor|major] # uptick the version
pnpm publish # publish to the npm registry
```
