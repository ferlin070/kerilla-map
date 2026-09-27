/**
 * compose-geopdf.mjs — Gabungkan imej GeoPDF menjadi satu peta georeferenced.
 *
 * Dari content stream PDF, susunan imej (dalam unit internal PDF):
 *   /Im10  @ (239,  -1)   2000 x 2000   <- besar, bawah-kiri
 *   /Im12  @ (2239, -1)   1169 x 2000   <- kanan
 *   /Im16  @ (239, 1999)  2000 x 452    <- atas
 *   /Im18  @ (2239,1999)  1169 x 452    <- atas-kanan
 *
 * Susunan:
 *   +-------------+--------+
 *   |    Im16     |  Im18  |   (452 tinggi)
 *   +-------------+--------+
 *   |    Im10     |  Im12  |   (2000 tinggi)
 *   +-------------+--------+
 *      2000 lebar   1169
 *
 * Jumlah: 3408 x 2452 piksel imej peta.
 *
 * Imej diletak dalam ruang "internal" (sebelum transform 0.24 yang di-apply
 * oleh operator 'cm' pertama). Kita bina satu kanvas dan letak setiap imej.
 */
import fs from 'node:fs';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';

// Kedudukan imej dalam ruang halaman (dari content stream), y dari BAWAH
const LAYOUT = [
  { file: 'img1_2000x2000.jpg', x: 239,  y: -1,   w: 2000, h: 2000 },
  { file: 'img2_1169x2000.jpg', x: 2239, y: -1,   w: 1169, h: 2000 },
  { file: 'img4_2000x452.jpg',  x: 239,  y: 1999, w: 2000, h: 452  },
  { file: 'img5_1169x452.jpg',  x: 2239, y: 1999, w: 1169, h: 452  },
];

const dir = 'data/user/extracted';
const CANVAS_W = 3408;
const CANVAS_H = 2452;

console.log('=== GABUNG IMAGE GEOPDF ===');
console.log('');
console.log('Kanvas: ' + CANVAS_W + ' x ' + CANVAS_H + ' px');
console.log('');

const canvas = new PNG({ width: CANVAS_W, height: CANVAS_H });
// Isi putih
for (let i = 0; i < CANVAS_W * CANVAS_H; i++) {
  canvas.data[i*4] = 255; canvas.data[i*4+1] = 255; canvas.data[i*4+2] = 255; canvas.data[i*4+3] = 255;
}

// Kesan kecil: imej y diukur dari BAWAH halaman, kita render dari ATAS
const MIN_Y = -1;
const MAX_Y = 2451;

for (const img of LAYOUT) {
  const p = dir + '/' + img.file;
  if (!fs.existsSync(p)) { console.log('  SKIP ' + img.file); continue; }
  const raw = fs.readFileSync(p);
  const dec = jpeg.decode(raw, { useTArray: true });
  console.log('  ' + img.file + ' -> letak @ (' + img.x + ',' + img.y + ') ' + dec.width + 'x' + dec.height);

  // y dari atas = (MAX_Y - (img.y + img.h)) ... dalam unit halaman
  const topFromTop = MAX_Y - (img.y + img.h);
  for (let sy = 0; sy < dec.height; sy++) {
    for (let sx = 0; sx < dec.width; sx++) {
      const dx = Math.round(img.x + sx);
      const dy = Math.round(topFromTop + sy);
      if (dx < 0 || dy < 0 || dx >= CANVAS_W || dy >= CANVAS_H) continue;
      const si = (sy * dec.width + sx) * 4;
      const di = (dy * CANVAS_W + dx) * 4;
      canvas.data[di]   = dec.data[si];
      canvas.data[di+1] = dec.data[si+1];
      canvas.data[di+2] = dec.data[si+2];
      canvas.data[di+3] = 255;
    }
  }
}

const outPng = 'data/user/kerilla-map.png';
fs.writeFileSync(outPng, PNG.sync.write(canvas, { colorType: 6, deflateLevel: 6 }));
console.log('');
console.log('Peta digabung -> ' + outPng + ' (' + (fs.statSync(outPng).size/1048576).toFixed(1) + ' MB)');
console.log('');

// Kira georeferencing untuk kanvas ini.
// Page point -> lon/lat diketahui. Content stream guna skala 0.24 + y flip:
//   page_x = 0.24 * internal_x ;  page_y = 595 - 0.24 * internal_y
// Jadi kita petakan internal -> page -> lon/lat.
const geo = JSON.parse(fs.readFileSync('data/user/kerilla-geo.json', 'utf8'));
const t = geo.transform;
const S = 0.24;
function internalToLonLat(ix, iy) {
  const px = S * ix;
  const py = 595 - S * iy;   // y dari bawah halaman
  return { lon: t.a*px + t.b*py + t.c, lat: t.d*px + t.e*py + t.f };
}
// Kanvas piksel -> internal: internal_x = MIN_X + px ; internal_y = MIN_Y + (CANVAS_H - py)
const MIN_X = 239 - 239; // kita crop mulai x=239
function canvasPixelToLonLat(px, py) {
  const ix = 0 + px;                 // kerana kanvas mulai pada x=239 sudah dikurangkan
  const iy = MIN_Y + (CANVAS_H - py);
  return internalToLonLat(ix, iy);
}
// Betulkan: kanvas x=0 sepadan internal x=239
function canvasToLonLat(px, py) {
  const ix = 239 + px;
  const iy = MIN_Y + (CANVAS_H - py);
  return internalToLonLat(ix, iy);
}

const c00 = canvasToLonLat(0, 0);                 // kiri-atas
const c10 = canvasToLonLat(CANVAS_W, 0);          // kanan-atas
const c01 = canvasToLonLat(0, CANVAS_H);          // kiri-bawah
const c11 = canvasToLonLat(CANVAS_W, CANVAS_H);   // kanan-bawah
console.log('Georeferencing kanvas:');
console.log('  kiri-atas  : ' + c00.lat.toFixed(6) + ', ' + c00.lon.toFixed(6));
console.log('  kanan-bawah: ' + c11.lat.toFixed(6) + ', ' + c11.lon.toFixed(6));
console.log('');

const lats=[c00.lat,c10.lat,c01.lat,c11.lat], lons=[c00.lon,c10.lon,c01.lon,c11.lon];
const minLat=Math.min(...lats),maxLat=Math.max(...lats),minLon=Math.min(...lons),maxLon=Math.max(...lons);
const midLat=(minLat+maxLat)/2;
console.log('  Bbox lat: ' + minLat.toFixed(6) + ' .. ' + maxLat.toFixed(6));
console.log('  Bbox lon: ' + minLon.toFixed(6) + ' .. ' + maxLon.toFixed(6));
console.log('  Saiz: ' + ((maxLat-minLat)*111.32).toFixed(2) + ' km x ' +
  (((maxLon-minLon)*111.32*Math.cos(midLat*Math.PI/180))).toFixed(2) + ' km');
console.log('  GSD: ' + ((((maxLon-minLon)*111.32*Math.cos(midLat*Math.PI/180))*1000)/CANVAS_W).toFixed(2) + ' m/px');

fs.writeFileSync('data/user/kerilla-canvas-geo.json', JSON.stringify({
  width: CANVAS_W, height: CANVAS_H,
  layout: LAYOUT,
  bbox: { minLat, maxLat, minLon, maxLon },
  corners: { topLeft: c00, topRight: c10, bottomLeft: c01, bottomRight: c11 },
}, null, 2));
