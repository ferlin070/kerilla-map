import gdal from "gdal-async";
const path = "/home/sewanode/kaihara/poc/data/user/kerilla.pdf";

const ds = gdal.open(path);
console.log("=== gdalinfo " + path + " ===");
console.log("");
console.log("Driver: " + ds.driver.description);
console.log("Size: " + ds.rasterSize.x + " x " + ds.rasterSize.y);
console.log("Bands: " + ds.bands.count());
console.log("");
const gt = ds.geoTransform;
console.log("GeoTransform (Affine):");
console.log("  [" + gt.join(", ") + "]");
console.log("");
const srs = ds.srs;
console.log("SRS (proj4): " + srs.toProj4());
console.log("");
const w = ds.rasterSize.x, h = ds.rasterSize.y;
function pix2geo(px, py){
  return {
    x: gt[0] + px*gt[1] + py*gt[2],
    y: gt[3] + px*gt[4] + py*gt[5],
  };
}
const TL = pix2geo(0,0);
const TR = pix2geo(w,0);
const BR = pix2geo(w,h);
const BL = pix2geo(0,h);
console.log("Corner Coordinates:");
console.log("  Top Left     (" + TL.x.toFixed(6) + ", " + TL.y.toFixed(6) + ")");
console.log("  Top Right    (" + TR.x.toFixed(6) + ", " + TR.y.toFixed(6) + ")");
console.log("  Bottom Right (" + BR.x.toFixed(6) + ", " + BR.y.toFixed(6) + ")");
console.log("  Bottom Left  (" + BL.x.toFixed(6) + ", " + BL.y.toFixed(6) + ")");
console.log("");
console.log("Pixel size: " + gt[1] + " x " + Math.abs(gt[5]) + " (deg/px)");
console.log("");
console.log("=== Metadata (default) ===");
const md = ds.getMetadata();
for(const [k,v] of Object.entries(md)) console.log("  " + k + " = " + v);
console.log("");
console.log("=== Metadata LAYERS ===");
const mdL = ds.getMetadata("LAYERS");
if(Object.keys(mdL).length===0) console.log("  (kosong)");
for(const [k,v] of Object.entries(mdL)) console.log("  " + k + " = " + v);
