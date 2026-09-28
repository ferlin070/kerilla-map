import gdal from "gdal-async";
import fs from "node:fs";
import { PNG } from "pngjs";

const ds = gdal.open("kerilla-600dpi.tif");
const W = ds.rasterSize.x, H = ds.rasterSize.y;

// Baca band
const band1 = ds.bands.get(1), band2 = ds.bands.get(2), band3 = ds.bands.get(3);
const d1 = band1.pixels.read(0,0,W,H);
const d2 = band2.pixels.read(0,0,W,H);
const d3 = band3.pixels.read(0,0,W,H);

// 3 titik (pixel BARU)
const pts = [
  {name:"kuil", px:4034.0, py:3470.4},
  {name:"padang", px:3927.3, py:3574.3},
  {name:"pejabat", px:3984.9, py:3840.6},
];

// Crop 400x400px sekitar setiap titik (zoom tinggi)
const SIZE = 400;
for(const p of pts){
  const x0 = Math.round(p.px - SIZE/2);
  const y0 = Math.round(p.py - SIZE/2);
  const png = new PNG({width:SIZE, height:SIZE});
  for(let y=0; y<SIZE; y++){
    for(let x=0; x<SIZE; x++){
      const sx = x0+x, sy = y0+y;
      const di = (y*SIZE+x)*4;
      if(sx<0||sy<0||sx>=W||sy>=H){
        png.data[di]=255; png.data[di+1]=255; png.data[di+2]=255; png.data[di+3]=255;
      } else {
        const si = sy*W+sx;
        png.data[di]=d1[si]; png.data[di+1]=d2[si]; png.data[di+2]=d3[si]; png.data[di+3]=255;
      }
    }
  }
  // tandakan titik tengah dengan cross merah
  const cx = SIZE/2, cy = SIZE/2;
  for(let t=-20; t<=20; t++){
    const set = (xx,yy)=>{
      if(xx<0||yy<0||xx>=SIZE||yy>=SIZE) return;
      const i=(yy*SIZE+xx)*4;
      png.data[i]=255; png.data[i+1]=0; png.data[i+2]=0; png.data[i+3]=255;
    };
    set(Math.round(cx+t), Math.round(cy));
    set(Math.round(cx), Math.round(cy+t));
  }
  fs.writeFileSync("shot-"+p.name+".png", PNG.sync.write(png));
  console.log("saved shot-"+p.name+".png ("+SIZE+"x"+SIZE+", center "+p.px+","+p.py+")");
}
