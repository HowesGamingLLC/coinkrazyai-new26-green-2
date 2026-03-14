#!/bin/bash
set -e

echo "Clearing pnpm cache and node_modules..."
rm -rf node_modules .pnpm-store pnpm-lock.yaml 2>/dev/null || true

echo "Installing dependencies with pnpm 10.32.1..."
pnpm install

echo "Setup completed successfully!"
