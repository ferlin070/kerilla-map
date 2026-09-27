/**
 * mapview.mjs — "MapView": gabungan transform affine + CRS = titik biru GPS pada imej peta.
 *
 * Ini inti kepada cara Avenza berfungsi. Tiada server terlibat:
 *
 *   GPS (lat/lon WGS84)
 *        |  Crs.fromLonLat()
 *        v
 *   koordinat dunia CRS peta (x,y meter)
 *        |  AffineTransform.worldToPixel()
 *        v
 *   piksel imej (col,row)
 *        |  di luar [0,width) x [0,height) ?
 *        v
 *   titik biru dilukis (atau "di luar peta ini, tukar peta lain")
 */
import { AffineTransform } from './worldfile.mjs';
import { Crs } from './crs.mjs';

export class GeoMap {
  constructor({ id, title, width, height, transform, crs, file, pixelFormat = 'rgb' }) {
    this.id = id;
    this.title = title;
    this.width = width;
    this.height = height;
    this.transform = transform instanceof AffineTransform ? transform : new AffineTransform(transform);
    this.crs = crs instanceof Crs ? crs : new Crs(crs);
    this.file = file;
    this.pixelFormat = pixelFormat;
    this.bounds = this.transform.bounds(width, height);
    // Polygon GeoJSON kawasan peta (untuk cari peta mana mengandungi GPS)
    this.footprint = {
      type: 'Polygon',
      coordinates: [[
        ...this.bounds.corners.map((c) => {
          const { lon, lat } = this.crs.toLonLat(c.x, c.y);
          return [lon, lat];
        }),
      ]].map((ring) => [...ring, ring[0]]),
    };
  }

  /** Terima GPS lat/lon. Pulangkan posisi piksel + flag dalam/ luar peta. */
  locate(lon, lat) {
    const world = this.crs.fromLonLat(lon, lat);
    const { col, row } = this.transform.worldToPixel(world.x, world.y);
    const inside = col >= 0 && row >= 0 && col < this.width && row < this.height;
    return {
      lon, lat,
      world,
      col, row,
      inside,
      edgeDistancePx: inside
        ? Math.min(col, row, this.width - col, this.height - row)
        : null,
    };
  }

  /** Piksel imej -> lat/lon (untuk "tukar peta ke point" / placemark). */
  pixelToLonLat(col, row) {
    const world = this.transform.pixelToWorld(col, row);
    return this.crs.toLonLat(world.x, world.y);
  }

  /** Meter per piksel (anggaran) pada skala peta ini. */
  metersPerPixel() {
    const px = this.transform.pixelSize;
    return { x: px.x, y: px.y };
  }

  /** Adakah peta ini mengandungi titik lat/lon (guna bbox, murah). */
  containsLonLat(lon, lat) {
    const { lon: minLon, lat: maxLat } = this.pixelToLonLat(0, 0);
    const { lon: maxLon, lat: minLat } = this.pixelToLonLat(this.width, this.height);
    const lo1 = Math.min(minLon, maxLon), hi1 = Math.max(minLon, maxLon);
    const lo2 = Math.min(minLat, maxLat), hi2 = Math.max(minLat, maxLat);
    return lon >= lo1 && lon <= hi1 && lat >= lo2 && lat <= hi2;
  }
}

/**
 * Collection: sekumpulan peta (folder/collection dalam Avenza).
 * Boleh cari peta mana mengandungi GPS semasa — logik "Collections of adjacent
 * or overlapping maps" yang disebut di app-features.
 */
export class MapCollection {
  constructor(name) {
    this.name = name;
    this.maps = [];
  }

  add(map) {
    this.maps.push(map);
    return this;
  }

  /** Cari semua peta yang footprint-nya mengandungi lat/lon. */
  mapsAt(lon, lat) {
    return this.maps.filter((m) => m.containsLonLat(lon, lat));
  }

  /** Peta terbaik (paling tinggi resolusi = GSD terkecil) pada titik. */
  bestMapAt(lon, lat) {
    const candidates = this.mapsAt(lon, lat);
    if (!candidates.length) return null;
    return candidates.sort((a, b) => {
      const ga = a.metersPerPixel().x, gb = b.metersPerPixel().x;
      return ga - gb;
    })[0];
  }
}

/** Lukis titik biru + crosshair pada buffer RGBA (ganti canvas/Flutter di produksi). */
export function drawMarker(rgba, width, height, col, row, { radius = 6, color = [0, 122, 255, 255] } = {}) {
  const put = (x, y, c) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = (y * width + x) * 4;
    rgba[i] = c[0]; rgba[i + 1] = c[1]; rgba[i + 2] = c[2]; rgba[i + 3] = c[3];
  };
  const cx = Math.round(col), cy = Math.round(row);
  // bulatan berisi
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) put(cx + dx, cy + dy, color);
    }
  }
  // halo putih
  for (let d = -radius; d <= radius; d++) {
    put(cx + d, cy - radius - 1, [255, 255, 255, 255]);
    put(cx + d, cy + radius + 1, [255, 255, 255, 255]);
    put(cx - radius - 1, cy + d, [255, 255, 255, 255]);
    put(cx + radius + 1, cy + d, [255, 255, 255, 255]);
  }
  // crosshair
  for (let d = radius + 3; d <= radius + 12; d++) {
    put(cx + d, cy, color); put(cx - d, cy, color);
    put(cx, cy + d, color); put(cx, cy - d, color);
  }
}

/** Lukis track GPS (polyline) dari senarai {col,row}. */
export function drawPolyline(rgba, width, height, points, { thickness = 3, color = [255, 59, 48, 255] } = {}) {
  const put = (x, y, c) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = (y * width + x) * 4;
    rgba[i] = c[0]; rgba[i + 1] = c[1]; rgba[i + 2] = c[2]; rgba[i + 3] = c[3];
  };
  const half = Math.floor(thickness / 2);
  for (let s = 0; s < points.length - 1; s++) {
    const a = points[s], b = points[s + 1];
    const steps = Math.max(1, Math.ceil(Math.hypot(b.col - a.col, b.row - a.row)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(a.col + (b.col - a.col) * t);
      const y = Math.round(a.row + (b.row - a.row) * t);
      for (let oy = -half; oy <= half; oy++) {
        for (let ox = -half; ox <= half; ox++) put(x + ox, y + oy, color);
      }
    }
  }
}
