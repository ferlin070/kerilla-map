// Guna 3 titik exact untuk affine (bukan least squares yang buggy)
// 4 titik GPTS membentuk quadrilateral, bukan rectangle sempurna.
// Guna 3 titik untuk exact affine, titik 4 untuk check residual.

// Pilih 3 titik: BL(0,0), BR(1,0), TL(0,1)
// lon = a*xn + b*yn + c
// BL: (0,0) -> c = 102.0579571490
// BR: (1,0) -> a + c = 102.1411774321 -> a = 0.0832202831
// TL: (0,1) -> b + c = 102.0576569392 -> b = -0.0003002098

const c = 102.0579571490;
const a = 102.1411774321 - c;  // 0.0832202831
const b = 102.0576569392 - c;  // -0.0003002098

console.log("=== AFFINE 3 TITIK (exact) ===");
console.log("lon = " + a + "*xn + " + b + "*yn + " + c);
console.log("");
console.log("Check TR (1,1): " + (a*1 + b*1 + c));
console.log("  GPTS TR = 102.1408856855");
console.log("  ralat = " + ((a+b+c) - 102.1408856855).toExponential(3) + " deg = " + (((a+b+c)-102.1408856855)*111320*Math.cos(5.7*Math.PI/180)).toFixed(3) + " m");
console.log("");

// lat = d*xn + e*yn + f
// BL: (0,0) -> f = 5.6712386219
// BR: (1,0) -> d + f = 5.6716560363 -> d = 0.0004174144
// TL: (0,1) -> e + f = 5.7301411583 -> e = 0.0589025364
const f = 5.6712386219;
const d = 5.6716560363 - f;
const e = 5.7301411583 - f;

console.log("lat = " + d + "*xn + " + e + "*yn + " + f);
console.log("");
console.log("Check TR (1,1): " + (d*1 + e*1 + f));
console.log("  GPTS TR = 5.7305629358");
console.log("  ralat = " + ((d+e+f) - 5.7305629358).toExponential(3) + " deg = " + (((d+e+f)-5.7305629358)*111320).toFixed(3) + " m");
console.log("");

// Scale ke pixel 600dpi (W=7017, H=4959)
// xn = px/W, yn = py/H (py=0 atas, yn=0 bawah... tunggu)
// yn = 1 - lpts.y, lpts.y=1 atas. Dalam pixel py=0 atas.
// Jadi yn = py/H (py=0 atas -> yn=0 bawah? TIDAK)
// Mari tentukan: yn=0 = bawah (BL), yn=1 = atas (TL)
// Dalam render, py=0 = atas. Jadi py = (1-yn)*H, atau yn = 1 - py/H

// GeoTransform: gt[0]=lon(0,0), gt[1]=d lon/d px, gt[2]=d lon/d py, gt[3]=lat(0,0), gt[4]=d lat/d px, gt[5]=d lat/d py

// px = xn * W, py = (1 - yn) * H
// xn = px/W, yn = 1 - py/H
// lon = a*xn + b*yn + c = a*(px/W) + b*(1-py/H) + c = (a/W)*px + (-b/H)*py + (b+c)
// lat = d*xn + e*yn + f = (d/W)*px + (-e/H)*py + (e+f)

const W=7017, H=4959;
const gt0 = b + c;                 // lon at py=0 (atas)
const gt1 = a / W;                 // lon per px
const gt2 = -b / H;                // lon per py
const gt3 = e + f;                 // lat at py=0 (atas)
const gt4 = d / W;                 // lat per px
const gt5 = -e / H;                // lat per py

console.log("=== GeoTransform GDAL (600dpi) ===");
console.log("gt[0] = " + gt0);  // lon top-left
console.log("gt[1] = " + gt1.toExponential(12));
console.log("gt[2] = " + gt2.toExponential(12));
console.log("gt[3] = " + gt3);  // lat top-left
console.log("gt[4] = " + gt4.toExponential(12));
console.log("gt[5] = " + gt5.toExponential(12));
console.log("");
console.log("[" + [gt0,gt1,gt2,gt3,gt4,gt5].map(v=>v.toExponential(12)).join(", ") + "]");
console.log("");
console.log("gsd: " + (gt1*111320*Math.cos(5.7*Math.PI/180)).toExponential(4) + " m/px (x), " + Math.abs(gt5*111320).toExponential(4) + " m/px (y)");
