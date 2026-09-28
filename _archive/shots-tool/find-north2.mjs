import gdal from "gdal-async";

const ds = gdal.open("kerilla-600dpi.tif");
const W = ds.rasterSize.x, H = ds.rasterSize.y;
const b1 = ds.bands.get(1), b2 = ds.bands.get(2), b3 = ds.bands.get(3);
const d1 = b1.pixels.read(0,0,W,H);
const d2 = b2.pixels.read(0,0,W,H);
const d3 = b3.pixels.read(0,0,W,H);
const lum = (x,y)=>{ const i=y*W+x; return d1[i]*0.299+d2[i]*0.587+d3[i]*0.114; };

// Cari ketumpatan teks gelap dalam sel 100x100 di bahagian utara
// (teks label hitam = banyak piksel gelap dalam satu sel)
console.log("=== KETUMPATAN TEKS GELAP di utara (py 200-1800), sel 200px ===");
console.log("");
for(let gy=200; gy<1800; gy+=200){
  let line = "py="+gy+": ";
  for(let gx=0; gx<W; gx+=200){
    let dark=0, total=0;
    for(let y=gy; y<Math.min(gy+200,1800); y+=4){
      for(let x=gx; x<Math.min(gx+200,W); x+=4){
        total++;
        if(lum(x,y)<100) dark++;
      }
    }
    const ratio = dark/total;
    // label teks ~ ratio 0.02-0.15
    let mark = ".";
    if(ratio>0.02) mark="#";
    if(ratio>0.05) mark="##";
    if(ratio>0.10) mark="###";
    line += mark;
  }
  console.log(line);
}
console.log("");
console.log("(# = kawasan ada teks/label; cari cluster # di utara)");
