cmake_minimum_required(VERSION 3.18)
project(mmd)

set(CMAKE_C_STANDARD 11)

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Os")
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} \
  -s EXPORT_ES6=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME=\"mmd\" \
  -s FILESYSTEM=0 \
  -s INVOKE_RUN=0 \
  -s STANDALONE_WASM=1 \
  -s ASSERTIONS=0 \
  -s ENVIRONMENT=web,webview,worker,node \
  -s INCOMING_MODULE_JS_API=rootNode,nodeObjectMap,locateFile,arguments \
  -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=malloc,free \
  -s EXPORTED_FUNCTIONS=_malloc,_free,_parse \
  -s EXPORTED_RUNTIME_METHODS=HEAPU8,UTF8ToString \
  -s WASM_BIGINT=1 \
  -s STACK_SIZE=262144 \
  --no-entry \
")

# Include MultiMarkdown headers
include_directories(${MMD7_SOURCE_DIR}/src)

# Define the source files
set(SOURCE_FILES mmd.c)

# Define the executable
add_executable(mmd ${SOURCE_FILES})
