const scalarKeys = [
  "type",
  "start",
  "len",
  "out_start",
  "out_len",
  "can_open",
  "can_close",
  "unmatched",
];
const linkKeys = ["child", "next", "tail", "mate"];

export function normalizeToken(token, seen = new Map(), path = "$") {
  if (!token) {
    return null;
  }

  if (seen.has(token)) {
    return { $ref: seen.get(token) };
  }

  seen.set(token, path);

  const normalized = {};
  for (const key of scalarKeys) {
    const value = token[key];
    if (key === "can_open" || key === "can_close" || key === "unmatched") {
      normalized[key] = Boolean(value);
    } else {
      normalized[key] = value;
    }
  }

  for (const key of linkKeys) {
    if (token[key]) {
      normalized[key] = normalizeToken(token[key], seen, `${path}.${key}`);
    }
  }

  return normalized;
}
