# DIAGNOSIS: NOMOR TASK KECIL — ADA ATAU TIADA?

## ADUAN
"kenapa peta kita tiada no task yang kecil tu di dalam setiap lokasi,
ada no kecil yang kena zoom itu, kenapa peta kita tiada"

## JAWAPAN: NOMOR ITu ADA! BUKTI 4 LAPIS:

### BUKTI 1: PDF asal TIADA teks vektor
  pdftotext => 0 karakter. pdffonts => tiada font.
  100% kandungan peta = 4 imej JPEG terbenam.
  Maka nomor task HANYA wujud sebagai piksel dalam imej.

### BUKTI 2: Nomor ADA dalam peta sistem (kerilla-map.png)
  Scan komponen bersambung (flood-fill, ambang <120):
  1,372 komponen kecil dikesan = digit teks kecil
  Contoh: @ (1725,185) 10x22px, @ (2369,233) 12x17px, ...

### BUKTI 3: ASCII art digit yang dijumpai (kawasan 1725,185):
  Jelas menunjukkan bentuk digit '0', '1', '7', '3', dan
  barisan nombor lain - ketinggian digit asal ~21px.

### BUKTI 4: Digit terselamat dalam tiles app
  tiles/4/6_0.png (z4) => digit jelas #
  tiles/2/1_0.png (z2) => digit samar (downsampling normal)

## KENAPA 'TAK NAMPAK' DALAM APP — ANALISIS ZOOM

Digit asal: 21px (dalam kerilla-map.png 3408x2452)

| Skala app | Level tile | Saiz digit skrin | Boleh baca? |
|-----------|-----------|------------------|-------------|
| 0.318 (fitCover) | z2 | 6.7px | TAK NAMPAK |
| 0.635 (default skrg) | z3 | 27px | samar |
| 1.0 | z4 | 21px | kecil |
| 2.0 | z4 | 42px | YA |
| 3.0 | z4 | 63px | YA |
| 6.0 (max) | z4 | 126px | YA |

DEFAULT app sekarang = skala 0.635 (papar 1.5km melintang)
=> digit hanya 27px + stroke nipis = SUSAH DIBACA
=> user rasa 'tiada nomor'

## FIX

1. Skala permulaan boot: 1.5km => 900m melintang
   (digit ~22px dari sumber penuh z4, lebih jelas)
2. Zoom maksimum kekal 6.0 (digit 126px — sangat jelas)
3. Terangkan pada user: nomor mula jelas pada zoom 2x+

## NOTA JUJUR

PDF ini 100% raster (tiada teks vektor). Jadi:
- TAK BOLEH buat nomor jadi label interaktif (tap untuk info)
  tanpa menaip semula data secara manual
- Nomor hanya akan jelas bila zoom masuk — sama seperti
  buka PDF asal dalam viewer/ Avenza
- Jika mahu label interaktif (macam Avenza Pro dengan layer),
  perlu data task dalam format berasingan (CSV/GeoJSON)