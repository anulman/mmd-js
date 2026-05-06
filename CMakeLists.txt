cmake_minimum_required(VERSION 3.28)
project(mmd-js-superbuild)

set(CMAKE_POSITION_INDEPENDENT_CODE ON)
set(TEST 1)

set(MMD7_GIT_REPOSITORY "https://github.com/fletcher/MultiMarkdown-7.git" CACHE STRING "MultiMarkdown 7 repository")
set(MMD7_GIT_TAG "b6d613be1d41c848e67f1f25339dbc2a753fe10d" CACHE STRING "Pinned MultiMarkdown 7 commit")

include(FetchContent)
FetchContent_Declare(
  MultiMarkdown7
  GIT_REPOSITORY ${MMD7_GIT_REPOSITORY}
  GIT_TAG ${MMD7_GIT_TAG}
  PATCH_COMMAND ${CMAKE_COMMAND} -D MMD7_SOURCE_DIR=<SOURCE_DIR> -P ${CMAKE_CURRENT_SOURCE_DIR}/cmake/patch-mmd7-emscripten.cmake
)
FetchContent_MakeAvailable(MultiMarkdown7)
set(MMD7_SOURCE_DIR "${multimarkdown7_SOURCE_DIR}")

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
