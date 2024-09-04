#!/bin/sh

./bin/build_wasm_emscripten.sh || exit 1
./bin/postprocess_wasm.sh || exit 1
./bin/build_web_worker.sh || exit 1
npm run build_commonjs || exit 1