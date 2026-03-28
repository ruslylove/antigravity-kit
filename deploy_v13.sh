#!/bin/bash

# --- Configuration ---
REMOTE_USER="root"
REMOTE_HOST="141.11.156.67"
REMOTE_PATH="/var/www/Siam-EV-dashboard"
BUNDLE_NAME="dashboard_bundle_v13.tar.gz"

echo "🚀 Starting Deployment of $BUNDLE_NAME to $REMOTE_HOST..."

# 1. Upload the bundle
echo "📤 Uploading bundle to $REMOTE_HOST:$REMOTE_PATH..."
scp "$BUNDLE_NAME" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

# 2. Extract and Restart
echo "📦 Extracting bundle and restarting service..."
ssh "$REMOTE_USER@$REMOTE_HOST" << EOF
  cd $REMOTE_PATH
  # Backup existing if needed? No, we just extract.
  tar -xzvf $BUNDLE_NAME
  cd deploy_v13/web
  # Sync files to the main directory
  cp -r * ../.. 
  cd ../..
  # Cleanup
  rm -rf deploy_v13
  # Restart PM2
  pm2 restart siam-ev-dashboard
EOF

echo "✅ Deployment Successful!"
