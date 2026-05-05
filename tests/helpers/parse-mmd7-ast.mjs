const linePattern = /^(\t*)([*+-]) \((\d+)\) (\d+):(\d+)\t'/;

export function parseMmd7Ast(text) {
  const frames = [];
  const roots = [];

  for (const rawLine of text.split(/\n/)) {
    const match = rawLine.match(linePattern);
    if (!match) {
      continue;
    }

    const depth = match[1].length;
    const marker = match[2];
    const node = {
      type: Number(match[3]),
      start: Number(match[4]),
      len: Number(match[5]),
    };

    const siblings = depth === 0
      ? roots
      : marker === "-"
        ? (frames[depth - 1].node.__contentChildren ??= [])
        : (frames[depth - 1].node.__childChildren ??= []);

    const previous = siblings[siblings.length - 1];
    if (previous) {
      previous.next = node;
    }
    siblings.push(node);

    frames[depth] = { node, marker };
    frames.length = depth + 1;
  }

  function finalize(node) {
    if (node.__childChildren?.length) {
      node.child = node.__childChildren[0];
      node.tail = node.__childChildren[node.__childChildren.length - 1];
    }
    if (node.__contentChildren?.length) {
      node.content = node.__contentChildren[0];
    }
    delete node.__childChildren;
    delete node.__contentChildren;

    for (const key of ["child", "content", "next"]) {
      if (node[key]) {
        finalize(node[key]);
      }
    }
    if (node.tail && node.tail !== node.child) {
      // Tail nodes are part of the child chain and will already be finalized.
    }
    return node;
  }

  for (let i = 0; i < roots.length - 1; i++) {
    roots[i].next = roots[i + 1];
  }

  if (!roots[0]) {
    throw new Error("No AST nodes parsed");
  }

  return finalize(roots[0]);
}
