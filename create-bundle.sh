#!/bin/bash

# Create MCPB Bundle Script for @polyneural/mcpb
# This script creates a production-ready MCPB bundle

set -e

BUNDLE_NAME="polyneural-mcpb.mcpb"
TEMP_DIR="mcpb_bundle_temp"

echo "🚀 Creating MCPB Bundle: $BUNDLE_NAME"
echo ""

# Validate before building
echo "🔍 Validating bundle structure..."
npm run validate

# Clean up any existing temp directory
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi

# Create temporary bundle directory
mkdir "$TEMP_DIR"
echo "📁 Created temporary bundle directory: $TEMP_DIR"

# Copy required files
echo "📋 Copying bundle files..."
cp manifest.json "$TEMP_DIR/"
cp package.json "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"
cp -r server "$TEMP_DIR/"

# Install production dependencies in bundle
echo "📦 Installing production dependencies..."
cd "$TEMP_DIR"
npm install --production --no-optional --silent

# Remove unnecessary files
echo "🧹 Cleaning up bundle..."
find node_modules -name "*.md" -delete 2>/dev/null || true
find node_modules -name "CHANGELOG*" -delete 2>/dev/null || true
find node_modules -name "LICENSE*" -delete 2>/dev/null || true
find node_modules -name ".npmignore" -delete 2>/dev/null || true
find node_modules -name "*.map" -delete 2>/dev/null || true

# Return to original directory
cd ..

# Create the MCPB bundle (ZIP file)
echo "🗜️  Creating MCPB archive..."
cd "$TEMP_DIR"
zip -r "../$BUNDLE_NAME" . -q
cd ..

# Clean up temporary directory
rm -rf "$TEMP_DIR"

# Get bundle info
BUNDLE_SIZE=$(du -h "$BUNDLE_NAME" | cut -f1)

echo ""
echo "✅ MCPB Bundle created successfully!"
echo "📦 Bundle: $BUNDLE_NAME ($BUNDLE_SIZE)"
echo ""
echo "🎯 Next steps:"
echo "   1. Test the bundle with: unzip -t $BUNDLE_NAME"
echo "   2. Install in Claude Desktop by double-clicking the .mcpb file"
echo "   3. Configure your PolyNeural.ai API key in the bundle settings"
echo ""
echo "🔧 Bundle contents:"
unzip -l "$BUNDLE_NAME" | head -20
echo ""
echo "🎉 Your @polyneural/mcpb bundle is ready for distribution!"
