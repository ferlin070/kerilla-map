#!/bin/bash
# Deploy Kerilla app ke Cloudflare Pages (hosting kekal)
set -e
export npm_config_cache=/home/sewanode/kaihara/.npm-cache
export CLOUDFLARE_API_TOKEN=$(grep CF_TOKEN_ACCESS /home/sewanode/kaihara/.secrets/cf.env | cut -d= -f2 | tr -d ' ')
export CLOUDFLARE_ACCOUNT_ID=$(grep CF_ACCOUNT_ID /home/sewanode/kaihara/.secrets/cf.env | cut -d= -f2 | tr -d ' ')
cd /home/sewanode/kaihara/poc
node build-v3d.mjs
node_modules/.bin/wrangler pages deploy web-kerilla --project-name kerilla --branch main --commit-dirty=true
echo ""
echo "Live: https://kerilla.nakhodacloud.top"
