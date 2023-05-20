# mmd-js [![npm version](https://badge.fury.io/js/mmd-js.svg)](https://badge.fury.io/js/mmd-js)

This project is a lightweight wrapper around `multimarkdown-6`'s C library.
Node.js scripts use it to parse Multimarkdown documents and walk their ASTs.

## Demo / Context

[![mmd-js demo ��MultiMarkdown AST parser & walk routines in Node.js](https://cdn.loom.com/sessions/thumbnails/e486a43d1ea34a6e9adde06837237fd0-with-play.gif)](https://www.loom.com/share/e486a43d1ea34a6e9adde06837237fd0 "mmd-js demo ��MultiMarkdown AST parser & walk routines in Node.js")

## Installation

```bash
npm install mmd-js
# or `yarn add mmd-js`
# or `pnpm add mmd-js`
```

## Usage

`mmd-js` currently exposes a very small interface:

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

## Development

### Installation

Tested with `pnpm`, but `npm` should work fine.

```bash
# you can skip the `git submodule` steps by using the `--recurse-submodules` flag while cloning:
# $ git clone --recurse-submodules git@github.com:anulman/mmd-js.git

# install `packages/MultiMarkdown-6`
git submodule init
git submodule update

# install emscripten, for wasm builds
brew install emscripten

# install js/ts deps
pnpm install
```

### Build && Run

```bash
pnpm build:addon # builds the native addon
pnpm build # builds the `index.js` and `index.d.ts` files
pnpm demo # invokes `bin/demo.ts`; pass it a filepath
```

### Publishing

```bash
pnpm version [patch|minor|major] # uptick the version
pnpm publish # publish to the npm registry
```

## Todo

- [x] Figure out CMake-js + submodule setup for npm
- [ ] Let the user configure which extensions to enable on the MMD engine
- [ ] Consider shipping pre-built binaries
- [ ] Test?
- [ ] Add more APIs?
