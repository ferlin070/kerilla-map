import fs from 'node:fs';
import { AffineTransform } from './src/worldfile.mjs';

const canvas = JSON.parse(fs.readFileSync('data/user/kerilla-canvas-geo.json','utf8'));
const geo = JSON.parse(fs.readFileSync('data/user/kerilla-geo.json','utf8'));
const meta = JSON.parse(fs.readFileSync('tiles-kerilla/metadata.json','utf8'));
const t = new AffineTransform(meta.transform);

console.log('=== UJIAN: PIKsel PETA -> LAT/LON vs GEOREFERENS PDF ===');
console.log('');
console.log('Titik kawalan GPTS dari PDF (4 sudut sebenar halaman):');
console.log('');

// Sudut halaman PDF (dalam point) -> lon/lat melalui transform asal
const S = 0.24;
const LAYOUT_MIN_X = 239, LAYOUT_MIN_Y = -1;
const CW = 3408, CH = 2452;

// Peta kanvas piksel (px,py) -> internal -> page point -> lon/lat
function canvasToPage(px, py) {
  const ix = LAYOUT_MIN_X + px;
  const iy = LAYOUT_MIN_Y + (CH - py);
  return { x: S*ix, y: 595 - S*iy };
}
const g = geo.transform;
function pageToLonLat(p){ return { lon: g.a*p.x+g.b*p.y+g.c, lat: g.d*p.x+g.e*p.y+g.f }; }

// Transform app (dari metadata)
function appPixelToLonLat(col,row){
  return { lon: t.A*col+t.B*row+t.C, lat: t.D*col+t.E*row+t.F };
}
function appLonLatToPixel(lon,lat){
  const det=t.A*t.E-t.B*t.D, dx=lon-t.C, dy=lat-t.F;
  return { col:(t.E*dx-t.B*dy)/det, row:(-t.D*dx+t.A*dy)/det };
}

console.log('  Piksel        app (lat,lon)              rujukan PDF (lat,lon)     ralat');
console.log('  ' + '-'.repeat(78));
let maxM = 0;
const pts = [[0,0],[CW,0],[0,CH],[CW,CH],[1704,1226],[800,1900]];
for (const [px,py] of pts) {
  const a = appPixelToLonLat(px,py);
  const ref = pageToLonLat(canvasToPage(px,py));
  const dLat = (a.lat-ref.lat)*111320;
  const dLon = (a.lon-ref.lon)*111320*Math.cos(ref.lat*Math.PI/180);
  const err = Math.hypot(dLat,dLon);
  maxM = Math.max(maxM, err);
  console.log('  ' + ('('+px+','+py+')').padEnd(14) +
    (a.lat.toFixed(6)+','+a.lon.toFixed(6)).padEnd(26) +
    (ref.lat.toFixed(6)+','+ref.lon.toFixed(6)).padEnd(26) +
    err.toFixed(2)+' m');
}
console.log('');
console.log(maxM < 5 ? '✅ App sepadan dengan georeferens PDF (ralat maks '+maxM.toFixed(2)+' m)' : '⚠ ralat '+maxM.toFixed(2)+' m');

console.log('');
console.log('=== UJIAN BULAT: lat/lon -> piksel -> lat/lon ===');
let roundMax = 0;
for (const [lon,lat] of [[102.10,5.70],[102.12,5.69],[102.08,5.72]]) {
  const p = appLonLatToPixel(lon,lat);
  const b = appPixelToLonLat(p.col,p.row);
  const e = Math.hypot((b.lat-lat)*111320,(b.lon-lon)*111320*Math.cos(lat*Math.PI/180));
  roundMax = Math.max(roundMax,e);
  console.log('  ' + lat.toFixed(4)+','+lon.toFixed(4) + ' -> piksel ('+p.col.toFixed(1)+','+p.row.toFixed(1)+') -> '+
    b.lat.toFixed(6)+','+b.lon.toFixed(6) + '  ralat '+e.toExponential(2)+' m');
}
console.log(roundMax < 0.001 ? '✅ Bulat tepat' : '⚠');
