# Jadual Ujian Landmark — Georeferencing (Legacy vs 300dpi)

## URL
- LIVE (legacy):  https://kerilla.nakhodacloud.top
- PREVIEW (300dpi): https://preview-300dpi.kerilla.pages.dev

## Cara test
1. Buka kedua-dua URL bersebelahan (split screen telefon/2 tab)
2. Di PREVIEW, tekan "Cari Lokasi Saya" -> nampak 2 dot (merah=legacy, hijau=300dpi)
3. Letak placemark (pin) pada landmark, baca koordinat lat/lon yang dipaparkan
4. Banding koordinat dengan OSM/satelit (https://www.openstreetmap.org)

## Landmark struktur (4 sudut GPTS PDF — rujukan sebenar)
| Landmark | lat | lon |
|---|---|---|
| Utara-Barat (kiri-atas) | 5.7301412 | 102.0576569 |
| Selatan-Barat (kiri-bawah) | 5.6712386 | 102.0579571 |
| Selatan-Timur (kanan-bawah) | 5.6716560 | 102.1411774 |
| Utara-Timur (kanan-atas) | 5.7305629 | 102.1408857 |

## Transform
| | C (lon offset) | E (lat/row) | width x height |
|---|---|---|---|
| Legacy (live) | 102.0636212170 | +2.376e-5 (flip Y) | 3408x2452 |
| Baru (300dpi) | 102.0576590550 | -2.376e-5 (betul) | 3509x2480 |

## Keputusan percanggahan (1860px vs 630m)
Beza 1860px = flip Y (~1845px) + offset lon (~239px). Bukan 630m sahaja.
Legacy transform ADA flip Y (julat lat negatif: -0.0583 deg = terbalik).
Baru transform BETUL (julat lat +0.0589 deg, sepadan GPTS 0.0589).

## Ujian jarak relatif (independen, programatik)
Kedua-dua transform beri jarak relatif SAMA (beza 0-1m) antara semua
pasangan landmark dalaman. Ini bukti kedua-dua mewakili geografi SAMA
(shape betul), cuma offset mutlak berbeza.

## Kriteria lulus
Satu transform mesti ada ralat landmark <10m secara konsisten pada semua
titik (vs OSM/satelit), dan satu lagi tidak.
Jika KEDUA-DUA gagal, GPTS PDF mungkin bermasalah -> perlu titik kawal lapangan.
