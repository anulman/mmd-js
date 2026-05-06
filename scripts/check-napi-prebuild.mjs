import { existsSync } from "node:fs";
import { platform, arch } from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const prebuild = path.join(root, "prebuilds", `${platform}-${arch}`, "node.napi.node");

if (!existsSync(prebuild)) {
  console.error(`missing ${path.relative(root, prebuild)}`);
  process.exit(1);
}

console.log(`found ${path.relative(root, prebuild)}`);
