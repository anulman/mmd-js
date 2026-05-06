const scalarKeys = ["type", "start", "len", "c_start", "c_len"];
const linkKeys = ["child", "content", "next", "tail"];

export function normalizeNode(node, seen = new Map(), path = "$") {
  if (!node) {
    return null;
  }

  if (seen.has(node)) {
    return { $ref: seen.get(node) };
  }

  seen.set(node, path);

  const normalized = {};
  for (const key of scalarKeys) {
    if (node[key] !== undefined) {
      normalized[key] = node[key];
    }
  }

  for (const key of linkKeys) {
    if (node[key]) {
      normalized[key] = normalizeNode(node[key], seen, `${path}.${key}`);
    }
  }

  return normalized;
}
