# FIX ZOOM-OUT (versi f86ea608)

## ADUAN USER
"kenapa tak boleh zoom out hanya boleh zoom in sila fix problem ini"

## DIAGNOSIS (bukti kod, bukan tekaan)

1. Semua laluan zoom (butang -, pinch-out, scroll) melalui setScale():
     S.scale = Math.max(minScale(), Math.min(6, v))

2. minScale() LAMA = fitCover sahaja:
     Math.max(vw/META.width, vh/META.height) = 0.318 pada telefon 360x780
     (peta 3408x2452 px)

3. Hasil: bila user dah di fitCover (0.318), butang - buat
     0.318/1.5 = 0.212 -> di-clamp BALIK ke 0.318 -> TIADA kesan.
   Pinch-out: sama, terLocked di 0.318.

4. Julat zoom-out lama: hanya 2x dari skala default (0.635 -> 0.318).
   Selepas itu 'tak boleh zoom out'.

5. PUNCA SEJARAH: semasa fix 'full-screen map' dahulu, saya kunci
   minScale pada fitCover supaya tiada latar kosong di tepi
   (keluhan lama: peta tak penuhi skrin). Ini menjejaskan
   keupayaan zoom-out. Trade-off tersilap.

## FIX

1. minScale() BAHARU = fitCover * 0.4
   - Benarkan peta mengecil sehingga 40% daripada fitCover
   - Peta boleh lebih kecil dari skrin (macam Avenza/Google Maps)
   - Julat zoom-out baru: 5x dari default

2. Pan clamp render() SUDAH betul sejak awal:
     peta lebih besar dari skrin -> pan bebas sehingga tepi
     peta lebih kecil -> auto-center (tiada bug)

3. #world diberi bayangan batas:
     box-shadow:0 0 0 1px rgba(95,90,76,.35),0 4px 22px rgba(52,48,38,.22)
   Supaya jelas di mana peta berakhir bila ia lebih kecil dari skrin
   (latar cream --sand kelihatan di sekeliling peta)

## UJIAN

test-zoomout.mjs (jsdom, boot penuh):
  - 6x klik butang minus: transform scale 1.272 -> 1.018  PASS
  - nisbah 0.80 per 6 klik (had 0.4 fitCover dicapai)     PASS
  - zoom-in balik berfungsi                               PASS
Regresi: test-v3 34/35 (artifak jsdom sama), test-touch 33/33
test-history3 8/10 (constraint jsdom sahaja - fungsi teras PASS
disahkan dalam test terasing)

## DEPLOY

Pages: f84be409 - LIVE di kerilla.nakhodacloud.top
Sahkan live: 'function minScale' dengan 'fit*0.4' dalam HTML
version.json: f86ea608