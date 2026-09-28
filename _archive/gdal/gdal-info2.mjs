import gdal from "gdal-async";

const ds = gdal.open("kerilla-600dpi.tif");
console.log("=== gdalinfo kerilla-600dpi.tif ===");
console.log("");
console.log("Driver: " + ds.driver.description);
console.log("Size: " + ds.rasterSize.x + " x " + ds.rasterSize.y);
console.log("Bands: " + ds.bands.count());
console.log("");
const gt = ds.geoTransform;
console.log("GeoTransform:");
console.log("  " + gt.map(v=>v.toExponential(12)).join(", "));
console.log("");
console.log("SRS: " + ds.srs.toProj4());
console.log("");
const w = ds.rasterSize.x, h = ds.rasterSize.y;
function pix2geo(px, py){
  return { lon: gt[0] + px*gt[1] + py*gt[2], lat: gt[3] + px*gt[4] + py*gt[5] };
}
console.log("Corner Coordinates:");
console.log("  Top Left     (" + pix2geo(0,0).lon.toFixed(7) + ", " + pix2geo(0,0).lat.toFixed(7) + ")");
console.log("  Top Right    (" + pix2geo(w,0).lon.toFixed(7) + ", " + pix2geo(w,0).lat.toFixed(7) + ")");
console.log("  Bottom Right (" + pix2geo(w,h).lon.toFixed(7) + ", " + pix2geo(w,h).lat.toFixed(7) + ")");
console.log("  Bottom Left  (" + pix2geo(0,h).lon.toFixed(7) + ", " + pix2geo(0,h).lat.toFixed(7) + ")");
console.log("");
console.log("Pixel size = " + gt[1].toExponential(6) + " x " + Math.abs(gt[5]).toExponential(6));
