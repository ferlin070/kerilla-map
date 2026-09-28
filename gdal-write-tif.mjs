import gdal from "gdal-async";
import fs from "node:fs";

// Baca PNG 600dpi, tulis GeoTIFF dengan georeference
const srcPath = "kerilla-600dpi-1.png";
const outPath = "kerilla-600dpi.tif";

const src = gdal.open(srcPath);
const W = src.rasterSize.x;
const H = src.rasterSize.y;
console.log("Source PNG: " + W + " x " + H);

// GeoTransform (dari pengiraan 3-titik exact)
const gt = [
  102.0576569392,
  1.185980947698e-5,
  6.053837467281e-8,
  5.7301411583,
  5.948616217760e-8,
  -1.187790611010e-5,
];

// SRS = EPSG:4326 (WGS84)
const srs = gdal.SpatialReference.fromEPSG(4326);

// Cipta GeoTIFF
const driver = gdal.drivers.get("GTiff");
const dst = driver.create(outPath, W, H, src.bands.count(), gdal.GDT_Byte, {
  COMPRESS: "DEFLATE",
});
dst.geoTransform = gt;
dst.srs = srs;

// Salin data
for(let i=1;i<=src.bands.count();i++){
  const srcBand = src.bands.get(i);
  const dstBand = dst.bands.get(i);
  const data = srcBand.pixels.read(0, 0, W, H);
  dstBand.pixels.write(0, 0, W, H, data);
}
dst.flush();
console.log("GeoTIFF ditulis: " + outPath);
