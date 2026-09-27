# Debug Transform (Georeferencing) — Test Fizikal Lapangan

## Cara tukar transform (togol satu baris)
Dalam app-core.js (baris 4-5):

USE_LEGACY_TRANSFORM = true  -> guna transform LAMA (live sekarang, offset ~630m)
USE_LEGACY_TRANSFORM = false -> guna transform BARU (300dpi, GPTS/LPTS betul)
DEBUG_DUAL_GPS = true/false  -> papar 2 dot GPS serentak (merah=lama, hijau=baru)

## Mod 1: Togol transform aktif (satu dot)
Lepas tukar, rebuild + deploy:
  node build-v3d.mjs
  bash deploy-pages.sh

## Mod 2: Dual GPS dot (untuk test fizikal)
Set DEBUG_DUAL_GPS = true (biar USE_LEGACY_TRANSFORM = true):
  - Dot MERAH = transform LAMA (live sekarang)
  - Dot HIJAU = transform BARU (300dpi GPTS betul)
Kedua-dua dot papar SERENTAK. Perbezaan ~630m (1860px pada zoom penuh).

## Nilai transform
LAMA (legacy) : C=102.0636212170  (bbox imej JPEG crop)
BARU (300dpi) : C=102.0576590550  (GPTS/LPTS PDF, residual 0.26m)

GPS pengguna (102.0934117, 5.6792883):
  legacy -> pixel(1257, 303)   [MERAH]
  baru   -> pixel(1496, 2148)  [HIJAU]
  beza 1860px (~630m)

## Backup
Tag pre-300dpi-backup (commit 83cea9f) — rollback: git checkout pre-300dpi-backup
