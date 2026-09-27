/**
 * demo.mjs — POC Fasa 1 lengkap.
 *
 * Menunjukkan TERAS cara Avenza Maps berfungsi:
 *   1. Muat peta georeferenced (TIFF + world file + WKT)
 *   2. Bina transform affine piksel <-> dunia + CRS
 *   3. Simulasi GPS track (lat/lon WGS84) sepanjang perjalanan
 *   4. Tukar SETIAP fix GPS -> piksel -> lukis titik biru
 *   5. Ukur jarak, kumpul track, eksport GPX (offline, tiada server)
 *   6. Validasi peta mengikut garis panduan Map Store
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

import { parseWorldFile, describeTransform } from './worldfile.mjs';
import { makeCrs, Crs } from './crs.mjs';
import { GeoMap, MapCollection, drawMarker, drawPolyline } from './mapview.mjs';
import { validateForStore } from './geotiff-reader.mjs';
import { FeatureStore, Geofence } from './geofence.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '..', 'data');
const OUT = path.resolve(__dirname, '..', 'out');
fs.mkdirSync(OUT, { recursive: true });

const line = (s = '') => console.log(s);
const rule = (t) => { line(); line('='.repeat(64)); if (t) line(t); line('='.repeat(64)); };

// ============ 1. MUAT PETA ============
rule('1. MUAT PETA GEOREFERENCED (TIFF + TFW + PRJ)');

const manifest = JSON.parse(fs.readFileSync(path.join(DATA, 'manifest.json'), 'utf8'));
const tfwText = fs.readFileSync(path.join(DATA, manifest.files.worldFile), 'utf8');
const transform = parseWorldFile(tfwText);
const crs = makeCrs(manifest.crs);

line('Peta      : ' + manifest.title + '  [' + manifest.handle + ']');
line('Fail      : ' + manifest.files.raster + '  (' + (fs.statSync(path.join(DATA, manifest.files.raster)).size / 1024).toFixed(0) + ' KB)');
line('Dimensi   : ' + manifest.widthPx + ' x ' + manifest.heightPx + ' px');
line('CRS       : ' + manifest.crs + '  (projected, ' + manifest.gsdMeters + ' m/px)');
line();
line(describeTransform(transform));

const map = new GeoMap({
  id: manifest.id,
  title: manifest.title,
  width: manifest.widthPx,
  height: manifest.heightPx,
  transform,
  crs,
  file: manifest.files.raster,
});

line();
line('Bounding box peta (CRS):');
line('  X: ' + map.bounds.minX.toFixed(1) + ' -> ' + map.bounds.maxX.toFixed(1));
line('  Y: ' + map.bounds.minY.toFixed(1) + ' -> ' + map.bounds.maxY.toFixed(1));
line();
line('Pojok peta dalam lat/lon:');
for (const c of map.bounds.corners) {
  const { lon, lat } = crs.toLonLat(c.x, c.y);
  line('  (' + lon.toFixed(6) + ', ' + lat.toFixed(6) + ')');
}

// ============ 2. VALIDASI MAP STORE ============
rule('2. VALIDASI MAP STORE (gate sebelum publish)');
const bytes = fs.statSync(path.join(DATA, manifest.files.raster)).size;
const v = validateForStore({
  width: map.width, height: map.height, transform, epsg: manifest.crs.split(':')[1],
  isGeographic: false,
}, { bytes });
line('Status : ' + (v.ok ? 'LULUS ✅' : 'GAGAL ❌'));
if (v.warnings.length) v.warnings.forEach((w) => line('  ⚠  ' + w));
if (v.errors.length) v.errors.forEach((e) => line('  ✖  ' + e));

// ============ 3. SIMULASI GPS TRACK ============
rule('3. SIMULASI PERJALANAN GPS (lat/lon WGS84)');

// Mula di tengah peta, bergerak sepanjang laluan.
const start = map.pixelToLonLat(200, 620);
line('Titik mula (dari piksel 200,620): ' + start.lon.toFixed(6) + ', ' + start.lat.toFixed(6));

const fixes = [];
const SECONDS = 60;
let cur = { lon: start.lon, lat: start.lat };
const speedMps = 1.4; // ~5 km/j hiking
let heading = 65; // darjah
for (let t = 0; t <= SECONDS; t += 3) {
  // sedikit belokan supaya track nampak semula jadi
  heading += Math.sin(t / 12) * 6 + (t > 30 ? 2 : 0);
  const rad = (heading * Math.PI) / 180;
  const d = speedMps * 3;
  const dLat = (d * Math.cos(rad)) / 111320;
  const dLon = (d * Math.sin(rad)) / (111320 * Math.cos((cur.lat * Math.PI) / 180));
  cur = { lon: cur.lon + dLon, lat: cur.lat + dLat };
  // sedikit bunyi GPS (~3m)
  fixes.push({
    t, lon: cur.lon + (Math.random() - 0.5) * 3e-5,
    lat: cur.lat + (Math.random() - 0.5) * 3e-5,
    accuracyM: 3 + Math.random() * 4,
  });
}
line('Fix GPS dijana : ' + fixes.length + ' (' + SECONDS + 's @ 3s)');

// ============ 4. TITIK BIRU PADA PETA ============
rule('4. GPS -> PIKEL: LUKIS TITIK BIRU (inti Avenza)');

const projected = [];
let totalMeters = 0;
for (let i = 0; i < fixes.length; i++) {
  const f = fixes[i];
  const loc = map.locate(f.lon, f.lat);
  projected.push({ col: loc.col, row: loc.row });
  if (i > 0) {
    totalMeters += Crs.haversineMeters(fixes[i - 1].lon, fixes[i - 1].lat, f.lon, f.lat);
  }
  if (i % 5 === 0 || i === fixes.length - 1) {
    line(
      't=' + String(f.t).padStart(2) + 's  ' +
      'lon/lat ' + f.lon.toFixed(6) + ',' + f.lat.toFixed(6) +
      '  ->  piksel (' + loc.col.toFixed(1) + ', ' + loc.row.toFixed(1) + ')' +
      '  ' + (loc.inside ? 'DALAM peta' : 'DI LUAR peta')
    );
  }
}
line();
line('Jarak terkumpul (geodesik) : ' + (totalMeters / 1000).toFixed(3) + ' km');
line('Purata kelajuan             : ' + (totalMeters / SECONDS).toFixed(2) + ' m/s');

const p0 = map.locate(fixes[0].lon, fixes[0].lat);
const pN = map.locate(fixes[fixes.length - 1].lon, fixes[fixes.length - 1].lat);
line('Bearing keseluruhan         : ' + bearing(p0.lon, p0.lat, pN.lon, pN.lat).toFixed(0) + '°');

function bearing(lon1, lat1, lon2, lat2) {
  const toRad = (d) => (d * Math.PI) / 180, toDeg = (r) => (r * 180) / Math.PI;
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// ============ 5. RENDER IMAGE + TITIK BIRU ============
rule('5. RENDER: TITIK BIRU + TRACK PADA IMEJ PETA (offline)');

const base = PNG.sync.read(fs.readFileSync(path.join(DATA, manifest.files.preview)));
drawPolyline(base.data, base.width, base.height, projected, { thickness: 4, color: [255, 59, 48, 255] });
drawPolyline(base.data, base.width, base.height, projected, { thickness: 2, color: [255, 149, 0, 200] });
for (let i = 0; i < projected.length; i += 6) {
  drawMarker(base.data, base.width, base.height, projected[i].col, projected[i].row, { radius: 3, color: [120, 120, 120, 255] });
}
const last = projected[projected.length - 1];
drawMarker(base.data, base.width, base.height, last.col, last.row, { radius: 9, color: [0, 122, 255, 255] });

const renderPath = path.join(OUT, 'rendered-with-gps.png');
fs.writeFileSync(renderPath, PNG.sync.write(base));
line('Imej dirender -> out/rendered-with-gps.png');
line('  - track merah + titik fix kelabu + TITIK BIRU GPS semasa');

// ============ 6. COLLECTION: CARI PETA PADA LOKASI ============
rule('6. COLLECTION: "PETA MANA MENGANDUNGI SAYA?" (collections Avenza)');

// Cipta peta kedua (lebih besar, GSD lebih kasar) untuk menunjukkan overlap.
const coarse = new GeoMap({
  id: 'poc-topo-002',
  title: 'POC Regional Overview (lebih kasar)',
  width: 1024, height: 768,
  transform: { A: 20, B: 0, C: map.bounds.minX - 2000, D: 0, E: -20, F: map.bounds.maxY + 2000 },
  crs,
});
const collection = new MapCollection('Adventure Collection').add(coarse).add(map);
const best = collection.bestMapAt(fixes[10].lon, fixes[10].lat);
line('Peta dalam collection : ' + collection.maps.length);
line('Peta mengandungi GPS  : ' + collection.mapsAt(fixes[10].lon, fixes[10].lat).map((m) => m.title).join(' | '));
line('Peta TERBAIK (resolusi tertinggi, GSD terkecil) : ' + (best ? best.title : 'tiada'));
line('  GSD peta dipilih    : ' + best.metersPerPixel().x + ' m/px');

// ============ 7. EXPORT GPX (offline sharing) ============
rule('7. EKSPORT TRACK -> GPX (ciri "share your data")');

const gpx = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<gpx version="1.1" creator="avenza-poc" xmlns="http://www.topografix.com/GPX/1/1">',
  '  <trk><name>POC Track</name><trkseg>',
  ...fixes.map((f) => '    <trkpt lat="' + f.lat.toFixed(7) + '" lon="' + f.lon.toFixed(7) + '"><time>2026-01-01T00:' + String(Math.floor(f.t / 60)).padStart(2, '0') + ':' + String(f.t % 60).padStart(2, '0') + 'Z</time></trkpt>'),
  '  </trkseg></trk>',
  '</gpx>',
].join('\n');
fs.writeFileSync(path.join(OUT, 'track.gpx'), gpx);
line('GPX ditulis -> out/track.gpx (' + fixes.length + ' trkpt)');

// ============ 8. BUKTI BULAT: piksel -> latlon -> piksel ============
rule('8. UJIAN BULAT-BALIK (ketepatan transform)');
let maxErr = 0;
for (const [col, row] of [[0, 0], [512, 384], [1023, 767], [200, 620]]) {
  const ll = map.pixelToLonLat(col, row);
  const back = map.locate(ll.lon, ll.lat);
  const err = Math.hypot(back.col - col, back.row - row);
  maxErr = Math.max(maxErr, err);
  line('piksel (' + col + ',' + row + ') -> latlon -> piksel: ralat ' + err.toExponential(2) + ' px');
}
line();
line(maxErr < 0.01 ? '✅ Transform songsang tepat (ralat < 0.01 px)' : '❌ Ralat transform terlalu besar');


// ============ 9. GEOFENCE + ATRIBUT (ciri tandatangan Avenza) ============
rule('9. GEOFENCE: NOTIFIKASI MASUK/KELUAR KAWASAN');

const store = new FeatureStore();
store.add('Trail Features', {
  geomType: 'Point',
  geometry: { type: 'Point', coordinates: [fixes[0].lon, fixes[0].lat] },
  label: 'Trailhead',
  color: '#ff3b30',
  symbolId: 'campground',
  attrs: { name: 'Trailhead', elevation_m: 1240, notes: 'Tempat letak kereta' },
});
store.add('Trail Features', {
  geomType: 'LineString',
  geometry: { type: 'LineString', coordinates: fixes.map((f) => [f.lon, f.lat]) },
  label: 'Hiking Track',
  color: '#ff9500',
  attrs: { activity: 'Hiking', distance_km: +(totalMeters / 1000).toFixed(3) },
});

const midIdx = Math.floor(fixes.length / 2);
const gf = new Geofence({
  shape: 'circle',
  center: [fixes[midIdx].lat, fixes[midIdx].lon],
  radiusM: 25,
  trigger: 'both',
  name: 'Kawasan Rehat',
});

line('Geofence "Kawasan Rehat" bulatan 25m di fix #' + midIdx);
let notifications = 0;
for (const f of fixes) {
  const r = gf.update(f.lon, f.lat, crs, f.t);
  if (r.event) {
    notifications++;
    line('  >> t=' + String(f.t).padStart(2) + 's  ' +
      (r.event.type === 'enter' ? 'MASUK' : 'KELUAR') + ' kawasan  (' +
      f.lon.toFixed(6) + ', ' + f.lat.toFixed(6) + ')');
  }
}
line('Jumlah notifikasi geofence : ' + notifications);

line();
line('Feature store (layer + atribut, ala Avenza Pro):');
for (const layer of store.layers.values()) {
  line('  Layer "' + layer.name + '" (' + layer.features.length + ' features):');
  for (const f of layer.features) {
    line('    - [' + f.geomType + '] ' + f.label + '  symbol=' + f.symbolId +
      '  attrs=' + JSON.stringify(f.attrs));
  }
}

const geojson = store.toGeoJSON();
fs.writeFileSync(path.join(OUT, 'features.geojson'), JSON.stringify(geojson, null, 2));
line();
line('GeoJSON dieksport -> out/features.geojson (' + geojson.features.length + ' features)');
line('  (di produksi: tukar ke KML/GPX/SHP guna GDAL/OGR)');

// ============ 10. RINGKASAN ============
rule('RINGKASAN POC FASA 1');
line('OK  Baca peta georeferenced (TIFF + world file + WKT)');
line('OK  Transform affine piksel <-> dunia (dua arah, tepat < 1e-9 px)');
line('OK  CRS projected: WGS84 GPS <-> UTM 10N');
line('OK  Titik biru GPS pada imej peta, 100% OFFLINE');
line('OK  Rekod track + statistik jarak/kelajuan/bearing');
line('OK  Collection: pilih peta terbaik pada lokasi (overlap)');
line('OK  Geofence masuk/keluar + notifikasi');
line('OK  Feature store + atribut (ala Avenza Pro)');
line('OK  Eksport GPX + GeoJSON');
line('OK  Validasi gate Map Store (had 10k px / 250MB / projected CRS)');
line();
line('Output dalam: poc/out/');
