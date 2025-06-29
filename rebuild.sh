#!/bin/bash

# Rebuild All Script for OpenDAW Studio Monorepo
# This script cleans everything and rebuilds the entire project

set -e  # Exit on any error

echo "🧹 Starting complete rebuild of OpenDAW Studio monorepo..."

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

# 4. Install all dependencies at root
echo "📥 Installing root dependencies..."
npm install
echo "✅ Root dependencies installed"

# 5. Build packages in dependency order
echo "🔨 Building packages in dependency order..."

# Function to build a package
build_package() {
    local package_name=$1
    echo "Building $package_name..."
    cd "packages/$package_name"
    npm run build
    cd ../..
    echo "✅ $package_name built successfully"
}

build_package "std"
build_package "dsp"
build_package "runtime"
build_package "dom"
build_package "box"
build_package "jsx"
build_package "fusion"
build_package "box-forge"
build_package "studio-enums"
build_package "studio-forge-boxes"
build_package "studio-boxes"
build_package "studio-shared"
build_package "studio-worklet"
build_package "studio-app"

echo "🎉 All packages built successfully!"
echo "🚀 OpenDAW Studio monorepo is ready to run!" 