import gdal from "gdal-async";

const ds = gdal.open("kerilla-600dpi.tif");
const W = ds.rasterSize.x, H = ds.rasterSize.y;
const b1 = ds.bands.get(1), b2 = ds.bands.get(2), b3 = ds.bands.get(3);
const d1 = b1.pixels.read(0,0,W,H);
const d2 = b2.pixels.read(0,0,W,H);
const d3 = b3.pixels.read(0,0,W,H);

// Pejabat (3984.9, 3840.6) - analisa kawasan luas untuk cari jalur "Building Compound" kelabu
// "Building Compound" adalah jalur kelabu (abu-abu), biasanya bangunan
console.log("=== PEJABAT: analisa jalur bangunan kelabu ===");
console.log("");
const px = 3984.9, py = 3840.6;
// kira purata warna dalam grid 100x100 sekitar titik
console.log("Purata warna dalam sel 50px (setiap sel 50px):");
for(let gy=-4; gy<=4; gy++){
  let line="";
  for(let gx=-4; gx<=4; gx++){
    const cx = Math.round(px+gx*50), cy = Math.round(py+gy*50);
    let r=0,g=0,b=0,n=0;
    for(let dy=-25;dy<=25;dy++)for(let dx=-25;dx<=25;dx++){
      const x=cx+dx,y=cy+dy;
      if(x<0||y<0||x>=W||y>=H) continue;
      const i=y*W+x; r+=d1[i];g+=d2[i];b+=d3[i];n++;
    }
    r/=n;g/=n;b/=n;
    const lum=(r*0.299+g*0.587+b*0.114);
    // klasifikasi: kelabu (abu) = r~g~b, hijau (tumbuh), biru (air)
    let ch;
    if(Math.abs(r-g)<15 && Math.abs(g-b)<15 && lum>100) ch="abu";
    else if(g>r && g>b) ch="hijau";
    else if(b>r && b>g) ch="biru";
    else if(r>g && r>b) ch="merah";
    else ch="lain";
    line += ch.slice(0,4).padStart(5)+" ";
  }
  console.log(line);
}
console.log("");
console.log("(center = pin pejabat)");
