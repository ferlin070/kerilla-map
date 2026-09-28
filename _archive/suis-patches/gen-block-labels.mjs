import gdal from "gdal-async";
import fs from "node:fs";
import { PNG } from "pngjs";

const scale = 7017/3408;
const labels = JSON.parse(fs.readFileSync("web-kerilla/labels.json","utf8"));

// Pilih label blok besar (mungkin "2 PM2002A" dsb) + label panjang tersebar
const big = labels.filter(l=>l.h>=30 || l.w>=70);

const ds = gdal.open("kerilla-600dpi.tif");
const W = ds.rasterSize.x, H = ds.rasterSize.y;
const b1=ds.bands.get(1),b2=ds.bands.get(2),b3=ds.bands.get(3);
const d1=b1.pixels.read(0,0,W,H), d2=b2.pixels.read(0,0,W,H), d3=b3.pixels.read(0,0,W,H);

const outDir="web-600dpi/shots/block-labels";
fs.mkdirSync(outDir,{recursive:true});

const SIZE=400;
const chosen = big.slice(0, 12);

for(let i=0;i<chosen.length;i++){
  const l=chosen[i];
  const cx=Math.round(l.x*scale), cy=Math.round(l.y*scale);
  const x0=cx-SIZE/2, y0=cy-SIZE/2;
  const png=new PNG({width:SIZE,height:SIZE});
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
    const sx=x0+x, sy=y0+y, di=(y*SIZE+x)*4;
    if(sx<0||sy<0||sx>=W||sy>=H){ png.data[di]=255;png.data[di+1]=255;png.data[di+2]=255;png.data[di+3]=255; }
    else { const si=sy*W+sx; png.data[di]=d1[si];png.data[di+1]=d2[si];png.data[di+2]=d3[si];png.data[di+3]=255; }
  }
  // cross kecil di pusat
  const c=SIZE/2;
  for(let t=-10;t<=10;t++){
    const set=(x,y)=>{if(x<0||y<0||x>=SIZE||y>=SIZE)return;const i=(y*SIZE+x)*4;png.data[i]=255;png.data[i+1]=0;png.data[i+2]=0;png.data[i+3]=255;};
    set(Math.round(c+t),Math.round(c)); set(Math.round(c),Math.round(c+t));
  }
  fs.writeFileSync(outDir+"/block-"+i+".png", PNG.sync.write(png));
  console.log("block-"+i+".png center ("+cx+","+cy+") label lama ("+l.x+","+l.y+") "+l.w+"x"+l.h);
}
