import fs from 'node:fs';
import { extractGeoMeasure, extractWkt, extractMediaBox, buildGeoTransform, residuals } from './src/geopdf.mjs';

const buf = fs.readFileSync('data/user/kerilla.pdf');
const txt = buf.toString('latin1');
const mb = extractMediaBox(txt);
const geo = extractGeoMeasure(txt);

console.log('=== DIAGNOSA UNIT ===');
console.log('LPTS mentah:', geo.lpts);
console.log('');
console.log('Nilai LPTS adalah 0 dan 1 -> ini NORMALISASI halaman [0..1], bukan point PDF.');
console.log('Untuk tukar ke point PDF: x_pt = x_norm * width, y_pt = y_norm * height');
console.log('');
console.log('TETAPI: /Bounds =', geo.bounds);
console.log('Bounds [0 1 0 0 1 0 1 1] bermaksud: untuk setiap titik, (xmin xmax ymin ymax).');
console.log('Ini mengesahkan LPTS dinormalisasi 0..1.');
console.log('');

// Tukar LPTS normalisasi -> point PDF sebenar
const lptsPt = [];
for (let i = 0; i < 4; i++) {
  lptsPt.push(geo.lpts[i*2] * mb.width, geo.lpts[i*2+1] * mb.height);
}
console.log('LPTS dalam point PDF:');
for (let i = 0; i < 4; i++) {
  console.log('  titik ' + i + ': x ' + lptsPt[i*2].toFixed(2) + '  y ' + lptsPt[i*2+1].toFixed(2));
}

const t = buildGeoTransform(lptsPt, geo.gpts);
console.log('');
console.log('=== TRANSFORM BETUL (point PDF -> lon/lat) ===');
console.log('  lon = ' + t.a.toExponential(6) + '*x + ' + t.b.toExponential(6) + '*y + ' + t.c.toFixed(8));
console.log('  lat = ' + t.d.toExponential(6) + '*x + ' + t.e.toExponential(6) + '*y + ' + t.f.toFixed(8));
console.log('  darjah/point: ' + t.degreesPerPoint.x.toExponential(4) + ' (lon), ' + t.degreesPerPoint.y.toExponential(4) + ' (lat)');

const r = residuals(t, lptsPt, geo.gpts);
let max = 0;
console.log('');
console.log('=== KETEPATAN ===');
for (const x of r) { console.log('  titik ' + x.i + ': ' + x.errM.toFixed(3) + ' m'); max = Math.max(max, x.errM); }
console.log(max < 1 ? '  ✅ TEPAT (' + max.toFixed(3) + ' m)' : '  ⚠');

console.log('');
console.log('=== LIPUTAN SEBENAR ===');
const c00 = t.pointToLonLat(0, 0);
const c10 = t.pointToLonLat(mb.width, 0);
const c01 = t.pointToLonLat(0, mb.height);
const c11 = t.pointToLonLat(mb.width, mb.height);
console.log('  Kiri-bawah : ' + c00.lat.toFixed(6) + ', ' + c00.lon.toFixed(6));
console.log('  Kiri-atas  : ' + c01.lat.toFixed(6) + ', ' + c01.lon.toFixed(6));
console.log('  Kanan-bawah: ' + c10.lat.toFixed(6) + ', ' + c10.lon.toFixed(6));
console.log('  Kanan-atas : ' + c11.lat.toFixed(6) + ', ' + c11.lon.toFixed(6));

const lats = [c00.lat, c10.lat, c01.lat, c11.lat], lons = [c00.lon, c10.lon, c01.lon, c11.lon];
const minLat = Math.min(...lats), maxLat = Math.max(...lats);
const minLon = Math.min(...lons), maxLon = Math.max(...lons);
const midLat = (minLat + maxLat) / 2;
const kmEW = (maxLon - minLon) * 111.32 * Math.cos(midLat * Math.PI / 180);
const kmNS = (maxLat - minLat) * 111.32;
console.log('');
console.log('  Saiz peta  : ' + kmNS.toFixed(2) + ' km (U-S) x ' + kmEW.toFixed(2) + ' km (B-T)');
console.log('  Kawasan    : Kelantan, Malaysia');
console.log('');
console.log('  GSD jika render 2000 px lebar: ' + ((kmEW * 1000) / 2000).toFixed(2) + ' m/px');
console.log('  GSD jika render 4000 px lebar: ' + ((kmEW * 1000) / 4000).toFixed(2) + ' m/px');

fs.writeFileSync('data/user/kerilla-geo.json', JSON.stringify({
  title: '073 Kerilla Aug26 Task Map',
  author: 'Ide Dummah Bin Idris',
  producer: 'QGIS 3.44.6-Solothurn',
  mediaBox: mb,
  normalisedLpts: geo.lpts,
  lptsPoints: lptsPt,
  gpts: geo.gpts,
  wkt: extractWkt(txt),
  transform: { a: t.a, b: t.b, c: t.c, d: t.d, e: t.e, f: t.f },
  accuracyM: max,
  bbox: { minLat, maxLat, minLon, maxLon },
}, null, 2));
console.log('Metadata -> data/user/kerilla-geo.json');
