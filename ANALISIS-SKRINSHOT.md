# ANALISIS SKRINSHOT ANDA — Penilaian Jujur

Versi: d3691ce6 (selepas pembetulan terakhir)

---

## APA YANG SAYA LIHAT dalam skrinshot anda

Saya analisis piksel demi piksel (576x1280):

| Elemen | Status | Bukti |
|---|---|---|
| Chrome telefon | ada | y=0..90, gelap #131313 |
| Header hijau 52px | BETUL | y=90..166, #1d503f |
| Peta full-screen | BETUL | y=166..1180, tiada jalur cream |
| GPS chip | ada | y=181..185, x=19..47 (#123128) |
| Legenda | ada | 30 baris border |
| Scale bar | ada | 47 baris border (versi baharu LIVE!) |
| FAB stack | ada | 2 kelompok kanan |
| Nav 5 item | BETUL | 5 kelompok, jarak seragam 114px = 72 CSS px |
| Cream terdedah | TIADA | 0.00% di kawasan peta |

Susunan menegak tepat seperti reka bentuk. Struktur UI betul.

---

## TETAPI 3 MASALAH SEBENAR YANG SAYA TEMUI

### 1. Peta nampak KOSONG — bukan bug app, tetapi pengalaman teruk

Sebab:
- Lokasi GPS anda (tile z4 4_1) hanya ada 3% kandungan peta
- Zoom semasa = fitCover 0.318 = 8.3 m/px
- Paparan menegak 6.49 km = SELURUH peta dalam satu skrin!
- Teks peta asal 28px jadi 9px skrin — TIDAK BOLEH BACA

Kandungan peta mengikut kawasan (dari skrinshot anda):
  kawasan atas (dekat GPS) : 11% kandungan
  kawasan tengah           : 29%
  kawasan bawah            : 35%

Peta asal QGIS memang ada kawasan kosong putih di utara.

### 2. FAB hampir TIDAK NAMPAK — kontras 1.04:1

Kontras WCAG yang saya ukur:
  paper FAB (#fbfaf6) vs peta putih : 1.04:1  *** FAIL ***
  border FAB (#d8d2c2) vs putih     : 1.51:1  *** LEMAH ***
  ikon nav (#8a8470) vs paper       : 3.58:1  *** bawah WCAG AA 4.5:1 ***

Butang putih atas peta putih - hanya shadow 13% yang bezakan.

### 3. Butang 'Cari Lokasi Saya' kekal zoom JAUH

fix() sebelum: S.scale=Math.max(S.scale, minScale())
-> kekal pada fitCover 0.318, papar 3.2x6.5 km, tiada guna.

---

## PEMBETULAN YANG SAYA BUAT (versi d3691ce6)

### 1. fix() zoom ke tahap GUNA
  kod baharu: S.scale = max(S.scale, min(vw/(1500/gsd), 2))
  -> papar ~1.5 km melintang
  -> 1 cm jari = 146 m (guna untuk kerja lapangan)

### 2. FAB jelas atas peta putih
  border: 1px #d8d2c2 -> 1.5px #b0a996 (lebih gelap)
  background: gradient #ffffff -> paper (kedalaman visual)
  shadow: 0.13 -> 0.22 alpha

### 3. Nav ikon lebih gelap
  #8a8470 (3.58:1) -> #5f5a4c (~5.1:1) LULUS WCAG AA

---

## PENGENALAN: SIRI BUG SEBENAR

Skrinshot ini mendedahkan yang pengesahan saya sebelum ini tak lengkap:

| Bug | Punca | Saya terlepas sebab |
|---|---|---|
| hav() 3520x salah | huruf tertukar | ujian jsdom tak uji nilai sebenar |
| FAB tak nampak | kontras 1.04:1 | ujian saiz sahaja, bukan kontras |
| Zoom tak guna | fix() kekal minScale | tak uji aliran pengguna sebenar |

---

## STATUS LIVE

  https://kerilla.nakhodacloud.top  versi d3691ce6
  semua endpoint HTTP 200

Silakan cuba: tekan Cari Lokasi Saya — sekarang akan zoom ke
tahap yang boleh guna, dan FAB lebih jelas.
