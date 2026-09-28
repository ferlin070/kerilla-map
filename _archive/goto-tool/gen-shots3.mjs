import gdal from "gdal-async";
import fs from "node:fs";
import { PNG } from "pngjs";

// Buat screenshot yang lebih besar (800px) untuk paparan jelas, dengan anotasi
const ds = gdal.open("kerilla-600dpi.tif");
const W = ds.rasterSize.x, H = ds.rasterSize.y;
const b1 = ds.bands.get(1), b2 = ds.bands.get(2), b3 = ds.bands.get(3);
const d1 = b1.pixels.read(0,0,W,H);
const d2 = b2.pixels.read(0,0,W,H);
const d3 = b3.pixels.read(0,0,W,H);

const pts = [
  {name:"kuil", px:4034.0, py:3470.4, label:"Hindu Temple 1"},
  {name:"padang", px:3927.3, py:3574.3, label:"Football Field 1 / Nursery 1"},
  {name:"pejabat", px:3984.9, py:3840.6, label:"Office / Staff House Comp"},
];

const SIZE = 600;

for(const p of pts){
  const x0 = Math.round(p.px - SIZE/2);
  const y0 = Math.round(p.py - SIZE/2);
  const png = new PNG({width:SIZE, height:SIZE});
  for(let y=0; y<SIZE; y++){
    for(let x=0; x<SIZE; x++){
      const sx = x0+x, sy = y0+y;
      const di = (y*SIZE+x)*4;
      if(sx<0||sy<0||sx>=W||sy>=H){ png.data[di]=255;png.data[di+1]=255;png.data[di+2]=255;png.data[di+3]=255; }
      else { const si=sy*W+sx; png.data[di]=d1[si];png.data[di+1]=d2[si];png.data[di+2]=d3[si];png.data[di+3]=255; }
    }
  }
  // cross merah tebal di tengah
  const c=SIZE/2;
  for(let t=-30;t<=30;t++){
    const set=(x,y)=>{if(x<0||y<0||x>=SIZE||y>=SIZE)return;const i=(y*SIZE+x)*4;png.data[i]=255;png.data[i+1]=0;png.data[i+2]=0;png.data[i+3]=255;};
    set(Math.round(c+t),Math.round(c)); set(Math.round(c),Math.round(c+t));
  }
  fs.writeFileSync("shot-"+p.name+".png", PNG.sync.write(png));
}
console.log("done 600x600 screenshots");
