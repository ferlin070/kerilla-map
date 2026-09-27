/**
 * georef-kerilla.mjs — Bina transform affine PENUH (dengan rotasi) dari
 * georeferens GeoPDF, bukan sekadar axis-aligned.
 *
 * Isu: saya guna (0,0) dan (W,H) sahaja -> peta GeoPDF QGIS mempunyai
 * sedikit putaran/skew (kerana UTM Zone 48N tidak selari dengan lat/lon grid).
 * Ralat 55 m pada sudut bertentangan.
 *
 * Penyelesaian: least-squares affine dengan SEMUA 4 sudut + titik kawalan
 * perantaraan yang diturunkan dari georeferens PDF.
 */
import fs from 'node:fs';
import { AffineTransform } from './src/worldfile.mjs';

const canvas = JSON.parse(fs.readFileSync('data/user/kerilla-canvas-geo.json','utf8'));
const geo = JSON.parse(fs.readFileSync('data/user/kerilla-geo.json','utf8'));

const S = 0.24;
const MIN_X = 239, MIN_Y = -1;
const CW = canvas.width, CH = canvas.height;
const g = geo.transform;

// peta kanvas px -> point halaman PDF -> lon/lat (rujukan sebenar)
function canvasToPage(px, py) {
  const ix = MIN_X + px;
  const iy = MIN_Y + (CH - py);
  return { x: S*ix, y: 595 - S*iy };
}
function refLonLat(px, py) {
  const p = canvasToPage(px, py);
  return { lon: g.a*p.x + g.b*p.y + g.c, lat: g.d*p.x + g.e*p.y + g.f };
}

// Kumpul titik kawalan merentasi seluruh peta
const pts = [];
const NX = 9, NY = 7;
for (let j = 0; j < NY; j++) {
  for (let i = 0; i < NX; i++) {
    const px = (i / (NX - 1)) * CW;
    const py = (j / (NY - 1)) * CH;
    const r = refLonLat(px, py);
    pts.push({ col: px, row: py, lon: r.lon, lat: r.lat });
  }
}
console.log('Titik kawalan: ' + pts.length);

// Least-squares affine penuh:
//   lon = A*col + B*row + C
//   lat = D*col + E*row + F
function solve3(P, target) {
  let Sxx=0,Sxy=0,Sx=0,Syy=0,Sy=0,Sn=0,Sxt=0,Syt=0,St=0;
  for (const p of P) {
    const t = target(p);
    Sxx+=p.col*p.col; Sxy+=p.col*p.row; Sx+=p.col;
    Syy+=p.row*p.row; Sy+=p.row; Sn+=1;
    Sxt+=p.col*t; Syt+=p.row*t; St+=t;
  }
  const A=[[Sxx,Sxy,Sx],[Sxy,Syy,Sy],[Sx,Sy,Sn]], B=[Sxt,Syt,St];
  const det=(m)=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
  const D=det(A);
  const rep=(c)=>A.map((r,i)=>r.map((v,j)=>j===c?B[i]:v));
  return [det(rep(0))/D, det(rep(1))/D, det(rep(2))/D];
}

const [A,B,C] = solve3(pts, p=>p.lon);
const [D,E,F] = solve3(pts, p=>p.lat);
const t = new AffineTransform({ A, B, C, D, E, F });

console.log('');
console.log('=== TRANSFORM AFFINE PENUH (dengan rotasi) ===');
console.log('  lon = ' + A.toExponential(8) + '*col + ' + B.toExponential(8) + '*row + ' + C.toFixed(9));
console.log('  lat = ' + D.toExponential(8) + '*col + ' + E.toExponential(8) + '*row + ' + F.toFixed(9));
console.log('  B (skew lon) = ' + B.toExponential(3) + '   D (skew lat) = ' + D.toExponential(3));
console.log('  -> putaran ~' + (Math.atan2(D, E) * 180 / Math.PI).toFixed(3) + '°');

// Uji residual
let maxM = 0, sum = 0;
for (const p of pts) {
  const a = t.pixelToWorld(p.col, p.row);
  const dLat = (a.y - p.lat) * 111320;
  const dLon = (a.x - p.lon) * 111320 * Math.cos(p.lat * Math.PI/180);
  const e = Math.hypot(dLat, dLon);
  maxM = Math.max(maxM, e); sum += e;
}
console.log('');
console.log('Residual pada ' + pts.length + ' titik kawalan:');
console.log('  maks : ' + maxM.toFixed(3) + ' m');
console.log('  purata: ' + (sum/pts.length).toFixed(3) + ' m');

// Sudut peta
console.log('');
console.log('=== SEMAK SUDUT ===');
for (const [px,py,name] of [[0,0,'kiri-atas'],[CW,0,'kanan-atas'],[0,CH,'kiri-bawah'],[CW,CH,'kanan-bawah']]) {
  const a = t.pixelToWorld(px,py);
  const r = refLonLat(px,py);
  const err = Math.hypot((a.y-r.lat)*111320, (a.x-r.lon)*111320*Math.cos(r.lat*Math.PI/180));
  console.log('  ' + name.padEnd(12) + ' app: ' + a.y.toFixed(6)+','+a.x.toFixed(6) +
    '   rujukan: ' + r.lat.toFixed(6)+','+r.lon.toFixed(6) + '   ralat ' + err.toFixed(2) + ' m');
}

// Simpan metadata baru
const meta = JSON.parse(fs.readFileSync('tiles-kerilla/metadata.json','utf8'));
meta.transform = t.toJSON();
// GSD: guna panjang vektor
const gsdCol = Math.hypot(A, D) * 111320;
const gsdRow = Math.hypot(B, E) * 111320;
meta.gsdMeters = +Math.max(gsdCol, gsdRow).toFixed(3);
meta.rotation = +(Math.atan2(D, E) * 180 / Math.PI).toFixed(4);
for (const lv of meta.levels) {
  lv.degPerPixel = Math.hypot(lv.transform.A, lv.transform.D);
  lv.metersPerPixel = +(lv.degPerPixel * 111320).toFixed(3);
}
meta.sourceTransform = t.toJSON();
fs.writeFileSync('tiles-kerilla/metadata.json', JSON.stringify(meta, null, 2));
fs.writeFileSync('web-kerilla/map-meta.json', JSON.stringify(meta, null, 2));
console.log('');
console.log(maxM < 1 ? '✅ Ketepatan sub-meter pada SELURUH peta (bukan hanya sudut)' : '⚠ masih ada ralat ' + maxM.toFixed(2) + ' m');
console.log('');
console.log('GSD: ' + meta.gsdMeters + ' m/px | putaran: ' + meta.rotation + '°');
