/**
 * bench-tiles.mjs — BUKTI: monolitik vs piramid tile pada peta 100 MP sebenar.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { buildTilePyramid, TileRenderer } from './tile-pyramid.mjs';
import { AffineTransform } from './worldfile.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '..', 'data');
const TILES = path.resolve(__dirname, '..', 'tiles');

const line = (s = '') => console.log(s);
const rule = (t) => { line(); line('='.repeat(66)); if (t) line(t); line('='.repeat(66)); };

const meta = JSON.parse(fs.readFileSync(path.join(DATA, 'big-manifest.json'), 'utf8'));
const tfw = fs.readFileSync(path.join(DATA, 'big-topo.tfw'), 'utf8').trim().split(/\s+/).map(Number);
const transform = new AffineTransform({ A: tfw[0], D: tfw[1], B: tfw[2], E: tfw[3], C: tfw[4], F: tfw[5] });

rule('PETA UJIAN (had maksimum Avenza)');
line('Dimensi       : ' + meta.widthPx + ' x ' + meta.heightPx + ' px = ' + (meta.widthPx * meta.heightPx / 1e6).toFixed(0) + ' MP');
line('GSD           : ' + meta.gsdMeters + ' m/px  ->  merangkumi ' + (meta.widthPx * meta.gsdMeters / 1000).toFixed(0) + ' km x ' + (meta.heightPx * meta.gsdMeters / 1000).toFixed(0) + ' km');
line('Piksel mentah : ' + (meta.widthPx * meta.heightPx * 4 / 1048576).toFixed(0) + ' MB dalam RAM (RGBA)');
line('Fail PNG      : ' + (fs.statSync(path.join(DATA, 'big-preview.png')).size / 1048576).toFixed(1) + ' MB');

// ---------- BUKTI MASALAH: monolitik ----------
rule('MASALAH: RENDER MONOLITIK (cara POC pertama)');
const mono0 = Date.now();
let peakRss = 0;
try {
  const img = PNG.sync.read(fs.readFileSync(path.join(DATA, 'big-preview.png')));
  peakRss = process.memoryUsage().rss;
  line('Muat imej penuh  : ' + (Date.now() - mono0) + ' ms');
  line('Memori (RSS)     : ' + (peakRss / 1048576).toFixed(0) + ' MB');
  line('Piksel           : ' + (img.width * img.height).toLocaleString());
  line('');
  line('>> Setiap kali app dibuka / zoom, ini yang akan berlaku.');
  line('>> Pada peranti 2-4 GB RAM, ini boleh menyebabkan app DIBUNUH oleh OS.');
} catch (e) {
  line('GAGAL: ' + e.message);
}

// ---------- BUKTI PENYELESAIAN: piramid tile ----------
rule('PENYELESAIAN: BINA PIRAMID TILE');
line('Membina... (ini kerja sekali sahaja, di server/desktop)');
const t0 = Date.now();
const built = buildTilePyramid({
  sourceImage: path.join(DATA, 'big-preview.png'),
  width: meta.widthPx, height: meta.heightPx,
  transform, outDir: TILES,
  onProgress: ({ z, zMax, tiles, levelW, levelH }) => {
    line('  z' + String(z).padStart(2) + '/' + zMax + '  ' + levelW + 'x' + levelH + ' px  ->  ' + tiles + ' tile');
  },
});
line('');
line('SIAP dalam ' + (built.buildMs / 1000).toFixed(1) + ' s');
line('Jumlah tile : ' + built.totalTiles.toLocaleString());
line('Jumlah saiz : ' + (built.totalBytes / 1048576).toFixed(1) + ' MB');

// ---------- BUKTI PENYELESAIAN: muat hanya viewport ----------
rule('BUKTI: MUAT HANYA APA YANG KELIHATAN');

const renderer = new TileRenderer(built, TILES);
const fullBytes = fs.statSync(path.join(DATA, 'big-preview.png')).size;

line('Simulasi: skrin telefon 1080x1920 px, tengah peta');
line('');
line('  ' + 'Zoom'.padEnd(6) + 'Tile'.padEnd(8) + 'Muatan'.padEnd(12) + 'px peta/tile'.padEnd(14) + 'GSD');
line('  ' + '-'.repeat(52));
for (const lv of built.levels) {
  const r = renderer.tilesForViewport(lv, meta.widthPx / 2, meta.heightPx / 2, 1080, 1920);
  line('  z' + String(lv.z).padEnd(5) + String(r.count).padEnd(8) +
       ((r.bytes / 1024).toFixed(0) + ' KB').padEnd(12) +
       (lv.scale + 'x').padEnd(14) +
       lv.metersPerPixel.toFixed(2) + ' m');
}

line('');
const cmp = renderer.compare(meta.widthPx / 2, meta.heightPx / 2, 1080, 1920, fullBytes);
line('Pada zoom penuh:');
line('  Monolitik       : ' + (cmp.fullBytes / 1048576).toFixed(1) + ' MB dimuat');
line('  Tile            : ' + (cmp.tileBytes / 1024).toFixed(0) + ' KB dimuat (' + cmp.tileCount + ' tile)');
line('  PENJIMATAN      : ' + cmp.saving.toFixed(0) + 'x lebih sedikit');
line('');
line('Dan ini berlaku SETIAP kali pengguna zoom/pan.');

// ---------- BUKTI: titik biru kekal tepat merentas zoom ----------
rule('BUKTI: TITIK BIRU TEPAT MERENTAS SEMUA ZOOM');
const { makeCrs } = await import('./crs.mjs');
const crs = makeCrs(meta.crs);
const gps = crs.toLonLat(meta.worldFileParams.C + 5000, meta.worldFileParams.F - 5000);

line('Titik GPS: ' + gps.lat.toFixed(6) + ', ' + gps.lon.toFixed(6));
line('');
line('  ' + 'Zoom'.padEnd(6) + 'Transform level          ' + 'Titik biru (piksel level)');
line('  ' + '-'.repeat(60));
for (const lv of built.levels) {
  const lt = new AffineTransform(lv.transform);
  const w = crs.fromLonLat(gps.lon, gps.lat);
  const p = lt.worldToPixel(w.x, w.y);
  line('  z' + String(lv.z).padEnd(5) + ('A=' + lt.A + ' E=' + lt.E).padEnd(26) +
       '(' + p.col.toFixed(2) + ', ' + p.row.toFixed(2) + ')');
}
line('');
line('Teknik: setiap level hanya SKALA transform (A,E didarab 2^n). Ini sebab');
line('titik biru tidak pernah "lari" bila zoom — asas matematik yang sama.');

rule('KESIMPULAN');
line('Monolitik : ' + (peakRss / 1048576).toFixed(0) + ' MB RAM, muat penuh setiap kali');
line('Tile      : ' + (cmp.tileBytes / 1024).toFixed(0) + ' KB untuk viewport, ' + cmp.saving.toFixed(0) + 'x penjimatan');
line('');
line('Ini bukti MENGAPA Avenza hadkan 10,000 px DAN mengapa tile wajib.');
line('Dengan tile, kita boleh sokong peta JAUH lebih besar daripada had Avenza.');
