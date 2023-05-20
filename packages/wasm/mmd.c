#include <emscripten.h>
#include <stdlib.h>
#include <string.h>

#include "../MultiMarkdown-6/src/libMultiMarkdown.h"
#include "../MultiMarkdown-6/src/token.h"

EM_JS(void*, create_js_object, (token* obj), {
  if (Module.tokenObjectMap.has(obj)) {
    return Module.tokenObjectMap.get(obj);
  }

  const jsObj = {
    type: HEAPU16[obj >> 1],    // Use HEAPU16 here, as type is a 2-byte unsigned short
    can_open: HEAP16[(obj + 2) >> 1],   // Use HEAP16 here, as can_open is a 2-byte short
    can_close: HEAP16[(obj + 4) >> 1],  // Same with can_close
    unmatched: HEAP16[(obj + 6) >> 1],  // And unmatched
    start: HEAP32[(obj + 8) >> 2],
    len: HEAP32[(obj + 12) >> 2],
    out_start: HEAP32[(obj + 16) >> 2],
    out_len: HEAP32[(obj + 20) >> 2],
  };

  // Save the jsObj in the map before we start the recursion
  Module.tokenObjectMap.set(obj, jsObj);
  if (!Module.rootToken) {
    Module.rootToken = jsObj;
  }

  // Pointers to other tokens are replaced with indices
  let next = HEAP32[(obj + 24) >> 2];
  let prev = HEAP32[(obj + 28) >> 2];
  let child = HEAP32[(obj + 32) >> 2];
  let tail = HEAP32[(obj + 36) >> 2];
  let mate = HEAP32[(obj + 40) >> 2];

  jsObj.next = next ? create_js_object(next) : null;
  jsObj.prev = prev ? create_js_object(prev) : null;
  jsObj.child = child ? create_js_object(child) : null;
  jsObj.tail = tail ? create_js_object(tail) : null;
  jsObj.mate = mate ? create_js_object(mate) : null;

  return jsObj;
});

EM_JS(void*, throw_js_error, (const char* message), {
  Module.error = message;

  return -1;
});

EMSCRIPTEN_KEEPALIVE
int parse(const char* text) {
  mmd_engine *engine = mmd_engine_create_with_string(text, EXT_NOTES);
  mmd_engine_parse_string(engine);

  int ret = 0;
  token* root = mmd_engine_root(engine);

  if (root == NULL) {
    throw_js_error("root is NULL");
    ret = -1;
  }

  if (root->type < 0) {
    throw_js_error("root->type is not a valid number");
    ret = -1;
  }

  if (ret == 0) {
    create_js_object(root);
  }

  // Free the engine
  mmd_engine_free(engine, true);

  return ret;
}
