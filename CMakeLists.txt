cmake_minimum_required(VERSION 3.28)
project(mmd-js-superbuild)

set(CMAKE_POSITION_INDEPENDENT_CODE ON)
set(TEST 1)
add_subdirectory("packages/MultiMarkdown-7")

if(EMSCRIPTEN)
  add_subdirectory("packages/wasm")
  target_link_libraries(mmd libMultiMarkdown7)
else()
  add_subdirectory("packages/napi")
  target_link_libraries(mmd-js
    PRIVATE
      ${CMAKE_JS_LIB}
      libMultiMarkdown7
  )
endif()
