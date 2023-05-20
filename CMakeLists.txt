cmake_minimum_required(VERSION 3.18)

add_subdirectory("packages/MultiMarkdown-6")
target_compile_definitions(libMultiMarkdown PUBLIC DISABLE_OBJECT_POOL=1)

if(EMSCRIPTEN)
  add_subdirectory("packages/wasm")
  target_link_libraries(mmd libMultiMarkdown)
else()
  add_subdirectory("packages/napi")
  target_link_libraries(mmd-js
    PRIVATE
      ${CMAKE_JS_LIB}
      libMultiMarkdown
  )
endif()
