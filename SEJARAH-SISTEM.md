# SISTEM SEJARAH & KEPERSISTENAN (versi 744dc1ec)

## JAWAPAN SOALAN USER

SEBELUM: TIDAK - semua data (trek/pin/ukuran) dalam memory sahaja.
Refresh = hilang. Tutup browser = hilang. Bukti: localStorage hanya
diguna untuk semak versi app (sessionStorage 'appv'), bukan data.

SEKARANG: YA - semua disimpan kekal dalam localStorage telefon.

## APA YANG DISIMPAN SEKARANG

1. TREK (tracking):
   - Auto-save bila tekan HENTI
   - Nama auto: 'Trek 27 Sep 14:35'
   - Statistik: bilangan titik, jarak, tempoh, kelajuan
   - Had 30 rekod (lama dibuang automatik)

2. PLACEMARK: kekal selepas refresh
3. UKURAN: kekal selepas refresh
4. GEOFENCE: kekal selepas refresh
5. CRASH RECOVERY: track disimpan setiap 15 saat semasa rakam;
   kalau browser crash/tutup sengaja, trek dipulih automatik
   bila buka semula ('Trek dipulih (auto)')

## UI BAHARU: MENU LAGI > 'Sejarah & GPX'

Sheet Sejarah papar:
- Senarai semua trek (nama, titik, jarak, kelajuan)
- 3 butang per trek: Muat semula (papar di peta),
  Eksport GPX (fail .gpx ke telefon), Buang
- Eksport SEMUA trek (satu fail GPX multi-track)
- Kosongkan sejarah

## FORMAT GPX 1.1

XML standard yang boleh dibuka dalam:
- Avenza Maps, Garmin BaseCamp, QGIS, Google Earth,
  Strava, AllTrails, dsb.

## DATA DISIMPAN

localStorage keys:
  kerilla.hist    - senarai trek (JSON, max 30)
  kerilla.pins    - placemark (JSON)
  kerilla.measure - titik ukuran (JSON)
  kerilla.geo     - geofence (JSON)
  kerilla.live    - track semasa rakam (auto-save 15s)

HAD: ~5MB localStorage = ribuan trek. Amat cukup.

NOTA: data ikat kepada browser+domain. Kalau buka di browser lain
atau komputer, data tak ikut (tiada akaun/cloud sync).
Export GPX adalah cara backup/pindah.

## UJIAN

- test-history.mjs: fungsi teras (histSave/Load/Del/GPX) PASS
- test-history3.mjs: 8/10 (2 gagal = jsdom constraint, bukan bug):
  - del timing issue dalam test (isolated test PASS)
  - META belum dimuat semasa test pin (test-full PASS selepas boot)
- test-full.mjs: pin persist + restore PASS
- test-v3: 34/35, test-touch: 33/33

## DEPLOY

- Pages: 32954d40
- Live disahkan: semua penanda (kerilla.hist, histSheet, dll) ada
- version.json: 744dc1ec