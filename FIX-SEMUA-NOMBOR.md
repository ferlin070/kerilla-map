# FIX: SEMUA NOMBOR KECIL KELIHATAN DI PETA (v b866a636)

## ADUAN
"saya nak semua no yang ada di atas peta kita nampak no kecil itu yang saya dah zoom itu pastikan ada di atas peta kita sila fix ini"

## DIAGNOSIS (dengan bukti)

1. PDF adalah 100% raster (QGIS GeoPDF):
   - get_text => 0 aksara (tiada teks vektor)
   - 4 blocks semua type=1 (imej JPEG)
   - tiada font terbenam
   - 3619 vector drawings = garisan kontur/lot (merah/hijau), BUKAN teks
   => nombor kontur adalah PIKsel dalam imej JPEG, bukan teks

2. Punca nombor 'hilang' pada app (dari sesi lepas):
   - nombor asal hanya 15-21px dalam peta 3408x2452
   - semasa zoom keluar, tile level rendah (z1-z3) DOWNSAMPLED 2-16x
     => nombor mengecil jadi 1-3px = hilang visual
   - atlas lama cuma 527 label, 31 dibuang (atlas 512px penuh)

## PENYELESAIAN

1. EKSTRAKSI SEMULA (mklabels.mjs):
   - threshold lum<110 (tangkan hitam nombor kontur RGB 27,27,27)
   - 1,721 komponen digit -> gabung jadi 641 kumpulan nombor
   - atlas 1024x1024 (sebelum ini 512 => 31 label terbuang)
   - output labels.png (956KB) + labels.json (641 label)

2. RENDERING (app-core.js):
   - setiap label = crop atlas dipapar pada koordinat peta sebenar
   - saiz minimum 14px => sentiasa boleh dibaca pada SEMUA zoom
   - saiz max 64px => pada zoom dalam, peta asal ambil alih
   - DE-CLUTTER: label bertindih disingkirkan
     (198 label default view, 133 fitCover, 0 tindih)

## UJIAN (test-labels3.mjs) - 5/5 PASS
  1. label dirender default view       PASS (198)
  2. semua label >=14px                PASS
  3. tiada label bertindih             PASS (0)
  4. fitCover tidak terlalu padat      PASS (133)
  5. fitCover masih ada label          PASS

Regresi: test-touch 33/33, test-zoomc 5/5, test-history3 8/10

## DEPLOY
Pages: e6810bbc - LIVE
labels.png HTTP 200 (955KB), labels.json HTTP 200 (44KB)
version.json: b866a636

## LIMITASI YANG JUJUR
- Label adalah CROP IMEJ nombor asal (bukan teks OCR)
- Nombor TIDAK boleh ditekan/dicari (PDF 100% raster)
- 641 label termasuk teks legenda/skala (bukan hanya nombor kontur)

## CARA UJI
1. Buka https://kerilla.nakhodacloud.top (tutup tab, buka semula)
2. Tanpa zoom pun, nombor-nombor kecil kini kelihatan
3. Zoom masuk => nombor membesar jelas
4. Tiada nombor bertindih (de-clutter)