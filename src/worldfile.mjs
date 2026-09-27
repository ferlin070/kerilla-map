/**
 * worldfile.mjs — Enjin georeferencing teras (jantung Avenza).
 *
 * World file (ESRI) = 6 parameter transformasi affine piksel <-> koordinat dunia:
 *
 *   X_geo = A * col + B * row + C
 *   Y_geo = D * col + E * row + F
 *
 *   A = saiz piksel paksi-X (biasanya +)
 *   B = rotasi/pencongan paksi-Y (biasanya 0)
 *   C = koordinat-X pusat piksel (0,0)  -> X bagi pojok kiri-atas
 *   D = rotasi/pencongan paksi-X (biasanya 0)
 *   E = saiz piksel paksi-Y (biasanya NEGATIF, sebab baris bertambah ke bawah)
 *   F = koordinat-Y pusat piksel (0,0)
 *
 * Format fail:
 *   .tfw / .jgw / .wld -> teks, satu nilai per baris: A B C D E F
 *   GeoTIFF            -> ModelPixelScale + ModelTiepoint (kita tukar ke bentuk yang sama)
 */

export class AffineTransform {
  constructor({ A, B, C, D, E, F }) {
    this.A = A; this.B = B; this.C = C;
    this.D = D; this.E = E; this.F = F;
    const det = A * E - B * D;
    if (Math.abs(det) < 1e-18) throw new Error('Matriks affine singular (determinant ~ 0)');
    this.det = det;
  }

  /** Piksel (col,row) -> koordinat dunia (x,y) dalam CRS peta. */
  pixelToWorld(col, row) {
    return {
      x: this.A * col + this.B * row + this.C,
      y: this.D * col + this.E * row + this.F,
    };
  }

  /** Koordinat dunia (x,y) -> piksel pecahan (col,row). Songsangan matriks. */
  worldToPixel(x, y) {
    const dx = x - this.C;
    const dy = y - this.F;
    return {
      col: (this.E * dx - this.B * dy) / this.det,
      row: (-this.D * dx + this.A * dy) / this.det,
    };
  }

  /** Saiz satu piksel dalam unit dunia (ground sample distance). */
  get pixelSize() {
    return { x: Math.hypot(this.A, this.D), y: Math.hypot(this.B, this.E) };
  }

  /** Bounding box dunia bagi imej width x height px. */
  bounds(width, height) {
    const corners = [
      this.pixelToWorld(0, 0),
      this.pixelToWorld(width, 0),
      this.pixelToWorld(width, height),
      this.pixelToWorld(0, height),
    ];
    const xs = corners.map((c) => c.x);
    const ys = corners.map((c) => c.y);
    return {
      minX: Math.min(...xs), maxX: Math.max(...xs),
      minY: Math.min(...ys), maxY: Math.max(...ys),
      corners,
    };
  }

  toWorldFile() {
    return [this.A, this.D, this.B, this.E, this.C, this.F]
      .map((n) => n.toFixed(12)).join('\n') + '\n';
  }

  toJSON() {
    return { A: this.A, B: this.B, C: this.C, D: this.D, E: this.E, F: this.F };
  }
}

/** Parse world file ESRI (.tfw/.jgw/.wld). Nota: susunan fail = A D B E C F. */
export function parseWorldFile(text) {
  const nums = text.trim().split(/\s+/).filter(Boolean).map(Number);
  if (nums.length < 6 || nums.some((n) => !Number.isFinite(n))) {
    throw new Error('World file tidak sah: perlu 6 nombor (A D B E C F)');
  }
  const [A, D, B, E, C, F] = nums;
  return new AffineTransform({ A, B, C, D, E, F });
}

/**
 * Bina AffineTransform dari GeoTIFF ModelPixelScale + ModelTiepoint.
 * Tiepoint: [I, J, K, X, Y, Z] — piksel (I,J) bersamaan dunia (X,Y).
 * ModelPixelScale: [sx, sy, sz] — saiz piksel (kita pakai abs untuk sx, negatif untuk sy).
 */
export function transformFromGeoTiff(pixelScale, tiePoints) {
  if (!pixelScale || !tiePoints || tiePoints.length < 6) {
    throw new Error('GeoTIFF tiada ModelPixelScale / ModelTiepoint yang cukup');
  }
  const [sx, sy] = pixelScale;
  const [I, J, , X, Y] = tiePoints;

  if (Math.abs(sy) > Math.abs(sx) * 1.5) {
    // Sesetengah fail simpan sy sebagai "RasterPixelIsArea" dengan sumbu Y normal.
    // Kita normalkan supaya baris bertambah ke bawah -> E negatif.
    return new AffineTransform({ A: sx, B: 0, C: X - I * sx, D: 0, E: -sy, F: Y + J * sy });
  }
  return new AffineTransform({ A: sx, B: 0, C: X - I * sx, D: 0, E: -sy, F: Y + J * sy });
}

/** Baris demi baris untuk debug. */
export function describeTransform(t) {
  const px = t.pixelSize;
  return [
    'AffineTransform {',
    `  A (px size X)  = ${t.A}`,
    `  B (skew Y)     = ${t.B}`,
    `  C (origin X)   = ${t.C}`,
    `  D (skew X)     = ${t.D}`,
    `  E (px size Y)  = ${t.E}`,
    `  F (origin Y)   = ${t.F}`,
    `  GSD            = ${px.x} x ${px.y} unit/piksel`,
    '}',
  ].join('\n');
}
