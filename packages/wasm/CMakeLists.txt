cmake_minimum_required(VERSION 3.18)
project(MultiMarkdownWasm)

set(CMAKE_C_STANDARD 11)

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Os")
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} \
  -s EXPORT_ES6=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME=\"MultiMarkdown\" \
  -s FILESYSTEM=0 \
  -s INVOKE_RUN=0 \
  -s STANDALONE_WASM=1 \
  -s ASSERTIONS=0 \
  -s ENVIRONMENT=web,webview,worker \
  -s INCOMING_MODULE_JS_API=rootToken,tokenObjectMap,locateFile,arguments \
  -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=malloc,free \
  -s EXPORTED_FUNCTIONS=_malloc,_free,_parse \
  -s WASM_BIGINT=1 \
  -s STACK_SIZE=262144 \
  --no-entry \
")

# Include MultiMarkdown headers
include_directories(packages/MultiMarkdown-6/src)

# Define the source files
set(SOURCE_FILES mmd.c)

# Define the executable
add_executable(MultiMarkdownWasm ${SOURCE_FILES})

# Add MultiMarkdown as a subdirectory so it's built with our project
add_subdirectory(MultiMarkdown-6)
target_compile_definitions(libMultiMarkdown PUBLIC DISABLE_OBJECT_POOL=1)

# Link against the static library
target_link_libraries(MultiMarkdownWasm libMultiMarkdown)