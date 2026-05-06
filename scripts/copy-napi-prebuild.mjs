import { copyFileSync, mkdirSync } from "node:fs";
import { platform, arch } from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const source = path.join(root, "build", "napi", "Release", "mmd-js.node");
const targetDir = path.join(root, "prebuilds", `${platform}-${arch}`);
const target = path.join(targetDir, "node.napi.node");

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, target);
console.log(`copied ${path.relative(root, source)} -> ${path.relative(root, target)}`);
