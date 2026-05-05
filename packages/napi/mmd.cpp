#ifndef _ADDON_H_
#define _ADDON_H_

#include <map>
#include <napi.h>

extern "C" {
  #include <libMultiMarkdown7.h>
  #include <mmd_node_pool.h>
  #include <vector_line_node.h>
  #include <mmd_parser_hand_2.h>
}

namespace {

Napi::Number NumberFromSize(Napi::Env env, size_t value) {
  return Napi::Number::New(env, static_cast<double>(value));
}

Napi::Object WrapNode(Napi::Env env, mmd_node *node, std::map<mmd_node *, Napi::Object> *nodes) {
  auto search = nodes->find(node);
  if (search != nodes->end()) {
    return search->second;
  }

  auto obj = Napi::Object::New(env);
  nodes->emplace(node, obj);

  obj.Set("type", Napi::Number::New(env, node->type));
  obj.Set("start", NumberFromSize(env, node->start));
  obj.Set("len", NumberFromSize(env, node->len));

  if (MMD_NODE_IS_LINE(node)) {
    auto line = reinterpret_cast<mmd_line_node *>(node);
    obj.Set("c_start", NumberFromSize(env, line->c_start));
    obj.Set("c_len", NumberFromSize(env, line->c_len));
  }

  if (node->next) {
    obj.Set("next", WrapNode(env, node->next, nodes));
  }

  if (node->child) {
    obj.Set("child", WrapNode(env, node->child, nodes));
  }

  if (node->tail) {
    obj.Set("tail", WrapNode(env, node->tail, nodes));
  }

  if (node->content) {
    obj.Set("content", WrapNode(env, node->content, nodes));
  }

  return obj;
}

} // namespace

Napi::Value Parse(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  auto text = info[0].As<Napi::Buffer<char>>();

  read_ctx *ctx = read_ctx_new(0);
  if (ctx == nullptr) {
    Napi::Error::New(env, "read_ctx_new returned nullptr").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  vector_line_node *lines = vector_line_node_new(0);
  mmd_node_pool *pool = mmd_node_pool_new(0);
  mmd_node *root = mmd_parse_text(text.Data(), text.Length(), lines, pool, ctx, 0);

  if (root == nullptr) {
    vector_line_node_free(lines);
    mmd_node_pool_free(pool);
    read_ctx_free(ctx);
    Napi::Error::New(env, "root is nullptr").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  std::map<mmd_node *, Napi::Object> nodes_map;
  auto obj = WrapNode(env, root, &nodes_map);

  vector_line_node_free(lines);
  mmd_node_pool_free(pool);
  read_ctx_free(ctx);

  return obj;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "parse"),
              Napi::Function::New(env, Parse));
  return exports;
}

NODE_API_MODULE(mmd, Init)
#endif  // _ADDON_H_
