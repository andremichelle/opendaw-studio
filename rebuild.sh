#!/usr/bin/env bash
set -euo pipefail
export TERM=${TERM:-dumb}
if [[ -t 1 ]]; then clear; fi
bash ./clean.sh           || exit 1
echo "rebuild lib"
(cd lib && bash ./rebuild.sh) || exit 1
echo "rebuild core"
(cd core && bash ./rebuild.sh) || exit 1
echo "install studio"
(cd studio && npm install)         || exit 1
echo "build studio"
(cd studio && npm run build)       || exit 1
echo "done"