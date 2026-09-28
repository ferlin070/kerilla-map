import gdal from "gdal-async";
import fs from "node:fs";
import { PNG } from "pngjs";

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

const SIZE = 500; // lebih besar untuk nampak ciri sekeliling

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
  // cross merah di tengah (pin)
  const cx = SIZE/2, cy = SIZE/2;
  for(let t=-25; t<=25; t++){
    const set=(xx,yy)=>{if(xx<0||yy<0||xx>=SIZE||yy>=SIZE)return;const i=(yy*SIZE+xx)*4;png.data[i]=255;png.data[i+1]=0;png.data[i+2]=0;png.data[i+3]=255;};
    set(Math.round(cx+t), Math.round(cy));
    set(Math.round(cx), Math.round(cy+t));
  }
  fs.writeFileSync("shot-"+p.name+".png", PNG.sync.write(png));
  console.log("saved shot-"+p.name+".png ("+SIZE+"x"+SIZE+")");
}

// Buat gabungan 3 imej secara mendatar untuk paparan mudah
const names = ["kuil","padang","pejabat"];
const imgs = names.map(n=>PNG.sync.read(fs.readFileSync("shot-"+n+".png")));
const GW = SIZE*3, GH = SIZE;
const combined = new PNG({width:GW, height:GH});
for(let i=0;i<GW*GH;i++){combined.data[i*4]=255;combined.data[i*4+1]=255;combined.data[i*4+2]=255;combined.data[i*4+3]=255;}
names.forEach((n,idx)=>{
  const img = imgs[idx];
  for(let y=0;y<GH;y++)for(let x=0;x<SIZE;x++){
    const si=(y*SIZE+x)*4, di=(y*GW + idx*SIZE + x)*4;
    combined.data[di]=img.data[si]; combined.data[di+1]=img.data[si+1]; combined.data[di+2]=img.data[si+2]; combined.data[di+3]=img.data[si+3];
  }
});
fs.writeFileSync("shot-combined.png", PNG.sync.write(combined));
console.log("saved shot-combined.png ("+GW+"x"+GH+")");
