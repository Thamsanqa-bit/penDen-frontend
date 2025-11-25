#!/usr/bin/env bash
# frontend/build.sh

echo "Installing Node.js dependencies..."
npm install

echo "Building React application..."
npm run build

echo "Frontend build complete!"