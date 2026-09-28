// Kira GeoTransform GDAL untuk render 600 DPI dari GPTS/LPTS
// dan tulis GeoTIFF dengan gdal-async.

// GPTS (4 sudut, lat/lon):
// LPTS [0 1 0 0 1 0 1 1] normalized ke BBox 841.92 x 594.96 pt
// LPTS order: (0,1)=kiri-atas, (0,0)=kiri-bawah, (1,0)=kanan-bawah, (1,1)=kanan-atas

const gpts = [
  {lat:5.7301411583, lon:102.0576569392},  // (0,1) TL
  {lat:5.6712386219, lon:102.0579571490},  // (0,0) BL
  {lat:5.6716560363, lon:102.1411774321},  // (1,0) BR
  {lat:5.7305629358, lon:102.1408856855},  // (1,1) TR
];

// Render 600 DPI = 7017 x 4959 px (MediaBox penuh)
// BBox = 841.92 x 594.96 pt -> pada 600dpi = 7016.0 x 4958.0 px
// MediaBox = 842 x 595 pt -> 7016.67 x 4958.33 px

// GDAL GeoTransform: gt[0]=lon TL, gt[1]=lon/px, gt[2]=rotasi, gt[3]=lat TL, gt[4]=rotasi, gt[5]=lat/px (negatif)

// Guna least squares affine: lon = a*px + b*py + c, lat = d*px + e*py + f
// dengan px,py dalam pixel 600dpi (MediaBox full)
const W = 7017, H = 4959;

// LPTS -> pixel (full MediaBox): px = lpts.x * W, py = lpts.y * H
// (y=0 atas? atau bawah?)
// Dalam PDF/GeoPDF, LPTS y=1 = atas. Render pdftoppm: y=0 atas.
// Jadi pixel py = (1 - lpts.y) * H? atau lpts.y * H?

// Mari semak: GPTS[0] = TL (lat 5.7301 = utara = ATAS render)
// LPTS[0] = (0,1) y=1
// Render atas = y=0 pixel
// Jadi py_pixel = (1 - lpts.y) * H
// TL: py = (1-1)*H = 0 (atas) ✓
// BL: py = (1-0)*H = H (bawah) ✓

const lpts = [[0,1],[0,0],[1,0],[1,1]];
const px = lpts.map(([x,y]) => x * W);
const py = lpts.map(([x,y]) => (1-y) * H);

// least squares solve
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

// Untuk lon = a*px + b*py + c
const [a,b,c] = solve(px, py, gpts.map(g=>g.lon));
const [d,e,f] = solve(px, py, gpts.map(g=>g.lat));

console.log("=== AFFINE (600dpi full MediaBox) ===");
console.log("lon = " + a + "*px + " + b + "*py + " + c);
console.log("lat = " + d + "*px + " + e + "*py + " + f);
console.log("");

// GeoTransform GDAL:
// gt[0] = lon at (0,0) = c
// gt[1] = lon per px = a
// gt[2] = lon per py = b
// gt[3] = lat at (0,0) = f
// gt[4] = lat per px = d
// gt[5] = lat per py = e (negatif untuk north-up)
const gt = [c, a, b, f, d, e];
console.log("GeoTransform GDAL:");
console.log("  [" + gt.map(v=>v.toExponential(10)).join(", ") + "]");
console.log("");
console.log("Pixel size: " + a.toExponential(6) + " x " + e.toExponential(6) + " deg/px");
console.log("");
// residual
let maxErr=0;
for(let i=0;i<4;i++){
  const lon2 = a*px[i]+b*py[i]+c;
  const lat2 = d*px[i]+e*py[i]+f;
  const err = Math.hypot((lon2-gpts[i].lon)*111320*Math.cos(5.7*Math.PI/180), (lat2-gpts[i].lat)*111320);
  maxErr=Math.max(maxErr, err);
}
console.log("max residual: " + maxErr.toFixed(3) + " m");
