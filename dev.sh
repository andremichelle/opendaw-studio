#!/usr/bin/env bash

# Development script with hot-reloading for all packages
echo "🚀 Starting OpenDAW Studio development environment with hot-reloading..."

# Check if certificates exist
if [ ! -f "localhost-key.pem" ] || [ ! -f "localhost.pem" ]; then
    echo "🔐 Generating SSL certificates..."
    npm run cert
fi

# Start the development environment
echo "📦 Starting package watchers and Vite dev server..."
npm run dev 