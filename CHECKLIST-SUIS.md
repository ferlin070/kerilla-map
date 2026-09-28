# Senarai Semak Suis ke Live (Transform 600 DPI / GDAL)

## Status semasa
- Live (kerilla.nakhodacloud.top -> main): transform LEGACY (salah, flip Y + offset ~630m)
- Preview (preview-600dpi.kerilla.pages.dev): transform GDAL 600dpi (betul, residual <1.1m)
- Belum suis. Tunggu pengesahan pengguna.

## Senarai semak (ikut turutan)

### 1. Buang labels.png + mklabels.mjs
- [ ] Sahkan tile 600 DPI tunjuk nombor task kecil 1-39 pada zoom tinggi
      (zoom 2 PM2002A / 2 PM2001B)
- [ ] Padam web-kerilla/labels.png
- [ ] Padam web-kerilla/labels.json
- [ ] Padam mklabels.mjs (cari lokasi)
- [ ] Buang kod loadLabels() / render label dari app-core.js (SHOW_LABELS sudah false)
- [ ] Pastikan tiada rujukan labels.png dalam code

### 2. Naikkan versi cache
- [ ] APP_V / VER = sha1(skin+core) -> auto berubah bila code berubah
- [ ] Pastikan version.json dikemaskini
- [ ] Tile path guna "?v="+APP_V -> auto cache-bust

### 3. Sahkan md5 live selepas deploy
- [ ] Selepas deploy, jalankan:
      curl -s https://kerilla.nakhodacloud.top/map-meta.json | md5sum
      dan banding dengan md5 tempatan web-kerilla/map-meta.json
- [ ] Sahkan transform.C = 102.0576569392 (bukan 102.0636212170)
- [ ] Sahkan width=7017, height=4959, gsd=1.318 (bukan 3408, 2.645)

### 4. Kekalkan tag rollback
- [ ] Tag semasa: pre-300dpi-backup (83cea9f)
- [ ] Buat tag baharu: pre-600dpi-live (sebelum suis)
- [ ] Simpan folder web-kerilla (live) sebagai backup sebelum overwrite
- [ ] Pastikan boleh rollback: git checkout <tag> + redeploy

### 5. Migrasi storan (Placemark/Measure/Geofence)
- [ ] Export storan lama (butang "Backup storan") SEBELUM suis
- [ ] Track (hist) selamat (GPS sebenar)
- [ ] Placemark/Measure/Geofence akan beranjak 1.4-4.1km -> padam + buat semula
- [ ] (atau re-map jika pixel disimpan - belum diimplement)

## Cara deploy ke live
    wrangler pages deploy web-kerilla --project-name kerilla --branch main

## Cara rollback
    git checkout <tag-lama>
    wrangler pages deploy web-kerilla --project-name kerilla --branch main

## Status pelaksanaan (kod SEDIA, belum suis live)

| Item | Status |
|---|---|
| 1. Buang labels.png + mklabels.mjs (overlay) | ✅ Kod dibuang (loadLabels, LBL, render label) - fail belum dipadam |
| 2. APP_V + checkVersion() auto-reload | ✅ Sudah ada |
| 3. Deploy + sahkan md5 | ⏳ Belum (tunggu pengesahan) |
| 4. Tag pre-300dpi-backup kekal | ✅ Kekal (83cea9f) |
| 5. Key storan .v2 | ✅ kerilla.pins.v2 / measure.v2 / geo.v2 |
| 6. Notis sekali sahaja | ✅ geoChangeNotice() dalam boot |
| 7. Tolak koordinat luar GPTS | ✅ goToCoord semak LATMIN/LATMAX/LONMIN/LONMAX |

## Cara rollback (satu arahan)
    git checkout pre-300dpi-backup -- web-kerilla/ app-core.js
    wrangler pages deploy web-kerilla --project-name kerilla --branch main

## Fail yang perlu dipadam semasa suis (bukan sekarang)
- web-kerilla/labels.png
- web-kerilla/labels.json
- mklabels.mjs
