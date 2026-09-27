#!/usr/bin/env bash
# serve-keepalive.sh — jalankan pelayan statik dan pastikan ia hidup semula
# jika mati. Guna: nohup ./serve-keepalive.sh &
PORT="${1:-18742}"
cd "$(dirname "$0")/web"
while true; do
  python3 -m http.server "$PORT" --bind 127.0.0.1 >> /tmp/peta-serve.log 2>&1
  echo "[$(date -Iseconds)] pelayan mati, mula semula..." >> /tmp/peta-serve.log
  sleep 1
done
