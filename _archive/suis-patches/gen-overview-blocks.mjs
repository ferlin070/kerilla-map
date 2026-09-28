import gdal from "gdal-async";
import fs from "node:fs";
import { PNG } from "pngjs";

const scale = 7017/3408;
const labels = JSON.parse(fs.readFileSync("web-kerilla/labels.json","utf8"));

// Buat overview downsampled (1/6) dengan penanda semua label blok
const ds = gdal.open("kerilla-600dpi.tif");
const W = ds.rasterSize.x, H = ds.rasterSize.y;
const b1=ds.bands.get(1),b2=ds.bands.get(2),b3=ds.bands.get(3);
const d1=b1.pixels.read(0,0,W,H), d2=b2.pixels.read(0,0,W,H), d3=b3.pixels.read(0,0,W,H);

const F=6; // downsample factor
const ow=Math.ceil(W/F), oh=Math.ceil(H/F);
const png=new PNG({width:ow,height:oh});
for(let y=0;y<oh;y++)for(let x=0;x<ow;x++){
  const si=((y*F)*W+(x*F)), di=(y*ow+x)*4;
  png.data[di]=d1[si]; png.data[di+1]=d2[si]; png.data[di+2]=d3[si]; png.data[di+3]=255;
}

// Tandakan semua label blok besar dengan kotak merah
const big = labels.filter(l=>l.h>=30 || l.w>=70);
for(const l of big){
  const cx=Math.round(l.x*scale/F), cy=Math.round(l.y*scale/F);
  const rw=Math.max(3, Math.round(l.w*scale/F)), rh=Math.max(3, Math.round(l.h*scale/F));
  for(let y=cy-rh/2;y<=cy+rh/2;y++)for(let x=cx-rw/2;x<=cx+rw/2;x++){
    if(x<0||y<0||x>=ow||y>=oh) continue;
    const i=(y*ow+x)*4;
    // merah semi-transparent (garis luar)
    if(Math.abs(x-cx)>rw/2-1 || Math.abs(y-cy)>rh/2-1){
      png.data[i]=255; png.data[i+1]=0; png.data[i+2]=0; png.data[i+3]=255;
    }
  }
}

fs.writeFileSync("web-600dpi/shots/overview-blocks.png", PNG.sync.write(png));
console.log("overview-blocks.png ("+ow+"x"+oh+"), "+big.length+" blok ditanda");
