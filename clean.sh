#!/bin/bash

# This script cleans everything

set -e  # Exit on any error

echo "📦 Removing all node_modules folders..."
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
echo "✅ All node_modules folders removed"

echo "🗂️  Removing all dist folders..."
find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
echo "✅ All dist folders removed"

echo "🔒 Removing all package-lock.json files..."
find . -name "package-lock.json" -type f -delete 2>/dev/null || true
echo "✅ All package-lock.json files removed"

rm -rf packages/studio/boxes/src/* 2>/dev/null || true
