import gdal from "gdal-async";
import fs from "node:fs";

const ds = gdal.open("kerilla-600dpi.tif");
const W = ds.rasterSize.x, H = ds.rasterSize.y;
const b1 = ds.bands.get(1), b2 = ds.bands.get(2), b3 = ds.bands.get(3);
const d1 = b1.pixels.read(0,0,W,H);
const d2 = b2.pixels.read(0,0,W,H);
const d3 = b3.pixels.read(0,0,W,H);
const lum = (x,y)=>{ const i=y*W+x; return d1[i]*0.299+d2[i]*0.587+d3[i]*0.114; };

// Saya tak boleh OCR, tapi boleh cari semua cluster teks di bahagian UTARA (py < 1500)
// dan paparkan lokasi supaya user boleh pilih
// Bahagian utara = lat > 5.70, py < ~1500 (atas peta)
console.log("=== CLUSTER TEKS GELAP di bahagian UTARA (py < 1800) ===");
console.log("(saiz besar = label teks; user boleh kenal pasti)");
console.log("");
const clusters = [];
const R = 100; // radius flood fill
// scan grid kasar
for(let y=200; y<1800; y+=5){
  for(let x=0; x<W; x+=5){
    if(lum(x,y) >= 100) continue;
    // flood fill untuk saiz cluster
    let stack=[[x,y]], cnt=0, minx=x,maxx=x,miny=y,maxy=y;
    const seen=new Set();
    seen.add(x+","+y);
    while(stack.length){
      const [cx,cy]=stack.pop(); cnt++;
      if(cx<minx)minx=cx;if(cx>maxx)maxx=cx;if(cy<miny)miny=cy;if(cy>maxy)maxy=cy;
      if(cnt>5000) break;
      for(const [nx,ny] of [[cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1]]){
        if(nx<0||ny<0||nx>=W||ny>=H) continue;
        if(nx<x-R||nx>x+R||ny<y-R||ny>y+R) continue;
        const k=nx+","+ny;
        if(seen.has(k)) continue;
        if(lum(nx,ny)<100){ seen.add(k); stack.push([nx,ny]); }
      }
    }
    if(cnt>=15 && cnt<=3000){
      const cw=maxx-minx+1, ch=maxy-miny+1;
      // teks label biasanya: ch 20-40px, cw boleh 50-300px
      if(ch>=15 && ch<=60 && cw>=20){
        clusters.push({x:minx+(maxx-minx)/2, y:miny+(maxy-miny)/2, w:cw, h:ch, cnt});
      }
    }
  }
}
// deduplicate
clusters.sort((a,b)=>a.y-b.y);
const uniq=[];
for(const c of clusters){
  if(uniq.some(u=>Math.hypot(u.x-c.x,u.y-c.y)<30)) continue;
  uniq.push(c);
}
console.log("Jumlah cluster label utara: "+uniq.length);
for(const c of uniq){
  console.log("  ("+c.x.toFixed(0)+","+c.y.toFixed(0)+") saiz "+c.w+"x"+c.h+" ("+c.cnt+"px)");
}
