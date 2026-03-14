#!/bin/bash
set -e

echo "=== CoinKrazy Setup Script ==="
echo "Clearing caches and preparing environment..."

# Clear npm cache
npm cache clean --force 2>/dev/null || true

# Clear pnpm cache
rm -rf ~/.pnpm-store 2>/dev/null || true
rm -rf .pnpm-store 2>/dev/null || true
rm -rf node_modules 2>/dev/null || true

# Clear any problematic lockfiles
rm -rf pnpm-lock.yaml 2>/dev/null || true

echo "Installing dependencies..."
npm install

echo ""
echo "=== Setup Complete ==="
echo "✓ All dependencies installed"
echo "✓ Ready to run: npm run dev"
