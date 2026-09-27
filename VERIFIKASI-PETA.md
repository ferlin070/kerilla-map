# VERIFIKASI: PDF LAMPAIRAN vs PETA SISTEM

## SOALAN
"adakah peta ini (PDF lampiran) dan peta dalam sistem adalah sama?"

## JAWAPAN: YA — SAMA FAIL, BUKTI 3 LAPIS

### BUKTI 1: HASH CRIPTOGRAFIK (paling kukuh) 

  sha256 lampiran : 9311b882b5603ee1...bb0dd19a
  sha256 projek   : 9311b882b5603ee1...bb0dd19a
  saiz            : 4,373,446 bytes (kedua-duanya)

  Hash SHA-256 sama bit-demi-bit => fail yang IDENTIK sepenuhnya.
  kerilla.pdf dalam projek ADALAH fail yang anda hantar.

### BUKTI 2: METADATA PDF

  Author  : Ide Dummah Bin Idris
  Creator : QGIS 3.44.6-Solothurn
  Halaman : 1 (A4 landscape)

  Ini GeoPDF asal QGIS yang sama dari awal projek.

### BUKTI 3: SALURAN PEMBINAAN (kenapa korelasi 95.9% bukan 100%)

Peta sistem TIDAK dirender dari halaman PDF — ia diekstrak
terus dari imej JPEG terbenam DALAM PDF:

  /Im10 @ (239,-1)    2000x2000  bawah-kiri
  /Im12 @ (2239,-1)   1169x2000  kanan
  /Im16 @ (239,1999)  2000x452   atas
  /Im18 @ (2239,1999) 1169x452   atas-kanan
  Gabungan => kanvas 3408x2452 = kerilla-map.png

  Sistem guna PIXEL ASAL JPEG (lossless extract).
  Ujian korelasi saya pula raster-kan halaman PDF
  dengan pdftoppm (render berbeza: margin, teks tajuk,
  anti-aliasing, resampling) => itu punca 4% beza.
  Kandungan kandaran: 95.9% sepadan.

### BUKTI 4: GEOREFERENS

  Transform meta: (0,0)=lon 102.06362, lat 5.67194
  lon hujung kanan (3408,0) = 102.14447
  lat hujung bawah (0,2452) = 5.73019
  Kawasan: ~8.99 x 6.53 km, Kelantan
  GPS user (5.6793, 102.0934) DALAM lingkungan ini ✓

## KESIMPULAN

Peta dalam sistem DIJANA TERUS dari fail PDF ini:
  1. Ekstrak 4 JPEG terbenam (pixel asal, tiada kehilangan)
  2. Gabung jadi kanvas 3408x2452
  3. Bina piramid tiles z0-z4 (192 fail)
  4. Georeferens dari matrix transform GeoPDF QGIS

Tiada versi lain, tiada salinan diubahsuai.
Sama peta, sama koordinat, sama fail.