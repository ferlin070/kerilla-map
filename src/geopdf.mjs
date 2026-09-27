/**
 * geopdf.mjs — Parser GeoPDF (format sebenar yang penerbit Avenza guna).
 *
 * GeoPDF menyimpan georeferencing dalam objek /Measure /Subtype /GEO:
 *   /Bounds  - 4 sudut dalam ruang normalisasi halaman [0..1]
 *   /LPTS    - koordinat halaman (PDF user space, unit = point)
 *   /GPTS    - koordinat geografi (lat, lon) berpasangan
 *   /GCS     - sistem rujukan koordinat (WKT / PROJCS)
 *
 * Susunan GPTS/LPTS: setiap titik = [X Y] dalam susunan ISO 32000:
 *   GPTS = [lat1 lon1  lat2 lon2  lat3 lon3  lat4 lon4]
 *   LPTS = [x1 y1  x2 y2  x3 y3  x4 y4]
 *
 * Dari 4 pasangan ini kita bina transform affine: point PDF -> lat/lon.
 */
import { AffineTransform } from './worldfile.mjs';

/**
 * Ekstrak blok /Measure /Subtype /GEO dari teks PDF mentah.
 * (Dalam produksi guna parser PDF penuh; untuk POC ini cukup kerana
 *  QGIS menulis blok ini sebagai teks tidak dimampatkan.)
 */
export function extractGeoMeasure(pdfText) {
  // Cari objek /Subtype /GEO
  const re = /\/Bounds\s*\[([^\]]+)\]\s*\/GCS\s+(\d+)\s+0\s+R\s*\/GPTS\s*\[([^\]]+)\]\s*\/LPTS\s*\[([^\]]+)\][^>]*?\/Subtype\s*\/GEO/g;
  const m = re.exec(pdfText);
  if (!m) throw new Error('Tiada blok /Measure /Subtype /GEO (bukan GeoPDF?)');
  const nums = (s) => s.trim().split(/\s+/).map(Number);
  return {
    bounds: nums(m[1]),
    gcsRef: m[2],
    gpts: nums(m[3]),
    lpts: nums(m[4]),
  };
}

/** Ekstrak WKT projeksi dari objek /Type /PROJCS. */
export function extractWkt(pdfText) {
  const m = /\/Type\s*\/PROJCS\s*\/WKT\s*\(([\s\S]*?)\)\s*>>/m.exec(pdfText);
  if (!m) return null;
  // Buang escape PDF dalam WKT
  return m[1].replace(/\\([()\\])/g, '$1').trim();
}

/** Cari MediaBox halaman. */
export function extractMediaBox(pdfText) {
  const m = /\/MediaBox\s*\[\s*([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s*\]/m.exec(pdfText);
  if (!m) return null;
  const [x0, y0, x1, y1] = m.slice(1).map(Number);
  return { x0, y0, x1, y1, width: x1 - x0, height: y1 - y0 };
}

/**
 * Bina affine PDF-point -> koordinat geografi (lon/lat) dari 4 pasangan.
 *
 * LPTS  = [x y x y x y x y]  dalam point PDF
 * GPTS  = [lat lon ...]      dalam darjah
 *
 * Kita selesaikan transform affine 2D:  lon = a*x + b*y + c ; lat = d*x + e*y + f
 * menggunakan 3 titik (least-squares dengan 4 titik untuk ketepatan).
 */
export function buildGeoTransform(lpts, gpts) {
  const n = Math.min(lpts.length, gpts.length) / 2;
  const P = [];
  for (let i = 0; i < n; i++) {
    P.push({ x: lpts[i * 2], y: lpts[i * 2 + 1], lat: gpts[i * 2], lon: gpts[i * 2 + 1] });
  }
  return solveAffine(P);
}

/**
 * Selesaikan affine dengan 4+ titik guna normal equations (least squares).
 * Model: lon = a*x + b*y + c ; lat = d*x + e*y + f
 */
function solveAffine(P) {
  // Bina matriks normal untuk [a b c]
  const solve3 = (pts, target) => {
    let Sxx = 0, Sxy = 0, Sx = 0, Syy = 0, Sy = 0, Sn = 0;
    let Sxt = 0, Syt = 0, St = 0;
    for (const p of pts) {
      Sxx += p.x * p.x; Sxy += p.x * p.y; Sx += p.x;
      Syy += p.y * p.y; Sy += p.y; Sn += 1;
      Sxt += p.x * target(p); Syt += p.y * target(p); St += target(p);
    }
    // Selesaikan sistem 3x3 (aturan Cramer)
    const A = [[Sxx, Sxy, Sx], [Sxy, Syy, Sy], [Sx, Sy, Sn]];
    const B = [Sxt, Syt, St];
    return cramer3(A, B);
  };
  const [a, b, c] = solve3(P, (p) => p.lon);
  const [d, e, f] = solve3(P, (p) => p.lat);
  return new GeoAffine(a, b, c, d, e, f);
}

function cramer3(A, B) {
  const det = (m) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det(A);
  if (Math.abs(D) < 1e-12) throw new Error('Sistem affine singular');
  const rep = (col) => A.map((row, i) => row.map((v, j) => (j === col ? B[i] : v)));
  return [det(rep(0)) / D, det(rep(1)) / D, det(rep(2)) / D];
}

/** Transform affine PDF-point <-> lon/lat. */
export class GeoAffine {
  constructor(a, b, c, d, e, f) {
    this.a = a; this.b = b; this.c = c; // lon = a*x + b*y + c
    this.d = d; this.e = e; this.f = f; // lat = d*x + e*y + f
    const det = a * e - b * d;
    this.det = det;
  }
  pointToLonLat(x, y) {
    return { lon: this.a * x + this.b * y + this.c, lat: this.d * x + this.e * y + this.f };
  }
  lonLatToPoint(lon, lat) {
    const dx = lon - this.c, dy = lat - this.f;
    return { x: (this.e * dx - this.b * dy) / this.det, y: (-this.d * dx + this.a * dy) / this.det };
  }
  /** Skala: berapa darjah per point PDF. */
  get degreesPerPoint() {
    return { x: Math.hypot(this.a, this.d), y: Math.hypot(this.b, this.e) };
  }
}

/**
 * Pada peta skala kecil (1 halaman), affine point->lonlat sangat tepat.
 * Tetapi untuk ketepatan GIS, kita boleh tukar melalui CRS sebenar.
 * Fungsi ini mengira ketepatan residual pada titik-titik kawalan.
 */
export function residuals(transform, lpts, gpts) {
  const n = lpts.length / 2;
  const out = [];
  for (let i = 0; i < n; i++) {
    const p = transform.pointToLonLat(lpts[i * 2], lpts[i * 2 + 1]);
    const dLat = p.lat - gpts[i * 2];
    const dLon = p.lon - gpts[i * 2 + 1];
    // tukar ke meter
    const mLat = dLat * 111320;
    const mLon = dLon * 111320 * Math.cos((gpts[i * 2] * Math.PI) / 180);
    out.push({ i, dLatM: mLat, dLonM: mLon, errM: Math.hypot(mLat, mLon) });
  }
  return out;
}
