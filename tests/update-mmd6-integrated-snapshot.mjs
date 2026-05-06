import { writeFile, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as mmd from "../index.js";
import { normalizeToken } from "./helpers/normalize-token.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const fixturePath = resolve(root, "packages/MultiMarkdown-6/tests/MMD6Tests/Integrated.text");
const snapshotPath = resolve(__dirname, "fixtures/mmd6-integrated.snapshot.json");

const fixture = await readFile(fixturePath);
// The native addon currently accepts a C string, so provide an explicit NUL
// terminator to avoid reading past the Buffer when characterizing MMD6.
const token = mmd.parse(Buffer.concat([fixture, Buffer.of(0)]));
const snapshot = normalizeToken(token);
await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
