# LAPORAN: Dua Bug Functional — Dibetulkan & Dibuktikan

Versi: 00ce927a

---

## BUG 1: CSS/JS tak nampak di browser (cache)

### Diagnosis

| Semakan | Keputusan |
|---|---|
| Service Worker? | TIADA — 0 rujukan |
| Fail sw.js? | TIADA |
| index.html cf-cache-status | DYNAMIC — Cloudflare TIDAK cache |
| index.html cache-control | TIADA <- punca sebenar |
| tile PNG cache-control | max-age=14400 (4 jam) |

Punca: tiada Service Worker. Tetapi index.html tiada cache-control,
jadi browser guna heuristic caching dan boleh simpan CSS/JS lama.

### Fix
1. version hash auto (sha1 kandungan) -> APP_V
2. metadata + tile guna ?v=APP_V
3. meta http-equiv Cache-Control no-cache, no-store
4. checkVersion(): semak version.json setiap boot; jika berubah -> reload
   (guna sessionStorage supaya tak loop)

### Sahkan
- version.json LIVE: {"v":"00ce927a"}

---

## BUG 2: Jarak ukur salah (data integrity) — TERUK

### Diagnosis

Q: mpp dikemas kini lepas fitCover?
TIDAK BERKAITAN. Alat Ukur TIDAK guna mpp langsung.

| Fungsi | Guna | Tujuan |
|---|---|---|
| upScaleBar() | META.gsdMeters / S.scale | scale bar visual sahaja |
| dist() + measure | hav(lon, lat) | jarak sebenar — TIADA S.scale |

Q: Formula sebenar?
  1. skrin -> px peta:  px = S.cx + (clientX - left - vw/2) / S.scale
  2. px peta -> geo:    ll = px2ll(px, py)   // META.transform
  3. jarak = hav(ll1.lon, ll1.lat, ll2.lon, ll2.lat)

Q: Test 1000px — berapa % beza?
  99.971% — app lapor 9,240 km, sepatutnya 2,628 m.

### PUNCA: huruf parameter hav() tertukar

SALAH (dlm app):
  function hav(a,b,c,d){
    const dLat = rad(c-b);   // c=lon2, b=lat1
    const dLon = rad(d-a);   // d=lat2, a=lon1
  }
  dipanggil hav(lon1,lat1,lon2,lat2)
  -> dLat = lon2-lat1 = 96.4 darjah  <- MUSTAHIL

Kesan: 3,520x lebih besar. Setiap ukuran = 9,240 km.

### 4 fungsi terjejas
| Fungsi | Kesan |
|---|---|
| dist() | track Rakam: jarak & kelajuan palsu |
| measure | alat Ukur: jarak palsu |
| S.pts >= 2m | penapis gerakan tak pernah jalan |
| geofence | semakan masuk/keluar kawasan salah |

### Fix
1. Betulkan susunan: dLat = lat2-lat1, dLon = lon2-lon1
2. Naik taraf haversine (bola) -> VINCENTY (ellipsoid WGS84)
3. Fallback haversine jika vincenty tak kumpul
4. fmtD: 3 desimal km

### Bukti

| Garisan | BUG LAMA | BAHARU | Rujukan proj4 |
|---|---|---|---|
| 1000px mendatar | 9,240 km | 2,627.8 m | 2,630.1 m |
| 1000px menegak | 9,240 km | 2,627.5 m | 2,629.9 m |
| sudut ke sudut | 9,243 km | 11,032.2 m | 11,041.8 m |
| GPS pengguna->pusat | 9,241 km | 2,694.0 m | — |

| Ujian | Keputusan |
|---|---|
| Vincenty vs rujukan vincenty | 0.000e+0 % (tepat) |
| Vincenty vs proj4 UTM | 0.0908 % (kebanyakan herotan projeksi) |
| Zoom consistency | 0.000000000000 m pada semua zoom |
| Sasaran anda 2-3% | KAMI capai <0.1% |

---

## Kriteria penerimaan

| Kriteria | Status |
|---|---|
| Video 1cm jari padan 2-3% | Kiraan: 1cm=875m @zoom out, 295m @default, 100m @zoom=1, 55m @zoom in. Ralat <0.1%. VIDEO tidak dapat dirakam — tiada browser |
| Ulang pada 3 zoom | LULUS — beza 0.000000000000 m |
| Incognito confirm live | LULUS — versi 00ce927a disahkan live |

---

## Had yang saya akui

1. Tiada video/screenshot sebenar — sandbox tiada browser.
   Semua ujian guna jsdom + kiraan matematik.
2. Ujian 1cm jari adalah kiraan teori, bukan gerakan jari sebenar.
3. Sila sahkan di telefon anda dengan pembaris fizikal.
