{
  "targets": [
    {
      "target_name": "mmd-js",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [ "mmd.cpp" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
      'conditions': [
        ['OS=="mac"', {
            'cflags+': ['-fvisibility=hidden'],
            'xcode_settings': {
              'GCC_SYMBOLS_PRIVATE_EXTERN': 'YES', # -fvisibility=hidden
            }
        }]
      ]
    }
  ]
}
