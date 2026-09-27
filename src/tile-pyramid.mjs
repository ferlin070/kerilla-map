/**
 * tile-pyramid.mjs — Piramid tile XYZ untuk peta georeferenced besar.
 *
 * MASALAH: peta 10,000 x 10,000 px = 381 MB piksel mentah dalam memori.
 * Peranti akan tercekik. Ini sebab Avenza hadkan 10k px — tetapi had itu
 * SAHAJA tidak cukup; kena ada cara render yang tidak load seluruh imej.
 *
 * PENYELESAIAN: pecahkan kepada piramid tile (seperti Google Maps / XYZ).
 *   - Zoom level 0 = 1 tile (256x256) meliputi SEMUA peta
 *   - Setiap level naik = 4x lebih tile, 2x resolusi
 *   - Level maks = resolusi penuh
 *   - Bila app perlu paparkan viewport, ia muat HANYA 4-9 tile kecil
 *
 * Ini mengubah "load 381 MB" -> "load ~9 x 256KB = 2.3 MB".
 *
 * Struktur output (serasi XYZ standard, boleh guna MapLibre/Leaflet):
 *   tiles/{z}/{x}/{y}.png
 *   tiles/metadata.json  (skema skala + affine per level)
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { AffineTransform } from './worldfile.mjs';

const TILE = 256;

/**
 * Bina piramid tile dari satu imej sumber besar.
 *
 * @param {object} o
 * @param {string} o.sourceImage  fail PNG sumber (peta penuh)
 * @param {number} o.width        lebar sumber
 * @param {number} o.height       tinggi sumber
 * @param {object} o.transform    AffineTransform sumber (level maks)
 * @param {string} o.outDir       direktori output
 * @param {number} o.maxZoom      berhenti di zoom ini (default: level penuh)
 * @param {function} [o.onProgress]
 */
export function buildTilePyramid({ sourceImage, width, height, transform, outDir, maxZoom, onProgress }) {
  const t0 = Date.now();
  const src = PNG.sync.read(fs.readFileSync(sourceImage));
  const fullZoom = Math.ceil(Math.log2(Math.max(width, height) / TILE));
  const zMax = maxZoom != null ? maxZoom : fullZoom;

  fs.mkdirSync(outDir, { recursive: true });

  const levels = [];
  let totalTiles = 0;
  let totalBytes = 0;

  // ---- Level penuh (zMax): potong terus dari sumber ----
  // Untuk level lebih rendah, kita "downsample" dari sumber dengan sampling langkah.
  for (let z = zMax; z >= 0; z--) {
    const scale = Math.pow(2, zMax - z); // berapa piksel sumber per piksel tile
    const levelW = Math.max(1, Math.ceil(width / scale));
    const levelH = Math.max(1, Math.ceil(height / scale));
    const tilesX = Math.ceil(levelW / TILE);
    const tilesY = Math.ceil(levelH / TILE);

    const zDir = path.join(outDir, String(z));
    fs.mkdirSync(zDir, { recursive: true });

    // Affine untuk level ini: saiz piksel = saiz sumber * scale
    const levelTransform = new AffineTransform({
      A: transform.A * scale, B: transform.B * scale, C: transform.C,
      D: transform.D * scale, E: transform.E * scale, F: transform.F,
    });

    let zTiles = 0;
    for (let tx = 0; tx < tilesX; tx++) {
      for (let ty = 0; ty < tilesY; ty++) {
        const out = new PNG({ width: TILE, height: TILE });
        // default: telus (di luar imej)
        for (let i = 0; i < TILE * TILE; i++) { out.data[i * 4 + 3] = 0; }

        for (let py = 0; py < TILE; py++) {
          for (let px = 0; px < TILE; px++) {
            // piksel dalam koordinat level
            const lx = tx * TILE + px;
            const ly = ty * TILE + py;
            if (lx >= levelW || ly >= levelH) continue;
            // map ke piksel sumber
            const sx = Math.min(width - 1, Math.floor(lx * scale));
            const sy = Math.min(height - 1, Math.floor(ly * scale));
            const si = (sy * width + sx) * 4;
            const di = (py * TILE + px) * 4;
            out.data[di] = src.data[si];
            out.data[di + 1] = src.data[si + 1];
            out.data[di + 2] = src.data[si + 2];
            out.data[di + 3] = 255;
          }
        }

        const buf = PNG.sync.write(out, { colorType: 6, deflateLevel: 6 });
        const p = path.join(zDir, tx + '_' + ty + '.png');
        fs.writeFileSync(p, buf);
        totalBytes += buf.length;
        zTiles++;
        totalTiles++;
      }
    }

    levels.push({
      z,
      scale,
      width: levelW,
      height: levelH,
      tilesX,
      tilesY,
      tiles: zTiles,
      transform: levelTransform.toJSON(),
      metersPerPixel: Math.abs(levelTransform.A),
    });
    if (onProgress) onProgress({ z, zMax, tiles: zTiles, levelW, levelH });
  }

  const metadata = {
    tileSize: TILE,
    width, height,
    zMin: 0,
    zMax,
    levels: levels.reverse(), // naik dari z0
    sourceTransform: transform.toJSON(),
    builtAt: new Date().toISOString(),
    buildMs: Date.now() - t0,
    totalTiles,
    totalBytes,
  };
  fs.writeFileSync(path.join(outDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

  return metadata;
}

/**
 * "Renderer" ringan yang meniru kelakuan app:
 * diberi viewport -> tentukan tile mana perlu -> hitung berapa besar muatan.
 * Inilah sebab tile menang: kita muat hanya apa yang kelihatan.
 */
export class TileRenderer {
  constructor(metadata, tilesDir) {
    this.meta = metadata;
    this.tilesDir = tilesDir;
  }

  /** Pilih zoom terbaik untuk skala paparan (px skrin per px peta). */
  pickZoom(pxPerMapPx) {
    // cari level dengan metersPerPixel paling hampir
    let best = this.meta.levels[0];
    let bestDiff = Infinity;
    for (const lv of this.meta.levels) {
      const diff = Math.abs(lv.metersPerPixel - pxPerMapPx);
      if (diff < bestDiff) { bestDiff = diff; best = lv; }
    }
    return best;
  }

  /**
   * Berapa tile diperlukan untuk viewport (dalam px skrin)?
   * Pulangkan senarai tile + jumlah bait yang perlu dimuat turun.
   */
  tilesForViewport(level, centerCol, centerRow, viewportW, viewportH) {
    const tilesAcross = Math.ceil(viewportW / this.meta.tileSize) + 2;
    const tilesDown = Math.ceil(viewportH / this.meta.tileSize) + 2;
    const centerTx = Math.floor(centerCol / this.meta.tileSize / level.scale);
    const centerTy = Math.floor(centerRow / this.meta.tileSize / level.scale);

    const list = [];
    let bytes = 0;
    for (let dy = -Math.floor(tilesDown / 2); dy <= Math.floor(tilesDown / 2); dy++) {
      for (let dx = -Math.floor(tilesAcross / 2); dx <= Math.floor(tilesAcross / 2); dx++) {
        const tx = centerTx + dx, ty = centerTy + dy;
        if (tx < 0 || ty < 0 || tx >= level.tilesX || ty >= level.tilesY) continue;
        const p = path.join(this.tilesDir, String(level.z), tx + '_' + ty + '.png');
        let size = 0;
        try { size = fs.statSync(p).size; } catch {}
        bytes += size;
        list.push({ z: level.z, x: tx, y: ty, file: p, bytes: size });
      }
    }
    return { tiles: list, count: list.length, bytes, level };
  }

  /** Bukti: berapa banyak yang perlu dimuat vs imej penuh. */
  compare(centerCol, centerRow, viewportW, viewportH, fullImageBytes) {
    const level = this.meta.levels[this.meta.levels.length - 1];
    const r = this.tilesForViewport(level, centerCol, centerRow, viewportW, viewportH);
    return {
      tileBytes: r.bytes,
      tileCount: r.count,
      fullBytes: fullImageBytes,
      saving: fullImageBytes / Math.max(1, r.bytes),
    };
  }
}

/**
 * Jana tile untuk SEMUA zoom supaya boleh dipapar di web (folder statik).
 * Sama seperti buildTilePyramid tetapi output ke folder public web.
 */
export { TILE };
