#!/usr/bin/env bash
set -euo pipefail
echo "clean"
declare -a targets=("dist" "node_modules")
remove_targets() {
  for target in "${targets[@]}"; do
    find . -name "$target" -exec rm -rf {} +
  done
}
remove_targets
rm -rf src/data/boxes