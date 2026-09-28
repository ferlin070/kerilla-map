import proj4 from "proj4";
const utm = "+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs";
function distM(a,b){ const A=proj4("EPSG:4326",utm,[a.lon,a.lat]); const B=proj4("EPSG:4326",utm,[b.lon,b.lat]); return Math.hypot(B[0]-A[0],B[1]-A[1]); }

// Transform BARU (GDAL 600dpi, 3-titik exact)
const gt = [102.0576569392, 1.185980947698e-5, 6.053837467281e-8, 5.7301411583, 5.948616217760e-8, -1.187790611010e-5];
function baruPx2ll(px,py){ return {lon: gt[0]+px*gt[1]+py*gt[2], lat: gt[3]+px*gt[4]+py*gt[5]}; }
function baruLl2px(lon,lat){
  // inverse affine
  const det = gt[1]*gt[5] - gt[2]*gt[4];
  const dx = lon - gt[0], dy = lat - gt[3];
  return {px: (gt[5]*dx - gt[2]*dy)/det, py: (-gt[4]*dx + gt[1]*dy)/det};
}

// Transform LAMA (legacy, live)
const legacy = {A:2.3721951932950383e-5, B:-1.19386159907922e-7, C:102.06362121700228, D:1.1959980026824864e-7, E:2.3759886222421095e-5, F:5.6719353522961065};
function legacyLl2px(lon,lat){ const d=legacy.A*legacy.E-legacy.B*legacy.D, dx=lon-legacy.C, dy=lat-legacy.F;
  return {col:(legacy.E*dx-legacy.B*dy)/d, row:(-legacy.D*dx+legacy.A*dy)/d}; }

const pts = [
  {name:"Kuil", lat:5.68916, lon:102.10571, label:"Hindu Temple 1"},
  {name:"Padang bola", lat:5.68792, lon:102.10445, label:"Football Field 1 / Nursery 1"},
  {name:"Pejabat", lat:5.68476, lon:102.10515, label:"Office / Staff House Comp"},
];

console.log("=== PIXEL 3 TITIK: transform BARU (600dpi) vs LAMA (legacy) ===");
console.log("");
console.log("Titik | lat,lon | BARU pixel (600dpi 7017x4959) | LAMA pixel (3408x2452)");
console.log("------|---------|-----------------------------|------------------------");
for(const p of pts){
  const b = baruLl2px(p.lon, p.lat);
  const l = legacyLl2px(p.lon, p.lat);
  console.log(p.name+" | "+p.lat+","+p.lon+" | ("+b.px.toFixed(1)+","+b.py.toFixed(1)+") | ("+l.col.toFixed(1)+","+l.row.toFixed(1)+")");
}
