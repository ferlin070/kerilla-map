import gdal from "gdal-async";

// Baca GeoTIFF 600dpi, kira gsd dan metadata untuk tile
const ds = gdal.open("kerilla-600dpi.tif");
const W = ds.rasterSize.x, H = ds.rasterSize.y;
const gt = ds.geoTransform;

console.log("=== METADATA TILE DARI GeoTIFF 600dpi ===");
console.log("Size: " + W + " x " + H);
console.log("");
// gsd = pixel size dalam meter
// gt[1] = lon/px, gt[5] = lat/px (negatif)
const gsdX = gt[1] * 111320 * Math.cos(5.7*Math.PI/180);
const gsdY = Math.abs(gt[5]) * 111320;
console.log("gsd: " + gsdX.toFixed(4) + " m/px (x), " + gsdY.toFixed(4) + " m/px (y)");
console.log("gsd purata ~" + ((gsdX+gsdY)/2).toFixed(4) + " m/px");
console.log("");
// zMax untuk tile 256px
const TILE = 256;
const zMax = Math.ceil(Math.log2(Math.max(W,H)/TILE));
console.log("zMax = " + zMax);
console.log("");
// levels: z dari zMax (penuh) turun ke 0
// scale = 2^(zMax - z)
// mpp = gsd * scale
const gsd = (gsdX+gsdY)/2;
console.log("levels (z, scale, mpp, tilesX, tilesY):");
for(let z=zMax; z>=0; z--){
  const scale = Math.pow(2, zMax-z);
  const mpp = gsd * scale;
  const lw = Math.ceil(W/scale), lh = Math.ceil(H/scale);
  const tx = Math.ceil(lw/TILE), ty = Math.ceil(lh/TILE);
  console.log("  z"+z+": scale="+scale+" mpp="+mpp.toFixed(3)+" tiles="+tx+"x"+ty);
}
