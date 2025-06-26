#!/usr/bin/env bash
set -euo pipefail
export TERM=${TERM:-dumb}
if [[ -t 1 ]]; then clear; fi

echo "install core"
npm install   || exit 1

echo "install boxes"
(cd gen && npm install)   || exit 1

echo "gen boxes"
(cd gen && npm run gen)   || exit 1

echo "done"