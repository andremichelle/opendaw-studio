#!/usr/bin/env bash
set -euo pipefail
echo "mkcert localhost"
mkcert localhost || exit 1