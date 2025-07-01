#!/bin/bash

# Rebuild All Script for OpenDAW Studio Monorepo
# This script cleans everything and rebuilds the entire project

set -e  # Exit on any error

# 1. Delete all node_modules folders
echo "📦 Removing all node_modules folders..."
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
echo "✅ All node_modules folders removed"

# 2. Delete all dist folders
echo "🗂️  Removing all dist folders..."
find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
echo "✅ All dist folders removed"

# 3. Delete package-lock.json files
echo "🔒 Removing all package-lock.json files..."
find . -name "package-lock.json" -type f -delete 2>/dev/null || true
echo "✅ All package-lock.json files removed"