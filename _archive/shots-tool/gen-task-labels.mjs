import gdal from "gdal-async";
import fs from "node:fs";
import { PNG } from "pngjs";

// labels.json guna koordinat peta LAMA (3408x2452)
// Tile 600dpi = 7017x4959. Skala = 7017/3408 = 2.059
const scale = 7017/3408;
const labels = JSON.parse(fs.readFileSync("web-kerilla/labels.json","utf8"));

// pilih beberapa label kecil (nombor task) tersebar
const ds = gdal.open("kerilla-600dpi.tif");
const W = ds.rasterSize.x, H = ds.rasterSize.y;
const b1=ds.bands.get(1),b2=ds.bands.get(2),b3=ds.bands.get(3);
const d1=b1.pixels.read(0,0,W,H), d2=b2.pixels.read(0,0,W,H), d3=b3.pixels.read(0,0,W,H);

// crop 300x300px sekitar label (zoom tinggi)
const SIZE=300;
const outDir="web-600dpi/shots/task-labels";
fs.mkdirSync(outDir,{recursive:true});

// pilih label tersebar: ambil label kecil (h<25) pada y berbeza
const small = labels.filter(l=>l.h<25 && l.w<40);
// sample ~6 label tersebar
const step = Math.max(1, Math.floor(small.length/6));
const chosen = [];
for(let i=0;i<small.length;i+=step){
  if(chosen.length>=6) break;
  chosen.push(small[i]);
}

for(let idx=0; idx<chosen.length; idx++){
  const l = chosen[idx];
  const cx = Math.round(l.x * scale);
  const cy = Math.round(l.y * scale);
  const x0 = cx - SIZE/2, y0 = cy - SIZE/2;
  const png = new PNG({width:SIZE,height:SIZE});
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
    const sx=x0+x, sy=y0+y, di=(y*SIZE+x)*4;
    if(sx<0||sy<0||sx>=W||sy>=H){ png.data[di]=255;png.data[di+1]=255;png.data[di+2]=255;png.data[di+3]=255; }
    else { const si=sy*W+sx; png.data[di]=d1[si];png.data[di+1]=d2[si];png.data[di+2]=d3[si];png.data[di+3]=255; }
  }
  fs.writeFileSync(outDir+"/label-"+idx+".png", PNG.sync.write(png));
  console.log("label-"+idx+".png center ("+cx+","+cy+") dari label lama ("+l.x+","+l.y+") saiz "+l.w+"x"+l.h);
}
