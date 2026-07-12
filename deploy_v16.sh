#!/bin/bash

# --- Configuration ---
REMOTE_USER="olx"
REMOTE_HOST="91.210.146.166"
REMOTE_PASS="${REMOTE_PASS:-}"
REMOTE_PATH="/home/olx/siam-ev-dashboard"
BUNDLE_NAME="dashboard_bundle_v16.tar.gz"

if [ -z "$REMOTE_PASS" ]; then
  read -sp "🔑 Enter SSH password for $REMOTE_USER@$REMOTE_HOST: " REMOTE_PASS
  echo ""
fi

echo "🚀 Starting Deployment of $BUNDLE_NAME to $REMOTE_HOST..."

# 1. Create remote path if not exists
echo "📁 Ensuring remote directory exists..."
sshpass -p "$REMOTE_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_USER@$REMOTE_HOST" "mkdir -p $REMOTE_PATH"

# 2. Upload the bundle
echo "📤 Uploading bundle to $REMOTE_HOST:$REMOTE_PATH..."
sshpass -p "$REMOTE_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$BUNDLE_NAME" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

# 3. Extract and Restart
echo "📦 Extracting bundle and restarting service..."
sshpass -p "$REMOTE_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_USER@$REMOTE_HOST" << EOF
  cd $REMOTE_PATH
  # Extract bundle
  tar -xzvf $BUNDLE_NAME
  # Sync all files including hidden (.next) files to the main directory
  cp -R deploy_v16/web/. .
  # Cleanup local deploy folder and tarball
  rm -rf deploy_v16 $BUNDLE_NAME
  
  # Register/restart PM2 process
  if pm2 show siam-ev-dashboard > /dev/null 2>&1; then
    echo "🔄 PM2 process exists. Restarting..."
    pm2 restart siam-ev-dashboard
  else
    echo "🆕 PM2 process does not exist. Starting for the first time on port 3000..."
    PORT=3000 pm2 start server.js --name siam-ev-dashboard
  fi
  pm2 save
EOF

echo "✅ Deployment Successful!"
