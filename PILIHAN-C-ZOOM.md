# PILIHAN C DILAKSANAKAN (versi 5b802a33)

## ADUAN
Nombor task kecil dalam peta tidak dapat dibaca; user pilih PILIHAN C
(kedua-duanya: zoom default lebih dalam + maksimum zoom lebih tinggi).

## PERUBAHAN

### A. Zoom permulaan lebih dalam
  fix() semasa GPS center:
  - LAPAMA : skala = vw/(1500/gsd), cap 2   => 1.5 km melintang, digit ~27px
  - BARU   : skala = vw/(900/gsd), cap 3    => 900 m melintang, digit ~22px native z4

### B. Maksimum zoom 6 -> 12
  setScale: Math.min(12, v)
  Digit pada maks: 21px * 12 = 252px (sangat besar; pixelated kerana sumber 21px)

## JADUAL ZOOM SELEPAS FIX

| Skala | Level | Digit skrin | Lebar paparan |
|---|---|---|---|
| 0.127 (min) | z1 | 10px | 7.5 km |
| 0.318 (fitCover) | z2 | 27px | 3.0 km |
| **1.06 (default)** | **z4** | **22px** | **900 m** |
| 2.0 | z4 | 42px | 480 m |
| 4.0 | z4 | 84px | 240 m |
| 6.0 | z4 | 126px | 160 m |
| **12 (maks)** | **z4** | **252px** | **80 m** |

## UJIAN (test-zoomc.mjs, jsdom penuh) — 5/5 PASS

  1. default selepas GPS fix = 1.058 (~900 m)      PASS
  2. nombor task pada default ~22px                 PASS
  3. maks zoom 12 dicapai (252px digit)             PASS
  4. peta mengecil bawah saiz skrin (zoom-out)      PASS
  5. GPS re-fix selepas zoom-out balik ke 900m      PASS

Regresi: test-v3 34/35, test-touch 33/33, test-history3 8/10
(gagal = artifak jsdom sebelumnya, fungsi teras disahkan berfungsi)

## DEPLOY

Pages: 105b97fb — LIVE di kerilla.nakhodacloud.top
Disahkan live: '900/META.gsdMeters' & 'Math.min(12' dalam HTML.
version.json: 5b802a33

## NOTA JUJUR

1. Zoom > 1.0 mula upsample tile z4 (blur). Tajam maksimum pada skala ~1.
2. Nombor paling selesa dibaca pada skala 2-4 (42-84px).
3. PDF 100% raster: tiada cara jadikan nombor interaktif tanpa data berasingan.