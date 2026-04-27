#!/bin/bash
set -e

# build-standalone-profile-builder.sh
# Automates the creation of a purely client-side Agama Profile Builder.

PROJECT_ROOT=$(pwd)
WEB_DIR="$PROJECT_ROOT/web"
WASM_DIR="$PROJECT_ROOT/rust/agama-profile-wasm"

echo "Step 1: Compiling Rust WASM Validator..."
if ! command -v wasm-pack &> /dev/null; then
    echo "Error: wasm-pack not found. Please install it: cargo install wasm-pack"
    exit 1
fi

cd "$WASM_DIR"
# Build for web target and output directly to the web src folder
wasm-pack build --target web --out-dir "$WEB_DIR/src/ProfileBuilder/wasm"

echo "Step 2: Installing Node dependencies..."
cd "$WEB_DIR"
npm install

echo "Step 3: Building static web assets..."
# This generates the standalone profile_builder.html and profile_builder.js in web/dist
npm run build

echo ""
echo "==============================================================="
echo "BUILD COMPLETE"
echo "==============================================================="
echo "The standalone Profile Builder is ready in: $WEB_DIR/dist"
echo ""
echo "To run it without any Agama server, you can use any static server:"
echo "Example: cd web/dist && python3 -m http.server 8000"
echo "Then open: http://localhost:8000/profile_builder.html"
echo "==============================================================="
