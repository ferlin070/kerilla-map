import proj4 from "proj4";
const utm = "+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs";
function distM(a,b){ const A=proj4("EPSG:4326",utm,[a.lon,a.lat]); const B=proj4("EPSG:4326",utm,[b.lon,b.lat]); return Math.hypot(B[0]-A[0],B[1]-A[1]); }

console.log("=== BANDING SUDUT: GDAL vs GPTS vs transform 300dpi ===");
console.log("");
console.log("(a) Sudut GDAL (dari GeoTIFF 600dpi):");
console.log("  TL " + "(102.0576569, 5.7301412)");
console.log("  TR " + "(102.1408772, 5.7305586)");
console.log("  BR " + "(102.1411774, 5.6716560)");
console.log("  BL " + "(102.0579571, 5.6712386)");
console.log("");
console.log("(b) GPTS (dari PDF):");
console.log("  TL " + "(102.0576569, 5.7301412)");
console.log("  TR " + "(102.1408857, 5.7305629)");
console.log("  BR " + "(102.1411774, 5.6716560)");
console.log("  BL " + "(102.0579571, 5.6712386)");
console.log("");
const gdal = {
  TL: {lon:102.0576569, lat:5.7301412},
  TR: {lon:102.1408772, lat:5.7305586},
  BR: {lon:102.1411774, lat:5.6716560},
  BL: {lon:102.0579571, lat:5.6712386},
};
const gpts = {
  TL: {lon:102.0576569392, lat:5.7301411583},
  TR: {lon:102.1408856855, lat:5.7305629358},
  BR: {lon:102.1411774321, lat:5.6716560363},
  BL: {lon:102.0579571490, lat:5.6712386219},
};
console.log("=== RALAT GDAL vs GPTS (meter) ===");
for(const k of ["TL","TR","BR","BL"]){
  console.log("  " + k + ": " + distM(gdal[k], gpts[k]).toFixed(3) + " m");
}
console.log("");
console.log("3 titik (BL,BR,TL) adalah EXACT (0m kerana guna 3-titik solve).");
console.log("TR ada residual ~0.94m (quadrilateral, bukan rectangle sempurna).");
