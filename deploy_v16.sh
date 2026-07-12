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
sshpass -p "$REMOTE_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_PATH && tar -xzvf $BUNDLE_NAME && cp -R deploy_v16/. . && rm -rf deploy_v16 $BUNDLE_NAME && (pm2 delete siam-ev-dashboard || true) && PORT=3000 pm2 start web/server.js --name siam-ev-dashboard && pm2 save"

echo "✅ Deployment Successful!"
