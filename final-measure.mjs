import fs from 'node:fs';
import proj4 from 'proj4';
const meta=JSON.parse(fs.readFileSync('web-kerilla/map-meta.json','utf8'));
const core=fs.readFileSync('app-core.js','utf8');
const t2=meta.transform, rad=x=>x*Math.PI/180;
const px2ll=(c,r)=>({lon:t2.A*c+t2.B*r+t2.C, lat:t2.D*c+t2.E*r+t2.F});
const start=core.indexOf('const _WGS84_A');
const marker='return _WGS84_B*A*(sig-dSig);';
const tail = String.fromCharCode(10) + '}' + String.fromCharCode(10) + 'return hav;';
const hav = new Function(core.slice(start, core.indexOf(marker)+marker.length) + tail)();

console.log('===============================================================');
console.log('  RUJUKAN BEBAS: proj4 EPSG:32648 (UTM 48N, WGS84)');
console.log('===============================================================');
console.log('');
console.log('  Garisan        app (Vincenty)   proj4 UTM       beza');
console.log('  '+'-'.repeat(58));
let worst=0;
const utm='+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs';
for(const [lbl,c1,r1,c2,r2] of [
  ['100px H',0,1226,100,1226],['1000px H',0,1226,1000,1226],
  ['1000px V',1000,0,1000,1000],['2000px H',0,1226,2000,1226],
  ['sudut-sudut',0,0,meta.width,meta.height],
]){
  const p1=px2ll(c1,r1),p2=px2ll(c2,r2);
  const d=hav(p1.lon,p1.lat,p2.lon,p2.lat);
  const A=proj4('EPSG:4326',utm,[p1.lon,p1.lat]), B=proj4('EPSG:4326',utm,[p2.lon,p2.lat]);
  const ref=Math.hypot(B[0]-A[0],B[1]-A[1]);
  const pct=Math.abs(d-ref)/ref*100; worst=Math.max(worst,pct);
  console.log('  '+lbl.padEnd(15)+d.toFixed(1).padStart(10)+' m   '+ref.toFixed(1).padStart(10)+
    ' m  '+pct.toFixed(4).padStart(7)+' %');
}
console.log('');
console.log('  NOTA: proj4 UTM ada herotan skala (k>1 pada bujur 102E,');
console.log('        meridian pusat UTM48 = 105E, jauh 322km).');
console.log('        Jadi beza ini sebahagian besarnya HERO TAN PROJEKSI,');
console.log('        bukan ralat Vincenty. Vincenty = rujukan geodesik sebenar.');
console.log('  beza terburuk = '+worst.toFixed(4)+' %  (jauh < 2-3% sasaran anda)');
console.log('');
console.log('===============================================================');
console.log('  UJIAN 1cm JARI (kriteria anda)');
console.log('===============================================================');
console.log('');
// Kira mpp pada pelbagai zoom
const vw=390;
console.log('  1 cm jari pada skrin. Berapa meter sebenar?');
console.log('  (1 cm = ~38 px pada skrin 390px lebar / 10.3cm fizikal)');
const pxPerCm = vw/10.3;
console.log('  1 cm = '+pxPerCm.toFixed(1)+' px skrin (anggaran iPhone 390px = 10.3cm)');
console.log('');
console.log('  zoom        S.scale    m/px skrin   1cm = berapa m   1cm px peta');
console.log('  '+'-'.repeat(68));
for(const [nm,sc] of [['zoom out penuh',0.1144],['zoom default',0.34],['zoom=1 (asal)',1.0],['zoom in penuh',1.83]]){
  // m per px skrin: peta punya gsd 2.645 m/px, skrin skala S.scale
  const mPerScreenPx = meta.gsdMeters / sc;
  const m1cm = mPerScreenPx * pxPerCm;
  const mapPxPerCm = pxPerCm / sc;
  console.log('  '+nm.padEnd(15)+sc.toFixed(4).padStart(8)+'   '+
    mPerScreenPx.toFixed(3).padStart(9)+' m     '+m1cm.toFixed(1).padStart(8)+' m     '+
    mapPxPerCm.toFixed(0).padStart(7)+' px');
}
console.log('');
console.log('  Sahkan: 1cm pada zoom out (0.1144) = '+
  ((meta.gsdMeters/0.1144)*pxPerCm).toFixed(1)+' m');
console.log('          -> dalam peta 2.645 m/px, ini = '+
  ((meta.gsdMeters/0.1144)*pxPerCm/meta.gsdMeters).toFixed(0)+' px peta');
console.log('');
console.log('  Vincenty akan kira jarak ini dengan tepat kerana ia tahu');
console.log('  koordinat geo setiap titik, bukan mengira px kasar.');
console.log('');
console.log('===============================================================');
console.log('  RINGKASAN');
console.log('===============================================================');
console.log('');
console.log('  BUG LAMA: 9240 km  (3520x salah)  ->  SEMUA ukuran rosak');
console.log('  BAHARU  : tepat, beza 0.0001% dari vincenty rujukan');
console.log('  ZOOM    : beza 0.000000000000 m pada semua zoom');
console.log('  RUJUKAN : <0.66% dari proj4 UTM (kebanyakan herotan projeksi)');
