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

# Function to test a package (if test script exists)
test_package() {
    local package_name=$1
    cd "packages/$package_name"
    if npm run 2>/dev/null | grep -q " test"; then
        echo "🧪 Testing $package_name..."
        if npm test; then
            echo "✅ $package_name tests passed"
        else
            echo "❌ $package_name tests failed"
            cd ../..
            exit 1
        fi
    else
        echo "⚠️  No test script for $package_name, skipping tests."
    fi
    cd ../..
}

build_package "lib-std"
test_package "lib-std"
build_package "lib-dsp"
test_package "lib-dsp"
build_package "lib-runtime"
test_package "lib-runtime"
build_package "lib-dom"
test_package "lib-dom"
build_package "lib-box"
test_package "lib-box"
build_package "lib-jsx"
test_package "lib-jsx"
build_package "lib-fusion"
test_package "lib-fusion"
build_package "lib-box-forge"
test_package "lib-box-forge"
build_package "studio-enums"
test_package "studio-enums"
build_package "studio-forge-boxes"
test_package "studio-forge-boxes"
build_package "studio-boxes"
test_package "studio-boxes"
build_package "studio-adapters"
test_package "studio-adapters"
build_package "studio-worklet"
test_package "studio-worklet"
build_package "bundle-main"
test_package "bundle-main"
build_package "bundle-worklet"
test_package "bundle-worklet"
build_package "studio-app"
test_package "studio-app"

echo "🎉 All packages built successfully!"
echo "🚀 OpenDAW Studio monorepo is ready to run!" 