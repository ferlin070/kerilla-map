#!/usr/bin/env bash
# Jalankan app POC. Guna: ./run-app.sh [port]
set -e
PORT="${1:-8080}"
cd "$(dirname "$0")/web"
echo "=============================================="
echo "  Peta Offline POC — App"
echo "=============================================="
echo ""
echo "  Buka pada peranti anda:"
echo "    http://localhost:$PORT"
echo ""
echo "  Untuk uji pada telefon (rangkaian sama):"
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
[ -n "$IP" ] && echo "    http://$IP:$PORT"
echo ""
echo "  Nota: GPS peranti hanya berfungsi pada HTTPS atau localhost."
echo "        Jika akses dari telefon via IP, gunakan simulasi track."
echo ""
echo "  Tekan Ctrl+C untuk berhenti."
echo "=============================================="
python3 -m http.server "$PORT" --bind 0.0.0.0
