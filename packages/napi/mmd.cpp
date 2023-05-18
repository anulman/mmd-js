#ifndef _ADDON_H_
#define _ADDON_H_

#include <map>
#include <napi.h>

extern "C" {
  #include <d_string.h>
  #include <libMultiMarkdown.h>
  #include <mmd.h>
  #include <token.h>
}

Napi::Object WrapToken(Napi::Env env, token *t, std::map<token *, Napi::Object> *tokens) {
  auto search = tokens->find(t);

  if (search != tokens->end()) {
    return search->second;
  }

  auto obj = Napi::Object::New(env);
  tokens->emplace(t, obj);

  obj.Set("type", Napi::Number::New(env, t->type));
  obj.Set("can_open", Napi::Value::From(env, t->can_open == 1));
  obj.Set("can_close", Napi::Value::From(env, t->can_close == 1));
  obj.Set("unmatched", Napi::Value::From(env, t->unmatched == 1));

  obj.Set("start", Napi::Number::New(env, t->start));
  obj.Set("len", Napi::Number::New(env, t->len));

  obj.Set("out_start", Napi::Number::New(env, t->out_start));
  obj.Set("out_len", Napi::Number::New(env, t->out_len));

  if (t->next) {
    obj.Set("next", WrapToken(env, t->next, tokens));
  }

  if (t->prev) {
    obj.Set("prev", WrapToken(env, t->prev, tokens));
  }

  if (t->child) {
    obj.Set("child", WrapToken(env, t->child, tokens));
  }

  if (t->tail) {
    obj.Set("tail", WrapToken(env, t->tail, tokens));
  }

  if (t->mate) {
    obj.Set("mate", WrapToken(env, t->mate, tokens));
  }

  return obj;
}

Napi::Value Parse(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  auto text = new Napi::Buffer<char>(env, info[0]);

  mmd_engine *engine = mmd_engine_create_with_string(text->Data(), EXT_NOTES);
  mmd_engine_parse_string(engine);

  auto root = mmd_engine_root(engine);

  if (root == nullptr) {
      Napi::Error::New(env, "root is nullptr").ThrowAsJavaScriptException();
      return env.Undefined();
  }

  if (root->type < 0) {  // or any other condition that indicates an invalid number
      Napi::Error::New(env, "root->type is not a valid number").ThrowAsJavaScriptException();
      return env.Undefined();
  }

  auto tokens_map = new std::map<token *, Napi::Object>();
  auto obj = WrapToken(env, root, tokens_map);

  // Free the engine
  mmd_engine_free(engine, true);

  return obj;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "parse"),
              Napi::Function::New(env, Parse));
  return exports;
}

NODE_API_MODULE(mmd, Init)
#endif  // _ADDON_H_
