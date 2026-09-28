import proj4 from "proj4";
const utm = "+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs";
function distM(a,b){ const A=proj4("EPSG:4326",utm,[a.lon,a.lat]); const B=proj4("EPSG:4326",utm,[b.lon,b.lat]); return Math.hypot(B[0]-A[0],B[1]-A[1]); }

// Transform 300dpi yang saya kira sebelum (untuk preview)
const baru = {A:2.3721951933e-5, B:1.1938615982e-7, C:102.0576590550, D:1.1959980027e-7, E:-2.3759886222e-5, F:5.7301422491};
function px2ll(t,c,r){ return {lon:t.A*c+t.B*r+t.C, lat:t.D*c+t.E*r+t.F}; }

// Transform 600dpi GDAL (baru dikira)
const gt = [102.0576569392, 1.185980947698e-5, 6.053837467281e-8, 5.7301411583, 5.948616217760e-8, -1.187790611010e-5];
function gdalPx2ll(px,py){ return {lon: gt[0]+px*gt[1]+py*gt[2], lat: gt[3]+px*gt[4]+py*gt[5]}; }

// GPTS
const gpts = [
  {lat:5.7301411583, lon:102.0576569392},
  {lat:5.6712386219, lon:102.0579571490},
  {lat:5.6716560363, lon:102.1411774321},
  {lat:5.7305629358, lon:102.1408856855},
];

console.log("=== SAHKAN: transform 300dpi (preview) vs GPTS ===");
console.log("");
// 300dpi render = 3509 x 2480. Sudut = pixel (0,0), (3509,0), (3509,2480), (0,2480)
console.log("300dpi sudut (transform preview):");
console.log("  TL(0,0)      = " + JSON.stringify(px2ll(baru,0,0)));
console.log("  TR(3509,0)   = " + JSON.stringify(px2ll(baru,3509,0)));
console.log("  BR(3509,2480)= " + JSON.stringify(px2ll(baru,3509,2480)));
console.log("  BL(0,2480)   = " + JSON.stringify(px2ll(baru,0,2480)));
console.log("");
console.log("Ralat vs GPTS:");
const corners300 = {
  TL: px2ll(baru,0,0),
  TR: px2ll(baru,3509,0),
  BR: px2ll(baru,3509,2480),
  BL: px2ll(baru,0,2480),
};
const gptsMap = {TL:gpts[0], BL:gpts[1], BR:gpts[2], TR:gpts[3]};
for(const k of ["TL","TR","BR","BL"]){
  const c = corners300[k];
  const g = gptsMap[k];
  console.log("  " + k + ": " + distM({lon:c.lon,lat:c.lat}, {lon:g.lon,lat:g.lat}).toFixed(3) + " m");
}
