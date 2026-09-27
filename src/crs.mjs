/**
 * crs.mjs — Lapisan sistem rujukan koordinat (CRS).
 *
 * Avenza memerlukan peta dalam PROJECTED CRS (bukan geodetik) supaya
 * Measure Distance/Area tepat. Di sini kita:
 *   1. Simpan definisi CRS peta (contoh: EPSG:32610 UTM zone 10N)
 *   2. Tukar lat/lon GPS (WGS84, EPSG:4326) -> CRS peta
 *   3. Tukar CRS peta -> lat/lon
 *
 * Guna proj4 (pure JS, tiada native deps). Dalam produksi ganti/selari dengan
 * PROJ (C) untuk sokongan semua CRS + WKT bukan-EPSG.
 */
import proj4 from 'proj4';

export const WGS84 = 'EPSG:4326';

export class Crs {
  constructor(epsgOrWkt, { name } = {}) {
    this.def = epsgOrWkt;
    this.name = name || String(epsgOrWkt);
    // Validasi awal: proj4 akan baling jika definisi tidak dikenali.
    try {
      proj4(this.def);
    } catch (e) {
      throw new Error(`CRS tidak dikenali atau tiada definisi: ${this.name} (${e.message})`);
    }
  }

  /** lat/lon (WGS84 darjah) -> {x,y} dalam CRS peta. */
  fromLonLat(lon, lat) {
    const [x, y] = proj4(WGS84, this.def, [lon, lat]);
    return { x, y };
  }

  /** {x,y} dalam CRS peta -> {lon,lat} WGS84. */
  toLonLat(x, y) {
    const [lon, lat] = proj4(this.def, WGS84, [x, y]);
    return { lon, lat };
  }

  /** Jarak geodesik (meter) antara dua titik lat/lon — Haversine. */
  static haversineMeters(lon1, lat1, lon2, lat2) {
    const R = 6371008.8;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  }

  /** Jarak planar dalam CRS peta (unit = meter jika CRS metrik). */
  static planarDistance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }
}

/**
 * Pendaftaran CRS biasa. Dalam produksi: muat dari fail .wkt atau EPSG registry.
 * Definisi di bawah supaya POC berjalan tanpa bergantung pada registry jauh.
 */
const CUSTOM = {
  'EPSG:32610': '+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs', // UTM 10N
  'EPSG:32633': '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs', // UTM 33N
  'EPSG:3857': '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs',
};

export function registerCrs(epsg, proj4def) {
  proj4.defs(epsg, proj4def);
  return new Crs(epsg);
}

export function makeCrs(epsg) {
  if (CUSTOM[epsg]) proj4.defs(epsg, CUSTOM[epsg]);
  return new Crs(epsg);
}

export { proj4 };
