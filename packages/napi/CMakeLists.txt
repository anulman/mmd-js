cmake_minimum_required(VERSION 3.18)
cmake_policy(SET CMP0091 NEW)
cmake_policy(SET CMP0042 NEW)

set (BUILD_WITH_INSTALL_RPATH 1)
set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -stdlib=libc++")
set (CMAKE_CXX_STANDARD 11)
set (CMAKE_POSITION_INDEPENDENT_CODE ON)

project (mmd-js)
file(GLOB SOURCE_FILES "mmd.cpp")

# Include Node-API wrappers
execute_process(COMMAND node -p "require('node-addon-api').include"
        WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
        OUTPUT_VARIABLE NODE_ADDON_API_DIR
        )
string(REGEX REPLACE "[\r\n\"]" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})

add_library(mmd_objs OBJECT ${SOURCE_FILES} ${CMAKE_JS_SRC})
target_include_directories(mmd_objs PRIVATE ${CMAKE_JS_INC} ${NODE_ADDON_API_DIR} ../MultiMarkdown-6/src)

add_library(${PROJECT_NAME} SHARED $<TARGET_OBJECTS:mmd_objs>)
set_target_properties(${PROJECT_NAME}
  PROPERTIES
  PREFIX ""
  SUFFIX ".node"
)

# define NAPI_VERSION
target_compile_definitions(${PROJECT_NAME} PRIVATE NAPI_VERSION=4)
