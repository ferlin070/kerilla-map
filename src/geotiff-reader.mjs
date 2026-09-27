/**
 * geotiff-reader.mjs — Baca GeoTIFF sebenar guna lib 'geotiff'.
 *
 * Ini laluan produksi Avenza: penerbit upload GeoTIFF/GeoPDF ->
 * server/app baca ModelPixelScale + ModelTiepoint + CRS (GeoKeys) ->
 * bina AffineTransform.
 *
 * Kami juga ekstrak:
 *  - saiz imej (width/height)  -> untuk validasi had 10,000 px
 *  - GeoKeys (ProjectedCSTypeGeoKey) -> EPSG CRS
 *  - sample raster -> boleh jadi preview/thumbnail
 */
import { fromArrayBuffer } from 'geotiff';
import { AffineTransform } from './worldfile.mjs';

const ProjectedCSTypeGeoKey = 3072;
const GeographicTypeGeoKey = 2048;

export async function readGeoTiff(buffer) {
  const tiff = await fromArrayBuffer(buffer);
  const image = await tiff.getImage();

  const width = image.getWidth();
  const height = image.getHeight();

  const pixelScale = image.getModelPixelScale?.();
  const tiePoints = image.getModelTiepoint?.();
  const geoKeys = image.getGeoKeys?.() || {};

  let transform;
  if (pixelScale && tiePoints && tiePoints.length >= 6) {
    const [sx, sy] = pixelScale;
    const [I, J, , X, Y] = tiePoints;
    transform = new AffineTransform({
      A: sx, B: 0, C: X - I * sx,
      D: 0, E: -Math.abs(sy), F: Y + J * Math.abs(sy),
    });
  } else {
    throw new Error('GeoTIFF tiada ModelPixelScale/ModelTiepoint -> tidak georeferenced');
  }

  const epsg =
    geoKeys[ProjectedCSTypeGeoKey] ||
    geoKeys[GeographicTypeGeoKey] ||
    null;

  return {
    width,
    height,
    transform,
    epsg,
    geoKeys,
    isGeographic: Boolean(geoKeys[GeographicTypeGeoKey] && !geoKeys[ProjectedCSTypeGeoKey]),
    bbox: transform.bounds(width, height),
    image,
    tiff,
  };
}

/**
 * Validasi mengikut garis panduan Avenza Map Store (submission guidelines).
 * Ini gate yang mesti lulus sebelum peta dibenarkan publish.
 */
export function validateForStore(meta, { maxPx = 10000, maxBytes = 250 * 1024 * 1024, bytes } = {}) {
  const errors = [];
  const warnings = [];

  if (meta.width > maxPx || meta.height > maxPx) {
    errors.push(`Dimensi ${meta.width}x${meta.height} melebihi had ${maxPx}px`);
  }
  if (bytes != null && bytes > maxBytes) {
    errors.push(`Saiz fail ${(bytes / 1048576).toFixed(1)}MB melebihi had 250MB`);
  }
  if (meta.isGeographic) {
    errors.push('CRS geodetik dikesan — mesti PROJECTED CRS (supaya Measure Distance/Area tepat)');
  }
  if (!meta.epsg && !meta.isGeographic) {
    warnings.push('EPSG tidak dijumpai dalam GeoKeys — pastikan WKT disertakan');
  }
  if (Math.abs(meta.transform.B) > 1e-9 || Math.abs(meta.transform.D) > 1e-9) {
    warnings.push('Rotasi/skew dikesan dalam transform — OK, tetapi uji paparan pada peranti');
  }

  return { ok: errors.length === 0, errors, warnings };
}
