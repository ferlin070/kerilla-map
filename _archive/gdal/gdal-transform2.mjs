// Solve affine dengan normalize px/py ke 0..1 untuk kestabilan numerik
const gpts = [
  {lat:5.7301411583, lon:102.0576569392},
  {lat:5.6712386219, lon:102.0579571490},
  {lat:5.6716560363, lon:102.1411774321},
  {lat:5.7305629358, lon:102.1408856855},
];
const lpts = [[0,1],[0,0],[1,0],[1,1]];
const W = 7017, H = 4959;

// normalize: xn = lpts.x (0..1), yn = lpts.y (0..1) [y=1 atas]
// tapi dalam pixel render, y=0 atas, jadi yn_pixel = 1 - lpts.y
const xn = lpts.map(([x,y]) => x);
const yn = lpts.map(([x,y]) => (1-y)); // y=1 atas -> 0, y=0 bawah -> 1

function solve(x, y, z){
  const n = x.length;
  let Sx=0,Sy=0,Sxx=0,Syy=0,Sxy=0,Sxz=0,Syz=0,Sz=0;
  for(let i=0;i<n;i++){
    Sx+=x[i]; Sy+=y[i]; Sxx+=x[i]*x[i]; Syy+=y[i]*y[i]; Sxy+=x[i]*y[i];
    Sxz+=x[i]*z[i]; Syz+=y[i]*z[i]; Sz+=z[i];
  }
  const D = n*Sxx*Syy + 2*Sx*Sy*Sxy - Sx*Sx*Syy - Sy*Sy*Sxx - n*Sxy*Sxy;
  const a = (n*Sxz*Syy + Sy*Sxy*Sz + Sx*Sy*Syz - Sx*Sxz*Syy - Sy*Sy*Sxz - n*Sxy*Syz)/D;
  const b = (n*Sxx*Syz + Sx*Sxy*Sz + Sx*Sy*Sxz - Sx*Sx*Syz - Sxy*Sxy*Sz - n*Sxy*Sxz)/D;
  const c = (Sxx*Syy*Sz + Sx*Sxy*Syz + Sx*Sy*Sxz - Sx*Sxz*Syy - Sy*Syz*Sxx - Sxy*Sxy*Sz)/D;
  return [a,b,c];
}

// lon = an*xn + bn*yn + cn
const [an,bn,cn] = solve(xn, yn, gpts.map(g=>g.lon));
const [dn,en,fn] = solve(xn, yn, gpts.map(g=>g.lat));

console.log("=== NORMALIZED (0..1) ===");
console.log("lon = " + an + "*xn + " + bn + "*yn + " + cn);
console.log("lat = " + dn + "*xn + " + en + "*yn + " + fn);
console.log("");

// Scale: xn = px/W, yn = py/H (py pixel, 0 atas)
// lon = an*(px/W) + bn*(py/H) + cn
//     = (an/W)*px + (bn/H)*py + cn
const a = an/W, b = bn/H, c = cn;
const d = dn/W, e = en/H, f = fn;

console.log("=== PIXEL FULL (600dpi 7017x4959) ===");
console.log("lon = " + a.toExponential(12) + "*px + " + b.toExponential(12) + "*py + " + c);
console.log("lat = " + d.toExponential(12) + "*px + " + e.toExponential(12) + "*py + " + f);
console.log("");

const gt = [c, a, b, f, d, e];
console.log("GeoTransform GDAL:");
console.log("[" + gt.map(v=>v.toExponential(12)).join(", ") + "]");
console.log("");
console.log("Pixel size: " + a.toExponential(6) + " deg/px (x), " + e.toExponential(6) + " deg/px (y)");
console.log("gsd: " + (a*111320*Math.cos(5.7*Math.PI/180)).toExponential(3) + " m/px (x), " + Math.abs(e*111320).toExponential(3) + " m/px (y)");
console.log("");
// residual
let maxErr=0;
for(let i=0;i<4;i++){
  const lon2 = an*xn[i]+bn*yn[i]+cn;
  const lat2 = dn*xn[i]+en*yn[i]+fn;
  const err = Math.hypot((lon2-gpts[i].lon)*111320*Math.cos(5.7*Math.PI/180), (lat2-gpts[i].lat)*111320);
  maxErr=Math.max(maxErr, err);
}
console.log("max residual: " + maxErr.toFixed(4) + " m");
