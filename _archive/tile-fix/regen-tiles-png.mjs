import fs from 'node:fs';
import { PNG } from 'pngjs';

// Regenerate TILE PNG sahaja (bilinear), TANPA sentuh map-meta.json.
// Tile PNG bebas dari transform — hanya bergantung pada source image + scale.
// Metadata (transform, levels, mpp) kekal dari map-meta.json asal yang BETUL.

const TILE = 256;
const src = PNG.sync.read(fs.readFileSync('web-kerilla/kerilla-map.png'));
const W = src.width, H = src.height;
const fullZoom = Math.ceil(Math.log2(Math.max(W, H) / TILE));
const zMax = 4;

const OUT = 'web-kerilla/tiles';
fs.rmSync(OUT, { recursive: true, force: true });

let total = 0, totalBytes = 0;
for (let z = zMax; z >= 0; z--) {
  const scale = Math.pow(2, zMax - z);
  const levelW = Math.max(1, Math.ceil(W / scale));
  const levelH = Math.max(1, Math.ceil(H / scale));
  const tilesX = Math.ceil(levelW / TILE);
  const tilesY = Math.ceil(levelH / TILE);
  const zDir = OUT + '/' + z;
  fs.mkdirSync(zDir, { recursive: true });

  for (let tx = 0; tx < tilesX; tx++) {
    for (let ty = 0; ty < tilesY; ty++) {
      const out = new PNG({ width: TILE, height: TILE });
      for (let i = 0; i < TILE * TILE; i++) out.data[i * 4 + 3] = 0;
      for (let py = 0; py < TILE; py++) {
        for (let px = 0; px < TILE; px++) {
          const lx = tx * TILE + px, ly = ty * TILE + py;
          if (lx >= levelW || ly >= levelH) continue;
          const fx = lx * scale, fy = ly * scale;
          const x0 = Math.floor(fx), y0 = Math.floor(fy);
          const x1 = Math.min(W - 1, x0 + 1), y1 = Math.min(H - 1, y0 + 1);
          const wx = fx - x0, wy = fy - y0;
          const i00 = (y0 * W + x0) * 4, i10 = (y0 * W + x1) * 4;
          const i01 = (y1 * W + x0) * 4, i11 = (y1 * W + x1) * 4;
          const di = (py * TILE + px) * 4;
          for (let c = 0; c < 3; c++) {
            const v = (src.data[i00 + c] * (1 - wx) + src.data[i10 + c] * wx) * (1 - wy) +
                      (src.data[i01 + c] * (1 - wx) + src.data[i11 + c] * wx) * wy;
            out.data[di + c] = Math.round(v);
          }
          out.data[di + 3] = 255;
        }
      }
      const buf = PNG.sync.write(out, { colorType: 6, deflateLevel: 6 });
      fs.writeFileSync(zDir + '/' + tx + '_' + ty + '.png', buf);
      totalBytes += buf.length; total++;
    }
  }
  console.log('  z' + z + ': ' + (tilesX * tilesY) + ' tile');
}
console.log('SELESAI: ' + total + ' tile, ' + (totalBytes / 1048576).toFixed(1) + ' MB (bilinear)');
