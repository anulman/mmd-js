# mmd-js

This project is a lightweight Napi module that wraps `multimarkdown-6` so
JS scripts can parse Multimarkdown documents and directly consume their ASTs.

## Installation
Tested with `pnpm`, but `npm` should work fine.

```bash
pnpm install
# will also configure the node-gyp addon
```

## Usage
```bash
pnpm build # runs the base typescript compiler
pnpm start # runs the ts compiler, then invokes `index.ts`
```

## Todo
- [x] init hello world addon
- [ ] link against multimarkdown source
- [ ] parse a given document
- [ ] return parsed AST
- [ ] distribute
- [ ] test??
