/**
 * make-fixture.mjs — Cipta GeoTIFF georeferenced sebenar + world file,
 * supaya POC diuji pada fail sebenar (bukan mock).
 *
 * Kami bina GeoTIFF kecil (UTM Zone 10N, EPSG:32610) yang meniru
 * peta topo: grid jalan, sungai, kontur.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'data');
fs.mkdirSync(OUT, { recursive: true });

const WIDTH = 1024, HEIGHT = 768;
const PIXEL_SIZE = 5; // meter/piksel (GSD)
// Origin: UTM 10N koordinat pojok kiri-atas
const ORIGIN_X = 558000;
const ORIGIN_Y = 4760000;

// ---------- 1. Bina imej peta (RGBA) ----------
const png = new PNG({ width: WIDTH, height: HEIGHT });
function set(x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
  const i = (y * WIDTH + x) * 4;
  png.data[i] = r; png.data[i + 1] = g; png.data[i + 2] = b; png.data[i + 3] = a;
}

// latar tanah
for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) set(x, y, 245, 240, 225);

// hutan (blok hijau)
for (let y = 80; y < 300; y++) for (let x = 600; x < 950; x++) set(x, y, 200, 228, 190, 255);
// tasik (biru)
for (let y = 480; y < 650; y++) for (let x = 120; x < 380; x++) {
  const dx = (x - 250) / 130, dy = (y - 565) / 85;
  if (dx * dx + dy * dy < 1) set(x, y, 160, 205, 235, 255);
}
// kontur (garisan halus)
for (let c = 0; c < 9; c++) {
  const off = c * 55;
  for (let x = 0; x < WIDTH; x++) {
    const y = Math.round(120 + off + 60 * Math.sin(x / 130 + c));
    set(x, y, 215, 200, 170, 255);
    set(x, y + 1, 230, 220, 195, 255);
  }
}
// jalan raya (garisan tebal)
const road = (x0, y0, x1, y1, w, col) => {
  const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, x = Math.round(x0 + (x1 - x0) * t), y = Math.round(y0 + (y1 - y0) * t);
    for (let oy = -w; oy <= w; oy++) for (let ox = -w; ox <= w; ox++) set(x + ox, y + oy, ...col);
  }
};
road(0, 400, WIDTH, 430, 5, [255, 255, 255]);
road(0, 400, WIDTH, 430, 2, [230, 120, 60]);
road(450, 0, 480, HEIGHT, 4, [255, 255, 255]);
road(450, 0, 480, HEIGHT, 1, [230, 120, 60]);
// jalan kecil
road(0, 180, 600, 200, 1, [200, 200, 200]);
road(700, 0, 720, 500, 1, [200, 200, 200]);

fs.writeFileSync(path.join(OUT, 'topo-map-preview.png'), PNG.sync.write(png));

// ---------- 2. Tulis GeoTIFF georeferenced ----------
// GeoTIFF TIDAK boleh ditulis oleh lib 'geotiff' (read-only), jadi kita tulis
// fail TIFF klasik secara manual + tulis world file (.tfw) dan .prj.
// Ini sama seperti format "TIFF + TFW + WKT" yang diterima Map Store Avenza.

const raster = Buffer.alloc(WIDTH * HEIGHT * 3);
for (let i = 0; i < WIDTH * HEIGHT; i++) {
  raster[i * 3] = png.data[i * 4];
  raster[i * 3 + 1] = png.data[i * 4 + 1];
  raster[i * 3 + 2] = png.data[i * 4 + 2];
}

function writeTiff(width, height, rgb) {
  // TIFF little-endian, tidak dimampatkan, strip tunggal.
  const entries = [];
  const headerSize = 8;
  const ifdOffset = headerSize;
  const numEntries = 10;
  const ifdSize = 2 + numEntries * 12 + 4;
  const bitsOffset = ifdOffset + ifdSize;
  let dataOffset = bitsOffset + 6;
  dataOffset = (dataOffset + 3) & ~3; // align 4

  const buf = Buffer.alloc(dataOffset + rgb.length);
  buf.write('II', 0, 'ascii');
  buf.writeUInt16LE(42, 2);
  buf.writeUInt32LE(ifdOffset, 4);

  const bits = [8, 8, 8];
  let p = bitsOffset;
  for (const b of bits) { buf.writeUInt16LE(b, p); p += 2; }

  buf.writeUInt16LE(numEntries, ifdOffset);
  let e = ifdOffset + 2;
  const push = (tag, type, count, value) => {
    buf.writeUInt16LE(tag, e);
    buf.writeUInt16LE(type, e + 2);
    buf.writeUInt32LE(count, e + 4);
    if (type === 3 && count === 1) { buf.writeUInt16LE(value, e + 8); buf.writeUInt16LE(0, e + 10); }
    else buf.writeUInt32LE(value, e + 8);
    e += 12;
  };
  push(256, 3, 1, width);            // ImageWidth
  push(257, 3, 1, height);           // ImageLength
  push(258, 3, 3, bitsOffset);       // BitsPerSample
  push(259, 3, 1, 1);                // Compression = none
  push(262, 3, 1, 2);                // PhotometricInterpretation = RGB
  push(273, 4, 1, dataOffset);       // StripOffsets
  push(277, 3, 1, 3);                // SamplesPerPixel
  push(278, 3, 1, height);           // RowsPerStrip
  push(279, 4, 1, rgb.length);       // StripByteCounts
  push(284, 3, 1, 1);                // PlanarConfiguration
  buf.writeUInt32LE(0, e);           // next IFD = 0

  rgb.copy(buf, dataOffset);
  return buf;
}

const tiffBuf = writeTiff(WIDTH, HEIGHT, raster);
fs.writeFileSync(path.join(OUT, 'topo-map.tif'), tiffBuf);

// World file ESRI: A D B E C F
const tfw = [PIXEL_SIZE, 0, 0, -PIXEL_SIZE, ORIGIN_X + PIXEL_SIZE / 2, ORIGIN_Y - PIXEL_SIZE / 2]
  .map((n) => n.toFixed(6)).join('\n') + '\n';
fs.writeFileSync(path.join(OUT, 'topo-map.tfw'), tfw);

// WKT projected CRS (UTM 10N)
const wkt = 'PROJCS["WGS 84 / UTM zone 10N",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-123],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1],AUTHORITY["EPSG","32610"]]';
fs.writeFileSync(path.join(OUT, 'topo-map.prj'), wkt);

// Metadata manifest (meniru record produk Map Store)
const manifest = {
  id: 'poc-topo-001',
  title: 'POC Topo Map (UTM 10N)',
  handle: 'poc-topo-map-utm10n',
  vendor: 'POC Publisher',
  productType: 'digital map',
  priceCents: 0,
  currency: 'USD',
  status: 'published',
  tags: ['activity:Hiking', 'country:United States of America', 'language:English', 'historical:boolean:false'],
  crs: 'EPSG:32610',
  widthPx: WIDTH,
  heightPx: HEIGHT,
  gsdMeters: PIXEL_SIZE,
  files: {
    raster: 'topo-map.tif',
    worldFile: 'topo-map.tfw',
    projection: 'topo-map.prj',
    preview: 'topo-map-preview.png',
  },
  worldFileParams: {
    A: PIXEL_SIZE, D: 0, B: 0, E: -PIXEL_SIZE,
    C: ORIGIN_X + PIXEL_SIZE / 2, F: ORIGIN_Y - PIXEL_SIZE / 2,
  },
};
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log('Fixture dijana di', OUT);
console.log(' -', WIDTH + 'x' + HEIGHT + ' px @ ' + PIXEL_SIZE + ' m/px');
console.log(' - origin UTM10N:', ORIGIN_X, ORIGIN_Y);
console.log(' - imej:', 'topo-map.tif (' + (tiffBuf.length / 1024).toFixed(0) + ' KB)');
