# mmd-js [![npm version](https://badge.fury.io/js/mmd-js.svg)](https://badge.fury.io/js/mmd-js)

This project is a lightweight Napi module that wraps `multimarkdown-6` so
JS scripts can parse Multimarkdown documents and directly consume their ASTs.

## Installation

```bash
npm install mmd-js
# or `yarn add mmd-js`
# or `pnpm add mmd-js`
```

## Usage

We currently expose a very small interface:

```ts
import * as mmd from "mmd-js";

// Usually you'd read a file, or maybe stdin
const buf = Buffer.from(
  "Title: My Document\n\n# My Document\n\nSome body text"
);
const rootToken = mmd.parse(buf);

// Now you can walk the token tree
mmd.walk(rootToken, console.log);

// You can also use `mmd.read(buf, token)` and `mmd.readTitle(...)`
// to render the text as a string
const text = mmd.read(buf, rootToken);
console.log(text);
// Title: My Document
//
// # My Document
//
// Some body text
```

This proved sufficient for our `bin/demo.ts` app, which takes a MultiMarkdown file and:

- Creates a directory for each "Part" (header level-1)
- Creates a file for each "Section" within a part (header level-2)
- Prints the Section's content into the file, after stripping:
  - The section title itself;
  - Any footnotes or footnote anchors within the section's text; and
  - Any whitespace before / after the section's text

If you would like to do something we do not yet support, please [open an issue](https://github.com/anulman/mmd-js/issues/new).

## Development

### Installation

Tested with `pnpm`, but `npm` should work fine.

```bash
# you can skip the `git submodule` steps by using the `--recurse-submodules` flag while cloning:
# $ git clone --recurse-submodules git@github.com:anulman/mmd-js.git

# install `packages/MultiMarkdown-6`
git submodule init
git submodule update

# install deps
pnpm install
```

### Build && Run

```bash
pnpm build:addon # builds the native addon
pnpm demo # runs the ts compiler, then invokes `bin/demo.ts`
```

## Todo

- [ ] Let the user configure which extensions to enable on the MMD engine
- [ ] Consider shipping pre-built binaries
- [ ] Test?
- [ ] Add more APIs?
