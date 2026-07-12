#!/bin/bash
set -e

echo "📦 Cleaning local build caches..."
rm -rf web/.next deploy_v16 dashboard_bundle_v16.tar.gz
mkdir -p deploy_v16

echo "🚀 Building Next.js application..."
cd web
npm run build
cd ..

echo "📂 Copying build artifacts to deploy_v16..."
# Copy standalone folder structure exactly as built
cp -R web/.next/standalone/ deploy_v16/

echo "📂 Copying static and public folders..."
# Copy next.js static directory
cp -R web/.next/static deploy_v16/web/.next/
# Copy public directory
cp -R web/public deploy_v16/web/

echo "🗜️ Creating archive dashboard_bundle_v16.tar.gz..."
tar -czf dashboard_bundle_v16.tar.gz deploy_v16

echo "✨ Bundle created successfully!"
