---
type: runbook
created: 2026-09-26
tags: [ cloudflare, tunnel, poc, avenza, peta ]
status: active
---

# POC Avenza Maps — App Online (peta.nakhodacloud.top)

## URL Awam
**https://peta.nakhodacloud.top**

## Seni Bina
```
Telefon/Desktop (luar rangkaian)
   |  HTTPS
   v
Cloudflare Edge (peta.nakhodacloud.top)
   |  tunnel "peta-poc" (3e69afb1-f905-4ab6-b555-b3ec3aa059a2)
   v
cloudflared connector (user sewanode, metrics 20243)
   |  http://127.0.0.1:18742
   v
python3 -m http.server 18742  ->  /home/sewanode/kaihara/poc/web
```

## Kredensial (JANGAN dedahkan)
- `/home/sewanode/kaihara/.secrets/`
  - `cf.env` (0600) — CF_ACCOUNT_ID, CF_TOKEN_ACCESS, CF_TOKEN_DNS
  - `peta-tunnel.json` (0600) — tunnel id + token
  - `peta-tunnel-creds.json` (0600) — credentials connector
- Config connector: `/home/sewanode/kaihara/poc/cloudflared-peta.yml`

## Cara Jalankan (2 proses = 2 background job)
```bash
# 1. Pelayan statik
cd /home/sewanode/kaihara/poc/web && python3 -m http.server 18742 --bind 127.0.0.1

# 2. Connector tunnel
cd /home/sewanode/kaihara/poc && cloudflared tunnel --config cloudflared-peta.yml run
```

## PELAJARAN PENTING (pemasa masa depan)

1. **Sandbox ini jalankan setiap bash dalam bwrap PID namespace.** Proses latar
   (`&`, `nohup`, `setsid`, `disown`) **mati** bila panggilan tamat. Mesti guna
   **background job tool**.

2. **Tiada sudo, `/etc` read-only, tiada user systemd** di dalam sandbox.

3. **JANGAN kongsi tunnel dengan connector berconfig lokal.** Connector systemd
   `cloudflared-dsh` guna `--config` lokal (hanya tahu `dsh`). Bila DNS `peta`
   diarah ke tunnel yang sama, trafik jatuh ke connector lama -> **HTTP 404**.
   Penyelesaian: **tunnel berasingan** (`peta-poc`).

4. **Cloudflare CACHE-kannya 404!** Selepas DNS/ingress betul, Cloudflare masih
   pulang 404 yang di-cache (`age: 149`, `cf-cache-status: HIT`).
   **Wajib purge**: `POST /zones/{zone}/purge_cache {"purge_everything":true}`.
   Bukti muktamad: `.png?v=1` -> 200 tetapi `.png` -> 404.

## Diagnosa Pantas
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18742/index.html   # tempatan
curl -s -o /dev/null -w "%{http_code}\n" https://peta.nakhodacloud.top/       # awam
curl -s http://127.0.0.1:20243/metrics | grep ha_connections                   # connector
```

## Had App
- GPS peranti perlukan **HTTPS** (kita ada) -> **GPS berfungsi** di URL awam ini.
- `python3 -m http.server` untuk demo sahaja (prod: nginx/caddy + cache header).
- Tunnel + pelayan = background job -> **mati jika sesi sandbox tamat**.
- Untuk hidupkan semula selepas tamat: jalankan 2 arahan di atas semula.

## FIX: Map Container Full-Screen (fitCover)

### Root cause
fitWidth() guna S.scale = vw / width sahaja. Untuk peta lanskap (3408x2452,
nisbah 1.39) dalam skrin potret, ini menghasilkan peta 390x281 px -> 62% skrin
jadi ruang kosong warna cream (--sand #f3efe4).

### Fix (7 pembetulan dalam app-core.js)
1. fitWidth() -> fitCover(): S.scale = Math.max(vw/W, vh/H)
2. minScale(): had zoom keluar supaya tak boleh dedah cream
3. Clamp keras pan: Math.min(W-hw, Math.max(hw, cx)) - buang margin 16%
4. boot() guna fitCover()
5. fix() guna minScale()
6. ResizeObserver + visualViewport + resize -> auto-adjust
7. orientationchange guna onResize yang sama

### Bukti
| Peranti | Sebelum (cream) | Selepas |
|---|---|---|
| iPhone SE 375x667 | 60% | 0% |
| iPhone 14 390x844 | 67% | 0% |
| 14 Pro Max 430x932 | 67% | 0% |
| Android 360x800 | 68% | 0% |
| iPad mini 744x1133 | 53% | 0% |
| Landskap 844x390 | 0% | 0% |

Imej bukti: /proof-before.png, /proof-after.png, /proof-compare.png

### Nota
fitAll() (butang "Papar seluruh peta") sengaja guna skala < minScale supaya
boleh tunjuk SELURUH peta. Ini satu-satunya keadaan yang ada ruang kosong,
dan ia adalah pilihan pengguna yang disengajakan.

## FIX: Error 1033 — Hosting Kekal di Cloudflare Pages

### Punca Error 1033
Sandbox DSH membunuh SEMUA proses latar antara panggilan bash
(PID namespace terpencil per panggilan; disahkan dengan ujian tmux/setsid).
Cloudflared mati -> Cloudflare tak jumpa connector -> Error 1033.

### Ujian yang disahkan
1. tmux session hilang antara panggilan (error connecting /tmp/tmux-1001/default)
2. setsid + redirect penuh: proses juga mati (panggilan berikut: tiada proses)
3. Panggilan bash dipotong pada ~50-75 saat (timeout)
4. Kesimpulan: TIADA jalan kekalkan proses dalam sandbox ini

### Penyelesaian: Cloudflare Pages (hosting kekal)
1. Pasang wrangler 4.141.0 secara lokal
2. Cipta project: wrangler pages project create kerilla
3. Deploy: wrangler pages deploy web-kerilla --project-name kerilla
   -> 215 fail dimuat naik (3.91s)
   -> https://kerilla.pages.dev

### Domain custom
- CF_TOKEN_ACCESS tiada kebenaran DNS (Authentication error 10000)
- CF_TOKEN_DNS BERJAYA kemas kini:
  kerilla.nakhodacloud.top CNAME
    3e69afb1-...cfargotunnel.com  ->  kerilla.pages.dev (proxied)
- DNS id: 51891d282ec4... (lama)

### Keputusan
- https://kerilla.nakhodacloud.top  -> HTTP 200 (KEKAL, tanpa proses)
- https://kerilla.pages.dev         -> HTTP 200 (backup)
- Semua asset 200: version.json, map-meta.json, tiles/*
- Cache: public, max-age=0, must-revalidate (selamat untuk update)

### Arahan untuk deploy masa depan
  export CLOUDFLARE_API_TOKEN=$(grep CF_TOKEN_ACCESS /home/sewanode/kaihara/.secrets/cf.env | cut -d= -f2 | tr -d ' ')
  export CLOUDFLARE_ACCOUNT_ID=$(grep CF_ACCOUNT_ID /home/sewanode/kaihara/.secrets/cf.env | cut -d= -f2 | tr -d ' ')
  cd /home/sewanode/kaihara/poc
  node build-v3d.mjs
  node_modules/.bin/wrangler pages deploy web-kerilla --project-name kerilla --branch main

### Nota penting
- Tunnel peta-poc (3e69afb1) TIDAK lagi digunakan untuk kerilla
- peta.nakhodacloud.top (POC Oregon) masih guna tunnel - akan mati
  setiap kali sesi sandbox tamat, perlu restart manual jika diguna
- checkVersion() dalam app akan terus berfungsi (version.json di-Pages)


## PEMBESARAN UI v2 (versi 4c17994f) — Saiz "Material Large"

User minta lebih besar lagi ("seperti mockup semalam"). Mockup asal tiada
dalam sandbox (attachments hanya: banner logo 400x140, 3 skrinshot app).
Guna standard Material Design large + saiz Avenza/Google Maps:

| Elemen | v1 (e4e52ad3) | v2 (4c17994f) |
|---|---|---|
| Nav bar | 74px | 84px |
| Nav ikon | 27px | 30px |
| Nav teks | 12.5px | 14px |
| FAB | 60px | 68px |
| FAB ikon | 26px | 30px |
| Kompas | 60px | 68px |
| FAB gap | 14px | 16px |
| Butang menu | 48px | 52px |
| Menu ikon | 24px | 26px |
| GPS chip teks | 13px | 14px |
| Legenda lebar | 196px | 216px |
| Legenda header | 50px | 56px |
| Legenda teks | 12.5px | 13.5px |
| Swatch | 15px | 17px |
| Scale bar teks | 12.5px | 14px |

Ujian: statik 16/16, test-v3 34/35 (artifak jsdom sama), test-touch 33/33.
Deploy: Pages bf217952, live disahkan (semua penanda 4c17994f dijumpai).

Media query landskap: --nav:68px, FAB 56px, ikon 24px.
