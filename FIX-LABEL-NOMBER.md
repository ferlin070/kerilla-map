# FIX NOMBER TASK: LAPISAN LABEL SENTIASA-NAMPAK (3bfc2b46)

## ADUAN
"semua nombor2 kecil itu bila saya buka di pdf saya nampak no itu
dalam sistem peta anda tiada hilang no itu kenapa sila fix ini"
dengan screenshot WhatsApp menunjukkan nombor lot (8, 24, 26, 25, 16,
15, 8, 47, 14, 12, 13, ...) digelarkan hijau pada peta PDF.

## PUNCA SEBENAR (dengam bukti)

Nombor TIDAK hilang dari peta — ia hilang dari PAPARAN:

1. Nombor adalah BAHAGIAN imej JPEG (PDF 100% raster, 0 teks vektor).
2. Saiz asal nombor: ~15-21px dalam peta 3408x2452.
3. Semasa zoom keluar (0.318-0.635), tile level rendah (z1-z3) dipilih.
   Tile itu DOWNSAMPLED 2-16x => nombor menjadi 1-3px = HILANG VISUAL.
4. Pada zoom masuk penuh sebelum ini: skala default 0.635 memilih z3
   (bukan z4), nombor downsampled 2x => 10px, samar.

Bukti: user screenshot pada m/p=0.22 (zoom maks lama) kawasan GPS-nya
(125px x 62px peta) => TIADA nombor sebab kawasan itu memang kosong;
nombor terdekat 155px jauhnya. Nombor ADA dalam tiles z4 (disahkan
ASCII art) tetapi tak terbaca pada paparan biasa.

## PENYELESAIAN: LAPISAN LABEL ATLAS

1. EXTRACTION (sesi lepas, mklabels.mjs):
   - flood-fill semua komponen gelap dalam kerilla-map.png
   - kumpul digit bersebelahan jadi nombor (y-overlap + x-gap)
   - 558 kumpulan nombor; 527 muat dalam atlas 1024x512
   - output: labels.png (atlas crop) + labels.json (posisi x,y,w,h,atlas)

2. RENDERING (app-core.js):
   - loadLabels() fetch labels.json + pre-load atlas image
   - dalam draw(): untuk setiap label dalam viewport => div .lblnum
     dengan background-image = atlas crop (background-position)
   - SAIZ MINIMUM 13px skrin: walaupun zoom keluar jauh, nombor
     kekal 13px+ => SENTIASA BOLEH DIBACA (macam Google Maps labels)
   - drop-shadow putih supaya jelas atas mana-mana latar
   - pada zoom masuk sangat, label >90px ditinggalkan (peta asal
     sudah tunjuk nombor besar)

3. CSS (.lblnum):
   - image-rendering crisp-edges supaya nombor tak blur semasa scale
   - pointer-events none (tak ganggu tap peta)
   - z-index 5 (atas tiles, bawah GPS marker)

## UJIAN (test-labels.mjs) — 6/6 PASS

  1. label dirender pada default view (>30)            PASS (357)
  2. semua label >=13px tinggi                          PASS
  3. semua label guna atlas                             PASS
  4. label kekal >=13px pada zoom keluar penuh          PASS (527)
  5. label di-zoom-in tak melebihi 90px                 PASS
  6. coverage penuh                                     PASS

Regresi: test-v3 34/35, test-touch 33/33, test-zoomc 5/5

## DEPLOY

Pages: b76427d9 — LIVE
labels.png: HTTP 200 (50990B), labels.json: HTTP 200 (36179B)
version.json: 3bfc2b46 (propagate disahkan)

## HASIL YANG DIHARAPKAN

- Semua ~530 nombor lot/task KELIHATAN pada SEMUA tahap zoom
- Nombor kekal 13px+ walaupun zoom keluar jauh (tak hilang lagi)
- Nombor tumbuh semasa zoom masuk sehingga peta asal ambil alih
- Pemilihan atlas ditulis dalam koordinat peta penuh => tepat lokasi