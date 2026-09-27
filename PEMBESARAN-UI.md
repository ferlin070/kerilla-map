# PEMBESARAN UI — Ikut Bulatan Merah Anda

Versi: e4e52ad3

## DIAGNOSIS (sebelum fix)

Telefon anda: Android 360 CSS px viewport (576 fizikal / 1.6).
Semua elemen memenuhi minimum lama (44-48px) TETAPI:

1. FAB putih #fbfaf6 atas peta putih => hanya IKON 20px yang kelihatan.
   Dari skrinshot, yang nampak hanya ~27 CSS px 'objek terapung'.
   Kompas oren (jarum) TIDAK dikesan dalam skrinshot - terlalu kecil.
2. Nav ikon 21px + teks 10.5px = terlalu halus untuk jari.
3. GPS chip teks 11px = kecil.
4. Legenda teks 10.5px + swatch 12px = susah baca.

## PEMBESARAN (semua dalam px CSS)

| Elemen | Sebelum | Selepas | +%
|---|---|---|---|
| Nav bar tinggi | 62 | 74 | +19% |
| Nav ikon | 21 | 27 | +29% |
| Nav teks label | 10.5 | 12.5 | +19% |
| FAB butang | 48 | 60 | +25% |
| FAB ikon | 20 | 26 | +30% |
| Kompas | 48 | 60 | +25% |
| Butang menu | 44 | 48 | +9% |
| Menu ikon | 20 | 24 | +20% |
| GPS chip teks | 11 | 13 | +18% |
| GPS chip dot | 7 | 9 | +29% |
| Legenda lebar | 158 | 196 | +24% |
| Legenda header | 44 | 50 | +14% |
| Legenda teks | 10.5 | 12.5 | +19% |
| Swatch | 12 | 15 | +25% |
| Scale bar teks | 10.5 | 12.5 | +19% |

FAB gap 12->14px. Semua masih >= 8px antara satu sama lain.

## KEDUDUKAN AUTO-LARAS

Elemen yang guna var(--nav) auto laras:
- #fab bottom: var(--nav) + safe-area + 16px
- #sbar bottom: var(--nav) + safe-area + 14px
- #nav height: var(--nav) + safe-area

Media query landskap (max-height:440px) turut dikemas:
--nav:60px, ikon lebih kecil, FAB 52px.

## KEPUTUSAN UJIAN

- Statik: 14/14 nilai baharu disahkan dalam index.html
- test-v3.mjs: 34 lulus, 1 gagal (artifak jsdom clientHeight - sama seperti sebelum)
- test-touch.mjs: 33/33 lulus
- Sintaks JS: OK

## DEPLOY

Cloudflare Pages (hosting kekal):
- 215 fail, deployment 32e514e8
- https://kerilla.nakhodacloud.top -> HTTP 200
- version.json: e4e52ad3

## APA YANG ANDA AKAN NAMPAK

1. Nav bawah: lebih tinggi, ikon besar jelas, teks boleh baca
2. FAB kanan: butang 60px (dari nampak 27px ikon terapung),
   kompam oren jelas kelihatan
3. Butang menu atas kiri: 48px
4. GPS chip: teks lebih besar boleh baca
5. Legenda: lebih lebar, teks 12.5px, swatch 15px

Sila hard-refresh (atau tutup tab & buka semula) untuk versi baharu.
checkVersion() akan auto-reload jika cache lama dikesan.