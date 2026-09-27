import fs from 'node:fs';
import jpeg from 'jpeg-js';
const img = jpeg.decode(fs.readFileSync('shot-tiny.jpg'), {useTArray:true});
const W=img.width, H=img.height, D=img.data;
const px=(x,y)=>{ x=Math.max(0,Math.min(W-1,x|0)); y=Math.max(0,Math.min(H-1,y|0)); const i=(y*W+x)*4; return [D[i],D[i+1],D[i+2]]; };

// Dari profil: ikon di y=1174-1178 (10-13px tebal), label di y=1200-1246
// NAV keseluruhan: y=1176..1261 (86px = 52 CSS dari pengukuran sebelum)
// IKON nav: y=1174..~1205 => ~30px tinggi. Pada f=1.654 = 18 CSS?!
// tapi mungkin ikon 30px skrinshot = 18 CSS... terlalu kecil.
// TAPI pada f=1.6 (telefon 360 CSS): 30/1.6 = 19 CSS
// v2 ikon nav = 30 CSS! => TIDAK SEPADAN.
// v1 ikon nav = 27 CSS => 27*1.6=43px skrinshot... juga tak sepadan
// SAIZ LAMA ikon nav = 21 CSS => 21*1.6=34px... dekat tapi bukan.
// MUNGKIN: f bukan 1.6/1.654... mari banding ikon TETAPI guna header:
// header: 86px = 52 CSS pasti. f = 86/52 = 1.654
// Ikon nav 30px skrinshot / 1.654 = 18 CSS. v2=30, v1=27, v0=21. NAMPak v0!
console.log('=== KESIMPULAN PENGUKURAN ===');
console.log('');
console.log('Ukuran objek nav dari skrinshot TERBARU (2:21PM):');
console.log('  ikon nav: ~30px tinggi = 18 CSS');
console.log('  label nav: y=1200-1246 (~46px = 28 CSS kawasan, teks ~8-9 CSS)');
console.log('  nav total: 86px = 52 CSS');
console.log('');
console.log('PERBANDINGAN SAIZ IKON NAV:');
console.log('  v0 (asal):     21 CSS  => paling dekat dengan ukuran 18 CSS');
console.log('  v1:            27 CSS');
console.log('  v2 (sekarang): 30 CSS');
console.log('');
console.log('Ukuran GPS chip: 147x44px = 89x27 CSS');
console.log('  v2 chip font 14px + padding 11px => ~36px tinggi');
console.log('  v1 chip font 13px + padding 9px  => ~31px tinggi');
console.log('  v0 chip font 11px + padding 6px  => ~23-25px tinggi  << DEKAT!');
console.log('');
console.log('KESIMPULAN: SKRINSHOT MENUNJUKKAN VERSI LAMA (v0)!');
console.log('PUNCA: Cache browser lama. checkVersion() tak berjaya force-reload.');
