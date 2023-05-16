#include <emscripten.h>
#include <stdlib.h>
#include <string.h>

#include "MultiMarkdown-6/src/libMultiMarkdown.h"
#include "MultiMarkdown-6/src/token.h"

EM_JS(void*, create_js_object, (token* obj), {
  if (Module.tokenObjectMap.has(obj)) {
    return Module.tokenObjectMap.get(obj);
  }

  const jsObj = {
    type: HEAP32[obj >> 2],
    can_open: !!HEAP8[obj + 4],
    can_close: !!HEAP8[obj + 5],
    unmatched: !!HEAP8[obj + 6],
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

  // Return a failure status code
  // (you'll need to adjust your other code to handle this)
  return -1;
});

token* parse(const char* text) {
  mmd_engine *engine = mmd_engine_create_with_string(text, EXT_NOTES);
  mmd_engine_parse_string(engine);

  token* root = mmd_engine_root(engine);

  if (root == NULL) {
    throw_js_error("root is NULL");
    return NULL;
  }

   if (root->type < 0) {
    throw_js_error("root->type is not a valid number");
    return NULL;
  }

  // TODO - probably need to wrap the objects again after all
  // Free the engine
  //mmd_engine_free(engine, true);

  return root;
}

// Emscripten bindings
EMSCRIPTEN_KEEPALIVE
int parse_js(const char* text) {
  token* result = parse(text);

  if (result == NULL) {
    return -1;
  }

  create_js_object(result);

  return 0;
}
