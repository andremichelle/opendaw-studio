#!/bin/bash

# Rebuild All Script for OpenDAW Studio Monorepo
# This script cleans everything and rebuilds the entire project

set -e  # Exit on any error

npm run clean

# Install all dependencies at root
echo "📥 Installing root dependencies..."
npm install
echo "✅ Root dependencies installed"

# Build packages in dependency order
echo "🔨 Building packages in dependency order..."

# Function to build a package
build_package() {
    local package_name=$1
    local package_type=$2
    echo "Building $package_name..."
    cd "packages/$package_type/$package_name"
    npm run build
    cd ../../..
    echo "✅ $package_name built successfully"
}

# Function to test a package (if test script exists)
test_package() {
    local package_name=$1
    local package_type=$2
    cd "packages/$package_type/$package_name"
    if npm run 2>/dev/null | grep -q " test"; then
        echo "🧪 Testing $package_name..."
        if npm test; then
            echo "✅ $package_name tests passed"
        else
            echo "❌ $package_name tests failed"
            cd ../../..
            exit 1
        fi
    else
        echo "⚠️  No test script for $package_name, skipping tests."
    fi
    cd ../../..
}

# Build libraries
build_package "std" "libraries"
test_package "std" "libraries"
build_package "dsp" "libraries"
test_package "dsp" "libraries"
build_package "runtime" "libraries"
test_package "runtime" "libraries"
build_package "dom" "libraries"
test_package "dom" "libraries"
build_package "box" "libraries"
test_package "box" "libraries"
build_package "jsx" "libraries"
test_package "jsx" "libraries"
build_package "fusion" "libraries"
test_package "fusion" "libraries"
build_package "box-forge" "libraries"
test_package "box-forge" "libraries"

# Build studio packages
build_package "enums" "studio"
test_package "enums" "studio"
build_package "forge-boxes" "studio"
test_package "forge-boxes" "studio"
build_package "boxes" "studio"
test_package "boxes" "studio"
build_package "adapters" "studio"
test_package "adapters" "studio"
build_package "worklet" "studio"
test_package "worklet" "studio"

# Build apps
build_package "opendaw" "apps"
test_package "opendaw" "apps"

echo "🎉 All packages built successfully!"
echo "🚀 OpenDAW Studio monorepo is ready to run!" 