import fs from 'node:fs';
import path from 'node:path';
import { buildTilePyramid } from './src/tile-pyramid.mjs';
import { AffineTransform } from './src/worldfile.mjs';

const canvas = JSON.parse(fs.readFileSync('data/user/kerilla-canvas-geo.json','utf8'));
const src = JSON.parse(fs.readFileSync('data/user/kerilla-geo.json','utf8'));
const W = canvas.width, H = canvas.height;
const { minLat, maxLat, minLon, maxLon } = canvas.bbox;

const tl = canvas.corners.topLeft, br = canvas.corners.bottomRight;
const A = (br.lon - tl.lon) / W, C = tl.lon;
const E = (br.lat - tl.lat) / H, F = tl.lat;
const transform = new AffineTransform({ A, B: 0, C, D: 0, E, F });

const OUT = 'web-kerilla/tiles';
fs.rmSync(OUT, { recursive: true, force: true });
console.log('Membina piramid tile (BILINEAR)...');
const built = buildTilePyramid({
  sourceImage: 'data/user/kerilla-map.png',
  width: W, height: H, transform, outDir: OUT,
  onProgress: ({z, zMax, tiles}) => console.log('  z'+z+'/'+zMax+'  '+tiles+' tile'),
});
console.log('SIAP: '+built.totalTiles+' tile, '+(built.totalBytes/1048576).toFixed(1)+' MB');

const meta = {
  ...built, crs: 'EPSG:4326',
  gsdMeters: 2.645,  // GSD disahkan dari metadata asal (purata horizontal/vertical)
  title: '073 Kerilla Aug26 Task Map',
  source: { author: src.author, producer: src.producer, file: 'kerilla.pdf' },
  bbox: canvas.bbox, transform: transform.toJSON(),
};
fs.writeFileSync('web-kerilla/map-meta.json', JSON.stringify(meta, null, 2));
console.log('Metadata -> web-kerilla/map-meta.json');
console.log('GSD: '+meta.gsdMeters+' m/px');
