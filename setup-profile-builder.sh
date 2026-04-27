#!/bin/bash
set -e

# Setup script for Agama Profile Builder

echo "Building WASM validator..."
cd rust/agama-profile-wasm
if ! command -v wasm-pack &> /dev/null; then
    echo "Error: wasm-pack is not installed. Please install it with: cargo install wasm-pack"
    exit 1
fi
wasm-pack build --target web --out-dir ../../web/src/ProfileBuilder/wasm

echo "Installing JS dependencies..."
cd ../../web
npm install js-yaml
npm install ./src/ProfileBuilder/wasm

echo "Done! You can now run the web application with 'npm run server'."
