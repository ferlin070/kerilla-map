/**
 * test.mjs — Ujian untuk enjin teras (jalankan: node --test src/test.mjs)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AffineTransform, parseWorldFile } from './worldfile.mjs';
import { makeCrs, Crs } from './crs.mjs';
import { GeoMap, MapCollection } from './mapview.mjs';
import { Geofence, FeatureStore } from './geofence.mjs';
import { validateForStore } from './geotiff-reader.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const m = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data', 'manifest.json'), 'utf8'));

test('parseWorldFile membaca susunan A D B E C F dengan betul', () => {
  const t = parseWorldFile('5\n0\n0\n-5\n100.5\n200.5\n');
  assert.equal(t.A, 5);
  assert.equal(t.D, 0);
  assert.equal(t.B, 0);
  assert.equal(t.E, -5);
  assert.equal(t.C, 100.5);
  assert.equal(t.F, 200.5);
});

test('parseWorldFile menolak input tidak sah', () => {
  assert.throws(() => parseWorldFile('1 2 3'));
  assert.throws(() => parseWorldFile('a b c d e f'));
});

test('pixelToWorld / worldToPixel adalah songsangan tepat', () => {
  const t = new AffineTransform({ A: 3.5, B: 0.2, C: 1000, D: -0.1, E: -3.5, F: 2000 });
  for (const [c, r] of [[0, 0], [123, 456], [999, 1], [0.5, 0.5]]) {
    const w = t.pixelToWorld(c, r);
    const back = t.worldToPixel(w.x, w.y);
    assert.ok(Math.abs(back.col - c) < 1e-9, 'col ' + back.col + ' vs ' + c);
    assert.ok(Math.abs(back.row - r) < 1e-9, 'row ' + back.row + ' vs ' + r);
  }
});

test('AffineTransform singular ditolak', () => {
  assert.throws(() => new AffineTransform({ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }));
});

test('CRS: WGS84 -> UTM -> WGS84 bulat tepat', () => {
  const crs = makeCrs('EPSG:32610');
  const lon = -122.27, lat = 42.96;
  const w = crs.fromLonLat(lon, lat);
  const back = crs.toLonLat(w.x, w.y);
  assert.ok(Math.abs(back.lon - lon) < 1e-9);
  assert.ok(Math.abs(back.lat - lat) < 1e-9);
});

test('Haversine: 1 darjah latitud ~ 111.19 km', () => {
  const d = Crs.haversineMeters(0, 0, 0, 1);
  assert.ok(d > 111000 && d < 111400, 'dapat ' + d);
});

test('GeoMap: titik tengah peta memetakan ke piksel tengah', () => {
  const t = parseWorldFile(fs.readFileSync(path.resolve(__dirname, '..', 'data', 'topo-map.tfw'), 'utf8'));
  const crs = makeCrs(m.crs);
  const map = new GeoMap({ id: 'x', title: 'x', width: m.widthPx, height: m.heightPx, transform: t, crs });
  const centerWorld = t.pixelToWorld(m.widthPx / 2, m.heightPx / 2);
  const ll = crs.toLonLat(centerWorld.x, centerWorld.y);
  const loc = map.locate(ll.lon, ll.lat);
  assert.ok(Math.abs(loc.col - m.widthPx / 2) < 1e-6);
  assert.ok(Math.abs(loc.row - m.heightPx / 2) < 1e-6);
  assert.equal(loc.inside, true);
});

test('GeoMap: titik jauh di luar muka bumi -> outside', () => {
  const t = parseWorldFile(fs.readFileSync(path.resolve(__dirname, '..', 'data', 'topo-map.tfw'), 'utf8'));
  const map = new GeoMap({ id: 'x', title: 'x', width: m.widthPx, height: m.heightPx, transform: t, crs: makeCrs(m.crs) });
  assert.equal(map.locate(0, 0).inside, false);
});

test('MapCollection: pilih peta beresolusi tertinggi (GSD terkecil)', () => {
  const t = parseWorldFile(fs.readFileSync(path.resolve(__dirname, '..', 'data', 'topo-map.tfw'), 'utf8'));
  const crs = makeCrs(m.crs);
  const fine = new GeoMap({ id: 'fine', title: 'Fine', width: m.widthPx, height: m.heightPx, transform: t, crs });
  const coarse = new GeoMap({
    id: 'coarse', title: 'Coarse', width: 512, height: 512, crs,
    transform: { A: 20, B: 0, C: fine.bounds.minX - 1000, D: 0, E: -20, F: fine.bounds.maxY + 1000 },
  });
  const c = new MapCollection('c').add(coarse).add(fine);
  const best = c.bestMapAt(-122.27, 42.96);
  assert.equal(best.id, 'fine');
});

test('Geofence bulatan: detect masuk & keluar', () => {
  const crs = makeCrs('EPSG:32610');
  const gf = new Geofence({ shape: 'circle', center: [42.96, -122.27], radiusM: 50, trigger: 'both' });
  // fix pertama: tetapkan keadaan awal (jauh)
  gf.update(-122.30, 42.90, crs, 0);
  const inside = gf.update(-122.27001, 42.96001, crs, 10);
  assert.equal(inside.inside, true);
  // masuk harus jadi peristiwa
  const out = gf.update(-122.30, 42.90, crs, 20);
  assert.equal(out.inside, false);
  assert.ok(gf.events.some((e) => e.type === 'enter'));
  assert.ok(gf.events.some((e) => e.type === 'exit'));
});

test('Geofence poligon: titik dalam/ luar', () => {
  const crs = makeCrs('EPSG:32610');
  const box = [[42.90, -122.30], [42.90, -122.24], [42.96, -122.24], [42.96, -122.30]];
  const gf = new Geofence({ shape: 'polygon', ring: box, trigger: 'both' });
  assert.equal(gf.contains(-122.27, 42.93, crs), true);
  assert.equal(gf.contains(-122.10, 42.93, crs), false);
});

test('FeatureStore: tambah layer + eksport GeoJSON', () => {
  const s = new FeatureStore();
  s.add('L1', { geomType: 'Point', geometry: { type: 'Point', coordinates: [1, 2] }, label: 'a' });
  s.add('L1', { geomType: 'Point', geometry: { type: 'Point', coordinates: [3, 4] }, label: 'b' });
  const gj = s.toGeoJSON();
  assert.equal(gj.features.length, 2);
  assert.equal(gj.features[0].properties.layer, 'L1');
});

test('Validasi Map Store: tolak peta > 10000 px', () => {
  const t = new AffineTransform({ A: 1, B: 0, C: 0, D: 0, E: -1, F: 0 });
  const r = validateForStore({ width: 12000, height: 500, transform: t, epsg: '32610', isGeographic: false }, { bytes: 100 });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /melebihi had 10000px/.test(e)));
});

test('Validasi Map Store: tolak CRS geodetik', () => {
  const t = new AffineTransform({ A: 0.0001, B: 0, C: 0, D: 0, E: -0.0001, F: 0 });
  const r = validateForStore({ width: 1000, height: 1000, transform: t, epsg: '4326', isGeographic: true }, { bytes: 100 });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /geodetik/.test(e)));
});

test('Validasi Map Store: tolak fail > 250 MB', () => {
  const t = new AffineTransform({ A: 1, B: 0, C: 0, D: 0, E: -1, F: 0 });
  const r = validateForStore({ width: 1000, height: 1000, transform: t, epsg: '32610', isGeographic: false }, { bytes: 300 * 1024 * 1024 });
  assert.equal(r.ok, false);
});

test('Validasi Map Store: terima peta sah', () => {
  const t = parseWorldFile(fs.readFileSync(path.resolve(__dirname, '..', 'data', 'topo-map.tfw'), 'utf8'));
  const r = validateForStore({ width: m.widthPx, height: m.heightPx, transform: t, epsg: '32610', isGeographic: false }, { bytes: 2000 });
  assert.equal(r.ok, true);
});
