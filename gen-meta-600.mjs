import fs from "node:fs";

// Buat folder web-600dpi (preview) lengkap
fs.rmSync("web-600dpi", { recursive: true, force: true });
fs.mkdirSync("web-600dpi", { recursive: true });

// Salin skin/core dari web-kerilla (tanpa raster/tile lama)
// Copy fail statik kecuali kerilla-map.png dan tiles/

// Baca transform GDAL (3-titik exact, 600dpi)
const gt = [102.0576569392, 1.185980947698e-5, 6.053837467281e-8, 5.7301411583, 5.948616217760e-8, -1.187790611010e-5];

// Transform untuk renderer: renderer guna A,B,C,D,E,F (lon=A*x+B*y+C, lat=D*x+E*y+F)
// dari GeoTransform: lon = gt[0] + px*gt[1] + py*gt[2], lat = gt[3] + px*gt[4] + py*gt[5]
const transform = {
  A: gt[1], B: gt[2], C: gt[0],
  D: gt[4], E: gt[5], F: gt[3],
};

const W = 7017, H = 4959;
const gsd = 1.318;
const zMax = 5;

// levels
const levels = [];
for(let z=zMax; z>=0; z--){
  const scale = Math.pow(2, zMax-z);
  const lw = Math.ceil(W/scale), lh = Math.ceil(H/scale);
  levels.push({
    z, scale,
    width: lw, height: lh,
    tilesX: Math.ceil(lw/256), tilesY: Math.ceil(lh/256),
    tiles: Math.ceil(lw/256)*Math.ceil(lh/256),
    metersPerPixel: +(gsd*scale).toFixed(3),
    transform: {
      A: gt[1]*scale, B: gt[2]*scale, C: gt[0],
      D: gt[4]*scale, E: gt[5]*scale, F: gt[3],
    },
  });
}

const meta = {
  width: W, height: H,
  gsdMeters: gsd,
  transform,
  transformLegacy: transform,
  transformNew: transform,
  levels,
  zMax,
  note: "600 DPI GeoTIFF, transform GDAL 3-titik exact (residual TR 1.056m)",
};

fs.writeFileSync("web-600dpi/map-meta.json", JSON.stringify(meta, null, 2));
console.log("map-meta.json ditulis:");
console.log("  transform.C = " + transform.C);
console.log("  width x height = " + W + "x" + H);
console.log("  gsdMeters = " + gsd);
console.log("  levels: " + levels.map(l=>l.metersPerPixel).join(", "));
