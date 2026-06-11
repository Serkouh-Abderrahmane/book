#!/bin/bash
set -e
echo "=== Starting build ==="
echo "Current dir: $(pwd)"
echo "Files: $(ls -la)"

echo "=== Building frontend ==="
cd frontend
echo "Frontend dir: $(pwd)"
npm install
npm run build
echo "Frontend build complete"

echo "=== Installing backend ==="
cd ../backend
echo "Backend dir: $(pwd)"
npm install
echo "Backend install complete"

echo "=== Build complete ==="
