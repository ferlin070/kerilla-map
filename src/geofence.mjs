/**
 * geofence.mjs — Geofence & atribut (ciri tandatangan Avenza).
 *
 * Dalam Avenza: "Create a geofence around a specific location, track, or area
 * and get notified when you approach or move away from it."
 *
 * Di sini kita laksana:
 *   - Geofence bulatan (radius meter) + poligon
 *   - Ujian masuk/keluar menggunakan koordinat CRS peta (meter) -> tepat
 *   - Feature store: placemark/track/line/area + atribut (Pro: attribute schema)
 */
import { Crs } from './crs.mjs';

export class FeatureStore {
  constructor() {
    this.layers = new Map();
  }

  ensureLayer(name) {
    if (!this.layers.has(name)) this.layers.set(name, { name, visible: true, features: [] });
    return this.layers.get(name);
  }

  add(layerName, feature) {
    const layer = this.ensureLayer(layerName);
    const f = {
      id: feature.id || 'f-' + Math.random().toString(36).slice(2, 9),
      geomType: feature.geomType,
      geometry: feature.geometry,
      attrs: feature.attrs || {},
      label: feature.label || '',
      color: feature.color || '#007aff',
      symbolId: feature.symbolId || 'default',
      photos: feature.photos || [],
      createdAt: new Date().toISOString(),
      syncState: 'local',
    };
    layer.features.push(f);
    return f;
  }

  /** Eksport ke GeoJSON (untuk KML/GPX/SHP di produksi via GDAL/OGR). */
  toGeoJSON() {
    const features = [];
    for (const layer of this.layers.values()) {
      for (const f of layer.features) {
        features.push({
          type: 'Feature',
          id: f.id,
          properties: { layer: layer.name, ...f.attrs, label: f.label, symbol: f.symbolId },
          geometry: f.geometry,
        });
      }
    }
    return { type: 'FeatureCollection', features };
  }
}

export class Geofence {
  /**
   * @param {object} o
   * @param {'circle'|'polygon'} o.shape
   * @param {[number,number]} [o.center] lat/lon (circle)
   * @param {number} [o.radiusM] radius meter (circle)
   * @param {number[][]} [o.ring] lat/lon ring (polygon)
   * @param {'enter'|'exit'|'both'} o.trigger
   */
  constructor(o) {
    Object.assign(this, o);
    this.inside = false;
    this.initialized = false;
    this.events = [];
  }

  /** Titik lat/lon di dalam geofence? (guna CRS metrik supaya tepat) */
  contains(lon, lat, crs) {
    if (this.shape === 'circle') {
      const a = crs.fromLonLat(lon, lat);
      const c = crs.fromLonLat(this.center[1], this.center[0]);
      return Crs.planarDistance(a, c) <= this.radiusM;
    }
    // polygon: ray casting dalam CRS metrik
    const p = crs.fromLonLat(lon, lat);
    const ring = this.ring.map(([la, lo]) => crs.fromLonLat(lo, la));
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i].x, yi = ring[i].y, xj = ring[j].x, yj = ring[j].y;
      const intersect = (yi > p.y) !== (yj > p.y) &&
        p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /** Suap fix GPS. Pulangkan peristiwa jika masuk/keluar. */
  update(lon, lat, crs, t = 0) {
    const now = this.contains(lon, lat, crs);
    if (!this.initialized) {
      this.initialized = true;
      this.inside = now;
      return { changed: false, inside: now, event: null };
    }
    if (now === this.inside) return { changed: false, inside: now, event: null };
    const entered = now;
    this.inside = now;
    const event = { type: entered ? 'enter' : 'exit', t, lon, lat, at: new Date().toISOString() };
    this.events.push(event);
    const notify = this.trigger === 'both' ||
      (this.trigger === 'enter' && entered) ||
      (this.trigger === 'exit' && !entered);
    return { changed: true, inside: now, event: notify ? event : null };
  }
}
