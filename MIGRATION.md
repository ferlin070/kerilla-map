# Migrasi Storan — Sebelum Suis ke Transform 300dpi

## Masalah
Placemark/Measure/Geofence disimpan via px2ll (transform LEGACY yang salah).
Selepas suis ke transform BARU (300dpi), data ini akan beranjak 1.4–4.1 km
(kerana legacy ada flip Y + offset ~630m).

Track (rakam) SELAMAT — ia guna GPS sebenar (S.gps.lon/lat), bukan transform.

## Mekanisme yang disediakan
1. Butang "Backup storan" dalam menu Lagi:
   - Eksport SEMUA data (pins, measure, geofences, hist) ke JSON file
   - Termasuk transform + timestamp untuk rekod
2. Auto-backup: bila app suis ke transform baru (USE_LEGACY_TRANSFORM=false)
   dan ada data legacy, ia auto-simpan ke localStorage key "kerilla.backup.legacy"
   (simpan 5 salinan terakhir).

## Langkah migration (untuk pengguna)
1. SEBELUM suis: buka menu Lagi -> "Backup storan" -> simpan JSON
2. Suis ke transform baru (deploy)
3. Selepas suis: 
   - Track (hist): muncul betul (GPS sebenar)
   - Placemark/Measure/Geofence: akan beranjak -> padam dan buat semula,
     ATAU import balik dengan re-map (perlu ubah kod simpan pixel asal)

## Cadangan
Kerana app simpan lon/lat (bukan pixel), re-map TIDAK boleh dilakukan
tanpa ubah kod. Paling selamat: padam placemark lama + buat semula di lokasi betul.

## Data storan keys
- kerilla.pins      -> Placemark (lon,lat) [legacy, akan beranjak]
- kerilla.measure   -> Measure (lon,lat) [legacy, akan beranjak]
- kerilla.geo       -> Geofence (lon,lat,r) [legacy, akan beranjak]
- kerilla.hist      -> Trek (lon,lat dari GPS) [SELAMAT]
- kerilla.backup.legacy -> backup auto (5 salinan)
