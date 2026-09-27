# VERSI XL + PELINDUNG ZOOM (23c5ea75)

## DIAGNOSIS ANOMALI (skrinshot 2:21PM)

Pengukuran piksel menunjukkan KEADAAN BERCAMPUR:

| Elemen | Ukuran | = CSS | v2 sepatutnya | Status |
|---|---|---|---|---|
| Header | 86px | 52-54 | 52 | BETUL |
| GPS chip | 85x51px | 51x31 | ~50x36 | BETUL |
| Legenda | 445px | 269 | 216+ | BETUL |
| Nav bar | 44px | **27** | 84 | *** KEcil 0.3x *** |
| Ikon nav | 13px | **8** | 30 | *** KECIL 0.27x *** |
| Label nav | 7px | **4.4** | 14 | *** KECIL 0.31x *** |

NISBAH konsisten ~0.3x untuk SEMUA elemen nav
=> Elemen nav dipaparkan pada 30% saiz sepatutnya
sedangkan header & chip BETUL.

## PUNCA PALING MUNGKIN

1. Browser zoom-out aktif (user pernah pinch-out) -
   viewport meta TIDAK halang pinch di sesetengah browser Android
2. ATAU WhatsApp crop+scale tidak seragam semasa compression

## FIX DILAKSANAKAN

### A. Saiz XL
| Elemen | v2 | XL |
|---|---|---|
| Nav bar | 84px | 96px |
| Nav ikon | 30px | 34px |
| Nav teks | 14px | 15.5px |
| FAB | 68px | 76px |
| FAB ikon | 30px | 34px |
| Kompas | 68px | 76px |
| Butang menu | 52px | 58px |

### B. zoomGuard (pelindung)  
Tambah visualViewport monitor dalam app-core.js:
- Kalau detect vv.scale < 0.95 => force reset ke 1
- Auto-check setiap 1.5s
- Event listener resize & scroll

## TEST

- Statik: 5/5 penanda XL dalam index.html
- Sintaks JS: OK
- test-v3: 34/35 (artifak jsdom sama)
- test-touch: 33/33

## DEPLOY

- Pages deployment cd30b17b
- Live disahkan: nav 96, fab 76, ikon 34, zoomGuard (4 rujukan)
- Purge zone cache: BERJAYA
- version.json: 23c5ea75

## ARAHAN UNTUK USER

1. Tutup tab browser sepenuhnya (swipe away)
2. Buka semula https://kerilla.nakhodacloud.top
3. checkVersion() akan auto-reload ke versi 23c5ea75
4. JANGAN pinch-out pada skrin - UI dah direka besar
5. Kalau masih kecil: screenshot + hantar, saya perlu tahu
   adakah zoomGuard berjaya (ada toast?)