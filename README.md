# POC Avenza Maps — Enjin + App Boleh Cuba

Dua bahagian:
1. **Tile Pyramid** (risiko terbesar Fasa 1) — dibuktikan dengan angka sebenar
2. **App boleh dibuka** — peta 100 MP + GPS sebenar + semua alat Avenza teras

---

## 1. JALANKAN APP (cuba sendiri)

```bash
cd poc
./run-app.sh          # atau: ./run-app.sh 3000
```

Kemudian buka **http://localhost:8080** pada telefon/desktop.

> **Nota GPS:** GPS peranti hanya berfungsi pada **localhost** atau **HTTPS**
> (kekangan keselamatan pelayar). Jika buka melalui IP rangkaian, guna
> **"Rekod Track"** (simulasi) untuk lihat titik biru bergerak.

### Apa yang boleh anda cuba

| Tindakan | Cara |
|---|---|
| Pan peta | Seret |
| Zoom | Scroll / pinch / butang + − |
| **GPS saya** | Butang ◎ atau "Mula + GPS saya" |
| Zoom pantas ke GPS | Tekan **Q** |
| Letak placemark | Alat 📍 → klik peta |
| Ukur jarak | Alat 📏 → klik 2+ titik |
| Geofence | Alat ⬡ → klik peta (200 m) |
| Rekod track | Alat ⏺ (simulasi perjalanan) |
| Reset | Alat ⤢ |

---

## 2. BUKTI: TILE PYRAMID MENYELESAIKAN MASALAH SEBENAR

```bash
node src/make-big-fixture.mjs    # jana peta 10,000 x 10,000 px
node src/bench-tiles.mjs         # benchmark monolitik vs tile
```

### Hasil sebenar (bukan andaian)

```
PETA UJIAN (had maksimum Avenza)
  10,000 x 10,000 px = 100 MP
  GSD 2 m/px -> merangkumi 20 km x 20 km
  381 MB piksel mentah dalam RAM

MASALAH: RENDER MONOLITIK
  Muat imej penuh : 4,777 ms
  Memori (RSS)    : 1,592 MB   <-- peranti 2-4 GB akan bunuh app ini

PENYELESAIAN: PIRAMID TILE
  2,139 tile, 6.8 MB jumlah, dibina dalam 22.5 s (sekali sahaja)

BUKTI: MUAT HANYA APA YANG KELIHATAN (viewport 1080x1920)
  Monolitik : 3.8 MB dimuat SETIAP KALI
  Tile      : 192 KB dimuat (77 tile)
  PENJIMATAN: 20x lebih sedikit

TITIK BIRU TEPAT MERENTAS SEMUA ZOOM
  z0 A=128  -> piksel (39.06, 39.06)
  z3 A=16   -> piksel (312.50, 312.50)
  z6 A=2    -> piksel (2500.00, 2500.00)
  (setiap level = transform diskalakan 2^n; tiada ralat)
```

### Ujian ketepatan app vs enjin

```
UTM app (JS) vs proj4 (rujukan) : ralat maks 0.0002 meter
Bulat latlon -> UTM -> latlon    : ralat 0.000133 m
GPS -> piksel (app vs enjin)     : ralat 0.0001 px   ✅
```

---

## 3. SENI BINA

```
src/
  worldfile.mjs        AffineTransform (A B C D E F) — matematik teras piksel <-> dunia
  crs.mjs              CRS projected + Haversine
  mapview.mjs          GeoMap / MapCollection / drawMarker / drawPolyline
  geotiff-reader.mjs   Baca GeoTIFF + validasi gate Map Store
  geofence.mjs         Geofence bulatan/poligon + FeatureStore
  tile-pyramid.mjs     Piramid tile XYZ + TileRenderer  <-- BARU
  make-fixture.mjs     Peta kecil (1024x768) untuk ujian unit
  make-big-fixture.mjs Peta 100 MP (10,000 x 10,000)    <-- BARU
  bench-tiles.mjs      Benchmark monolitik vs tile      <-- BARU
  demo.mjs             POC hujung-ke-hujung (10 seksyen)
  build-app.mjs        Jana app web                     <-- BARU
  test.mjs             16 ujian unit

web/                   APP (folder statik)
  index.html           App lengkap (25 KB, satu fail)
  map-meta.json        Metadata piramid
  tiles/{z}/{x}_{y}.png  2,139 tile
```

---

## 4. KEPUTUSAN: KENAPA TILE DULU, BUKAN FLUTTER PLUGIN

| | Monolitik | Tile |
|---|---|---|
| Memori (100 MP) | **1,592 MB** | 192 KB (viewport) |
| Muat semula setiap zoom | Ya (penuh) | Hanya tile baru |
| Peta boleh lebih besar daripada had Avenza | Tidak | **Ya** |
| Rework jika tukar bentuk data | Tinggi | — |

Tile mengubah **bentuk data** (skema DB, pipeline penerbit, API). Bina Flutter
plugin dahulu = tulis semula bila tukar ke tile. Sebab itu tile **dahulu**.

---

## 5. YANG BELUM ADA (jujur)

| Belum | Bila | Nota |
|---|---|---|
| App Flutter asli | Seterusnya | Web app ini sahkan logik + UX dahulu |
| GeoPDF / PDF raster | Kemudian | Perlu PDFium/Poppler |
| SQLite/SpatiaLite | Kemudian | Features kini in-memory |
| GPS luaran Bluetooth + NMEA | Fasa 4 | Perlu native |
| Store + billing + publisher portal | Fasa 3 | Lihat AVENZA_DEEP_RESEARCH.md |
| Simbol peta sebenar | Kemudian | Kini emoji marker |
| Import KML/GPX/SHP | Fasa 2/4 | Eksport ada; import perlu OGR |

---

## 6. APAKAH LANGKAH SETERUSNYA?

Selepas anda cuba app ini, pilih:
1. **App Flutter asli** — bungkus enjin ke mudah alih sebenar (2-3 minggu)
2. **GeoPDF** — sokong format sebenar yang penerbit guna
3. **Store + publisher portal** — mula bina flywheel kandungan
4. **Perhalus UX** — berdasarkan maklum balas anda semasa mencuba app ini
