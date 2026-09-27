/**
 * build-kerilla.mjs — Bina piramid tile + metadata untuk peta KERILLA sebenar.
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildTilePyramid } from './src/tile-pyramid.mjs';
import { AffineTransform } from './src/worldfile.mjs';

const canvas = JSON.parse(fs.readFileSync('data/user/kerilla-canvas-geo.json','utf8'));
const src = JSON.parse(fs.readFileSync('data/user/kerilla-geo.json','utf8'));
const W = canvas.width, H = canvas.height;

const { minLat, maxLat, minLon, maxLon } = canvas.bbox;

// Bina transform affine: piksel kanvas -> lon/lat.
// Peta ini hampir segi empat tepat (GeoPDF berskala kecil), jadi affine cukup.
// Guna sudut: (0,0)=kiri-atas, (W,H)=kanan-bawah
const tl = canvas.corners.topLeft;      // px(0,0)
const br = canvas.corners.bottomRight;  // px(W,H)
const A = (br.lon - tl.lon) / W;        // lon per px
const C = tl.lon;
const E = (br.lat - tl.lat) / H;        // lat per px (negatif, y ke bawah)
const F = tl.lat;
const transform = new AffineTransform({ A, B: 0, C, D: 0, E, F });
console.log('Transform piksel->dunia (lon/lat):');
console.log('  lon = ' + A.toExponential(6) + '*col + ' + C.toFixed(8));
console.log('  lat = ' + E.toExponential(6) + '*row + ' + F.toFixed(8));
console.log('');

// Bina piramid tile
const OUT = 'tiles-kerilla';
fs.rmSync(OUT, { recursive: true, force: true });
console.log('Membina piramid tile...');
const built = buildTilePyramid({
  sourceImage: 'data/user/kerilla-map.png',
  width: W, height: H,
  transform,
  outDir: OUT,
  onProgress: ({z, zMax, tiles, levelW, levelH}) =>
    console.log('  z' + String(z).padStart(2) + '/' + zMax + '  ' + levelW + 'x' + levelH + '  ' + tiles + ' tile'),
});
console.log('');
console.log('SIAP: ' + built.totalTiles + ' tile, ' + (built.totalBytes/1048576).toFixed(1) + ' MB, ' + (built.buildMs/1000).toFixed(1) + 's');

// Metadata untuk app
const meta = {
  ...built,
  crs: 'EPSG:4326',
  gsdMeters: +(Math.abs(1/A) * 111320 * Math.cos((minLat+maxLat)/2*Math.PI/180)).toFixed(3),
  title: '073 Kerilla Aug26 Task Map',
  source: { author: src.author, producer: src.producer, file: 'kerilla.pdf' },
  bbox: canvas.bbox,
  transform: transform.toJSON(),
};
fs.writeFileSync(path.join(OUT, 'metadata.json'), JSON.stringify(meta, null, 2));
fs.writeFileSync('web-kerilla/map-meta.json', JSON.stringify(meta, null, 2));
console.log('');
console.log('Metadata -> ' + OUT + '/metadata.json');
console.log('GSD: ' + meta.gsdMeters + ' m/px (zoom penuh)');
console.log('');
const midLat=(minLat+maxLat)/2;
console.log('Liputan: ' + ((maxLat-minLat)*111.32).toFixed(2) + ' km (U-S) x ' +
  ((maxLon-minLon)*111.32*Math.cos(midLat*Math.PI/180)).toFixed(2) + ' km (B-T)');
console.log('Lokasi : lat ' + minLat.toFixed(5) + '..' + maxLat.toFixed(5) +
  ', lon ' + minLon.toFixed(5) + '..' + maxLon.toFixed(5));
