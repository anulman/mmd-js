function(patch_emscripten_mutex SOURCE_PATH MUTEX_OWNER)
  file(READ "${SOURCE_PATH}" SOURCE)
  string(FIND "${SOURCE}" "#elif defined(__EMSCRIPTEN__)" ALREADY_PATCHED)
  if(ALREADY_PATCHED EQUAL -1)
    string(REPLACE
      "#elif defined(__APPLE__)\n\t\t${MUTEX_OWNER}->mutex = (pthread_mutex_t) PTHREAD_RECURSIVE_MUTEX_INITIALIZER;"
      "#elif defined(__EMSCRIPTEN__)\n\t\tpthread_mutex_init(&${MUTEX_OWNER}->mutex, NULL);\n#elif defined(__APPLE__)\n\t\t${MUTEX_OWNER}->mutex = (pthread_mutex_t) PTHREAD_RECURSIVE_MUTEX_INITIALIZER;"
      SOURCE
      "${SOURCE}"
    )
    file(WRITE "${SOURCE_PATH}" "${SOURCE}")
  endif()
endfunction()

patch_emscripten_mutex("${MMD7_SOURCE_DIR}/src/mmd_node_pool.c" "p")
patch_emscripten_mutex("${MMD7_SOURCE_DIR}/src/stack.c" "s")
patch_emscripten_mutex("${MMD7_SOURCE_DIR}/src/vector_line_node.c" "v")
