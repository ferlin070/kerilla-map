/**
 * make-big-fixture.mjs — Jana peta pada HAD MAKSIMUM Avenza: 10,000 x 10,000 px.
 *
 * Ini kes yang POC pertama TIDAK uji. Kita mahu buktikan:
 *   1. Berapa lama ia ambil untuk membina
 *   2. Berapa besar fail mentah
 *   3. Kenapa render monolitik gagal pada peranti
 *   4. Bahawa tile pyramid menjadikannya pantas
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'data');
fs.mkdirSync(OUT, { recursive: true });

const W = 10000, H = 10000;
const PIXEL_SIZE = 2; // 2 m/px -> peta merangkumi 20km x 20km
const ORIGIN_X = 550000;
const ORIGIN_Y = 4770000;

console.log('Membina peta ' + W + ' x ' + H + ' px (' + (W * H / 1e6).toFixed(0) + ' MP)...');
const t0 = Date.now();

const png = new PNG({ width: W, height: H });
const d = png.data;

// Isi latar
for (let i = 0; i < W * H; i++) {
  d[i * 4] = 245; d[i * 4 + 1] = 240; d[i * 4 + 2] = 225; d[i * 4 + 3] = 255;
}
console.log('  latar diisi: ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');

// Hutan berkelompok (deterministik)
let seed = 12345;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
for (let k = 0; k < 120; k++) {
  const cx = rnd() * W, cy = rnd() * H, r = 300 + rnd() * 1500;
  const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(W, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(H, Math.ceil(cy + r));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const dx = (x - cx) / r, dy = (y - cy) / r;
      const dist = dx * dx + dy * dy;
      if (dist < 1) {
        const v = Math.floor(dist * 40);
        const i = (y * W + x) * 4;
        d[i] = 200 - v; d[i + 1] = 228 - v; d[i + 2] = 190 - v;
      }
    }
  }
}
console.log('  hutan: ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');

// Tasik
for (let k = 0; k < 60; k++) {
  const cx = rnd() * W, cy = rnd() * H, r = 200 + rnd() * 900;
  const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(W, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(H, Math.ceil(cy + r));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const dx = (x - cx) / r, dy = (y - cy) / r;
      const dv = (x - cx) / (r * 0.6), dw = (y - cy) / (r * 0.9);
      if (dv * dv + dw * dw < 1) {
        const i = (y * W + x) * 4;
        d[i] = 160; d[i + 1] = 205; d[i + 2] = 235;
      }
    }
  }
}
console.log('  tasik: ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');

// Jalan raya (grid besar, deterministik)
function road(x0, y0, x1, y1, w, r, g, b) {
  const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t);
    for (let oy = -w; oy <= w; oy++) {
      const yy = y + oy;
      if (yy < 0 || yy >= H) continue;
      for (let ox = -w; ox <= w; ox++) {
        const xx = x + ox;
        if (xx < 0 || xx >= W) continue;
        const idx = (yy * W + xx) * 4;
        d[idx] = r; d[idx + 1] = g; d[idx + 2] = b;
      }
    }
  }
}
// jalan utama
for (let i = 0; i < 12; i++) {
  const y = Math.floor((i + 1) * H / 13);
  road(0, y, W, y + (i % 3 - 1) * 300, 6, 255, 255, 255);
  road(0, y, W, y + (i % 3 - 1) * 300, 2, 230, 120, 60);
}
for (let i = 0; i < 12; i++) {
  const x = Math.floor((i + 1) * W / 13);
  road(x, 0, x + (i % 3 - 1) * 300, H, 6, 255, 255, 255);
  road(x, 0, x + (i % 3 - 1) * 300, H, 2, 230, 120, 60);
}
console.log('  jalan: ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');

fs.writeFileSync(path.join(OUT, 'big-preview.png'), PNG.sync.write({ width: W, height: H, data: d }, { colorType: 6 }));
console.log('  PNG ditulis: ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');

// Metadata
const meta = {
  id: 'poc-big-001',
  title: 'POC BIG Topo Map (100 MP, UTM 10N)',
  widthPx: W, heightPx: H,
  crs: 'EPSG:32610',
  gsdMeters: PIXEL_SIZE,
  worldFileParams: { A: PIXEL_SIZE, D: 0, B: 0, E: -PIXEL_SIZE, C: ORIGIN_X + PIXEL_SIZE / 2, F: ORIGIN_Y - PIXEL_SIZE / 2 },
};
fs.writeFileSync(path.join(OUT, 'big-manifest.json'), JSON.stringify(meta, null, 2));

// world file
fs.writeFileSync(path.join(OUT, 'big-topo.tfw'),
  [PIXEL_SIZE, 0, 0, -PIXEL_SIZE, ORIGIN_X + PIXEL_SIZE / 2, ORIGIN_Y - PIXEL_SIZE / 2].map(n => n.toFixed(6)).join('\n') + '\n');

const sz = fs.statSync(path.join(OUT, 'big-preview.png')).size;
console.log('');
console.log('SIAP dalam ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
console.log('  PNG: ' + (sz / 1048576).toFixed(1) + ' MB');
console.log('  Piksel mentah dalam memori: ' + (W * H * 4 / 1048576).toFixed(0) + ' MB');
console.log('  Merangkumi: ' + (W * PIXEL_SIZE / 1000).toFixed(0) + ' km x ' + (H * PIXEL_SIZE / 1000).toFixed(0) + ' km');
