// Kira pixel untuk koordinat ujian baru (transform GDAL 600dpi)
const gt = [102.0576569392, 1.185980947698e-5, 6.053837467281e-8, 5.7301411583, 5.948616217760e-8, -1.187790611010e-5];
function ll2px(lon,lat){
  const det = gt[1]*gt[5] - gt[2]*gt[4];
  const dx = lon - gt[0], dy = lat - gt[3];
  return {px: (gt[5]*dx - gt[2]*dy)/det, py: (-gt[4]*dx + gt[1]*dy)/det};
}

const pts = [
  {name:"Latex Station E", lat:5.687814, lon:102.082667},
  {name:"Rubber Factory Comp 1", lat:5.680182, lon:102.093841},
  {name:"Loji air (rujukan)", lat:5.68476, lon:102.10515},
];

console.log("=== PIXEL 600dpi (transform GDAL) ===");
for(const p of pts){
  const q = ll2px(p.lon, p.lat);
  console.log(p.name+" ("+p.lat+", "+p.lon+") -> ("+q.px.toFixed(0)+", "+q.py.toFixed(0)+")");
}
console.log("");
console.log("=== semak jarak Latex Station E ke Pejabat ===");
import proj4 from "proj4";
const utm = "+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs";
const a = proj4("EPSG:4326",utm,[102.082667,5.687814]);
const b = proj4("EPSG:4326",utm,[102.10515,5.68476]);
console.log("Latex E -> Pejabat: "+Math.hypot(b[0]-a[0],b[1]-a[1]).toFixed(0)+" m");
