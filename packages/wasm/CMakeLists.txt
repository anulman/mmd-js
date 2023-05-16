cmake_minimum_required(VERSION 3.18)
project(MultiMarkdownWasm)

set(CMAKE_C_STANDARD 11)

# prod
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O2")
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -s NO_EXIT_RUNTIME=1 -fsanitize=address")

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
