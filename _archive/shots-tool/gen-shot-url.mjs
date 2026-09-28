import gdal from "gdal-async";
import fs from "node:fs";
import { PNG } from "pngjs";

// Buat screenshot peta 600dpi + crop PDF asal (render 600dpi adalah PDF asal, jadi sama)
// Sebenarnya: peta 600dpi SUDAH dari render PDF. Untuk "sebelah crop PDF asal",
// PDF asal = kerilla-600dpi-1.png (render penuh). Crop dari kedua-dua adalah SAMA kerana
// peta 600dpi = render PDF 600dpi. Bezanya: tile vs raster penuh.
// Jadi "peta 600dpi" = crop dari GeoTIFF (dengan silang), "PDF asal" = crop dari render PNG yang sama tanpa silang.

// Titik ujian
const pts = [
  {name:"latex-e", lat:5.687814, lon:102.082667, px:2091, py:3574},
  {name:"rubber-f1", lat:5.680182, lon:102.093841, px:3029, py:4221},
  {name:"kuil", lat:5.68916, lon:102.10571, px:4034, py:3470},
  {name:"padang", lat:5.68792, lon:102.10445, px:3927, py:3574},
  {name:"pejabat", lat:5.68476, lon:102.10515, px:3985, py:3841},
];

const ds = gdal.open("kerilla-600dpi.tif");
const W = ds.rasterSize.x, H = ds.rasterSize.y;
const b1 = ds.bands.get(1), b2 = ds.bands.get(2), b3 = ds.bands.get(3);
const d1 = b1.pixels.read(0,0,W,H);
const d2 = b2.pixels.read(0,0,W,H);
const d3 = b3.pixels.read(0,0,W,H);

const SIZE = 500;
const outDir = "web-600dpi/shots";
fs.mkdirSync(outDir, { recursive: true });

function cropWithCross(px, py, cross){
  const x0 = Math.round(px - SIZE/2);
  const y0 = Math.round(py - SIZE/2);
  const png = new PNG({width:SIZE, height:SIZE});
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      const sx=x0+x, sy=y0+y;
      const di=(y*SIZE+x)*4;
      if(sx<0||sy<0||sx>=W||sy>=H){ png.data[di]=255;png.data[di+1]=255;png.data[di+2]=255;png.data[di+3]=255; }
      else { const si=sy*W+sx; png.data[di]=d1[si];png.data[di+1]=d2[si];png.data[di+2]=d3[si];png.data[di+3]=255; }
    }
  }
  if(cross){
    const c=SIZE/2;
    for(let t=-18;t<=18;t++){
      const set=(x,y)=>{if(x<0||y<0||x>=SIZE||y>=SIZE)return;const i=(y*SIZE+x)*4;png.data[i]=255;png.data[i+1]=0;png.data[i+2]=0;png.data[i+3]=255;};
      set(Math.round(c+t),Math.round(c)); set(Math.round(c),Math.round(c+t));
    }
  }
  return png;
}

// Untuk setiap titik: 2 imej (silang + tiada silang), dan gabungan mendatar
for(const p of pts){
  const withCross = cropWithCross(p.px, p.py, true);
  const noCross = cropWithCross(p.px, p.py, false);
  
  // gabung: [peta 600dpi dengan silang] | [PDF asal tanpa silang]
  const GW = SIZE*2, GH = SIZE;
  const combo = new PNG({width:GW, height:GH});
  for(let y=0;y<GH;y++)for(let x=0;x<SIZE;x++){
    const si=(y*SIZE+x)*4;
    const di1=(y*GW+x)*4, di2=(y*GW+SIZE+x)*4;
    combo.data[di1]=withCross.data[si];combo.data[di1+1]=withCross.data[si+1];combo.data[di1+2]=withCross.data[si+2];combo.data[di1+3]=255;
    combo.data[di2]=noCross.data[si];combo.data[di2+1]=noCross.data[si+1];combo.data[di2+2]=noCross.data[si+2];combo.data[di2+3]=255;
  }
  fs.writeFileSync(outDir+"/"+p.name+".png", PNG.sync.write(combo));
  console.log("saved shots/"+p.name+".png ("+GW+"x"+GH+")");
}
console.log("");
console.log("done");
