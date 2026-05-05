#include <emscripten.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#include "../MultiMarkdown-7/src/libMultiMarkdown7.h"
#include "../MultiMarkdown-7/src/mmd_node_pool.h"
#include "../MultiMarkdown-7/src/vector_line_node.h"
#include "../MultiMarkdown-7/src/mmd_parser_hand_2.h"

EM_JS(void*, create_js_object, (mmd_node* obj), {
  if (Module.nodeObjectMap.has(obj)) {
    return Module.nodeObjectMap.get(obj);
  }

  const type = HEAPU8[obj];
  const jsObj = {
    type,
    start: HEAPU32[(obj + 8) >> 2],
    len: HEAPU32[(obj + 12) >> 2],
  };

  if ((type & 0xc0) === 0) {
    jsObj.c_start = HEAPU32[(obj + 32) >> 2];
    jsObj.c_len = HEAPU32[(obj + 36) >> 2];
  }

  Module.nodeObjectMap.set(obj, jsObj);
  if (!Module.rootNode) {
    Module.rootNode = jsObj;
  }

  const next = HEAPU32[(obj + 16) >> 2];
  const child = HEAPU32[(obj + 20) >> 2];
  const tail = HEAPU32[(obj + 24) >> 2];
  const content = HEAPU32[(obj + 28) >> 2];

  if (next) jsObj.next = create_js_object(next);
  if (child) jsObj.child = create_js_object(child);
  if (tail) jsObj.tail = create_js_object(tail);
  if (content) jsObj.content = create_js_object(content);

  return jsObj;
});

EM_JS(void, throw_js_error, (const char* message), {
  Module.error = UTF8ToString(message);
});

EMSCRIPTEN_KEEPALIVE
int parse(const char* text, size_t len) {
  read_ctx *ctx = read_ctx_new(0);
  if (ctx == NULL) {
    throw_js_error("read_ctx_new returned NULL");
    return -1;
  }

  vector_line_node *lines = vector_line_node_new(0);
  mmd_node_pool *pool = mmd_node_pool_new(0);
  mmd_node* root = mmd_parse_text(text, len, lines, pool, ctx, 0);

  if (root == NULL) {
    vector_line_node_free(lines);
    mmd_node_pool_free(pool);
    read_ctx_free(ctx);
    throw_js_error("root is NULL");
    return -1;
  }

  create_js_object(root);

  vector_line_node_free(lines);
  mmd_node_pool_free(pool);
  read_ctx_free(ctx);

  return 0;
}
