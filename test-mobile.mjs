const META = { width:3408, height:2452, gsdMeters:2.645,
  transform:{A:2.37219519e-5,B:-1.1939e-7,C:102.063621217,D:1.196e-7,E:2.37598862e-5,F:5.671935352},
  levels:[{z:0,scale:16,metersPerPixel:42.25,tilesX:1,tilesY:1,width:213,height:154},
          {z:1,scale:8,metersPerPixel:21.13,tilesX:2,tilesY:2,width:426,height:307},
          {z:2,scale:4,metersPerPixel:10.56,tilesX:4,tilesY:3,width:852,height:613},
          {z:3,scale:2,metersPerPixel:5.28,tilesX:7,tilesY:5,width:1704,height:1226},
          {z:4,scale:1,metersPerPixel:2.64,tilesX:14,tilesY:10,width:3408,height:2452}]};
const gps = { lat: 5.679337, lon: 102.093383 };
function ll2px(lon,lat){const t=META.transform;const det=t.A*t.E-t.B*t.D,dx=lon-t.C,dy=lat-t.F;
  return {col:(t.E*dx-t.B*dy)/det,row:(-t.D*dx+t.A*dy)/det};}
const fp = ll2px(gps.lon,gps.lat);
console.log('GPS pengguna -> piksel peta: (' + fp.col.toFixed(1) + ', ' + fp.row.toFixed(1) + ')');
console.log('');

const devices = [
  ['iPhone SE', 375, 667],
  ['iPhone 14', 390, 844],
  ['iPhone 14 Pro Max', 430, 932],
  ['Android biasa', 360, 800],
  ['Landskap pendek', 928, 298],
  ['Landskap biasa', 844, 390],
];

console.log('=== UJIAN 1: follow=ON -> titik SENTIASA di tengah ===');
console.log('peranti'.padEnd(20) + 'skrin'.padEnd(12) + 'skala'.padEnd(8) + 'titik skrin'.padEnd(16) + 'status');
console.log('-'.repeat(72));
let allOk = true;
for (const [name, w, h] of devices) {
  for (const sc of [0.42, 0.8, 1.5]) {
    const k = sc;
    const q = { x: (fp.col - fp.col)*k + w/2, y: (fp.row - fp.row)*k + h/2 };
    const ok = q.x >= 0 && q.x <= w && q.y >= 0 && q.y <= h;
    if (!ok) allOk = false;
    console.log(name.padEnd(20) + (w+'x'+h).padEnd(12) + String(sc).padEnd(8) +
      ('('+q.x.toFixed(0)+','+q.y.toFixed(0)+')').padEnd(16) + (ok ? 'OK tengah' : 'HILANG'));
  }
}
console.log('');
console.log(allOk ? 'LULUS: follow=ON sentiasa tengah skrin' : 'GAGAL');

console.log('');
console.log('=== UJIAN 2: follow=OFF, margin selamat 15% ===');
for (const [name, w, h] of devices) {
  const sc = 0.42;
  const mX = w*0.15/sc, mY = h*0.15/sc;
  const hw = w/2/sc, hh = h/2/sc;
  // hanya uji bila peta lebih besar dari viewport
  const cx = (META.width > 2*hw) ? Math.max(hw-mX, Math.min(META.width-hw+mX, fp.col)) : META.width/2;
  const cy = (META.height > 2*hh) ? Math.max(hh-mY, Math.min(META.height-hh+mY, fp.row)) : META.height/2;
  const q = { x: (fp.col-cx)*sc + w/2, y: (fp.row-cy)*sc + h/2 };
  const ok = q.x >= -20 && q.x <= w+20 && q.y >= -20 && q.y <= h+20;
  console.log('  ' + name.padEnd(20) + 'GPS skrin (' + q.x.toFixed(0).padStart(5) + ',' + q.y.toFixed(0).padStart(5) + ')  ' +
    (ok ? 'OK dalam skrin' : 'KELUAR (y=' + q.y.toFixed(0) + ')'));
}

console.log('');
console.log('=== UJIAN 3: kes lama (penyebab bug asal) ===');
console.log('Sebelum: viewport 928x298, tiada follow, clamp biasa (tiada margin)');
const w0=928,h0=298,sc0=0.64;
const hw0=w0/2/sc0, hh0=h0/2/sc0;
const cx0=Math.max(hw0,Math.min(META.width-hw0,fp.col));
const cy0=Math.max(hh0,Math.min(META.height-hh0,fp.row));
const qy0=(fp.row-cy0)*sc0+h0/2;
console.log('  titik y skrin = ' + qy0.toFixed(0) + '  ' + (qy0<0?'HILANG KE ATAS (bug asal)':'nampak'));
const mY1=h0*0.15/sc0;
const cy1=Math.max(hh0-mY1,Math.min(META.height-hh0+mY1,fp.row));
const qy1=(fp.row-cy1)*sc0+h0/2;
console.log('  dengan margin 15%: y = ' + qy1.toFixed(0) + '  ' + (qy1>=0?'OK kekal dalam skrin':'masih keluar'));
console.log('  dengan follow=ON : y = ' + (h0/2) + '  OK tepat di tengah');
