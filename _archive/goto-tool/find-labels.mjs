import gdal from "gdal-async";

const ds = gdal.open("kerilla-600dpi.tif");
const W = ds.rasterSize.x, H = ds.rasterSize.y;
const b1 = ds.bands.get(1), b2 = ds.bands.get(2), b3 = ds.bands.get(3);
const d1 = b1.pixels.read(0,0,W,H);
const d2 = b2.pixels.read(0,0,W,H);
const d3 = b3.pixels.read(0,0,W,H);

const lum = (x,y) => { const i=y*W+x; return d1[i]*0.299+d2[i]*0.587+d3[i]*0.114; };

// cari teks gelap (label) berhampiran setiap titik
const pts = [
  {name:"kuil", px:4034.0, py:3470.4, label:"Hindu Temple 1"},
  {name:"padang", px:3927.3, py:3574.3, label:"Football Field 1 / Nursery 1"},
  {name:"pejabat", px:3984.9, py:3840.6, label:"Office / Staff House Comp"},
];

console.log("=== CARI LABEL GELAP berhampiran setiap titik ===");
console.log("");
for(const p of pts){
  // cari cluster piksel gelap dalam radius 200px dari titik
  let darkClusters = [];
  const R = 200;
  const visited = new Uint8Array((2*R+1)*(2*R+1));
  for(let dy=-R; dy<=R; dy++){
    for(let dx=-R; dx<=R; dx++){
      const x = Math.round(p.px+dx), y = Math.round(p.py+dy);
      if(x<0||y<0||x>=W||y>=H) continue;
      const li = (dy+R)*(2*R+1)+(dx+R);
      if(visited[li]) continue;
      if(lum(x,y) < 100){
        // flood fill
        let stack=[[x,y]], cnt=0, minx=x,maxx=x,miny=y,maxy=y;
        visited[li]=1;
        while(stack.length){
          const [cx,cy]=stack.pop(); cnt++;
          if(cx<minx)minx=cx; if(cx>maxx)maxx=cx; if(cy<miny)miny=cy; if(cy>maxy)maxy=cy;
          for(const [nx,ny] of [[cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1]]){
            if(nx<Math.round(p.px-R)||nx>Math.round(p.px+R)||ny<Math.round(p.py-R)||ny>Math.round(p.py+R)) continue;
            const ni=(ny-Math.round(p.py-R))*(2*R+1)+(nx-Math.round(p.px-R));
            if(visited[ni]) continue;
            if(lum(nx,ny)<100){ visited[ni]=1; stack.push([nx,ny]); }
          }
        }
        if(cnt>=20 && cnt<=2000){ darkClusters.push({x:minx+(maxx-minx)/2, y:miny+(maxy-miny)/2, w:maxx-minx+1, h:maxy-miny+1, cnt}); }
      }
    }
  }
  darkClusters.sort((a,b)=>Math.hypot(a.x-p.px,a.y-p.py)-Math.hypot(b.x-p.px,b.y-p.py));
  console.log(p.name + " (" + p.label + "):");
  console.log("  pin pixel: ("+p.px+","+p.py+")");
  for(const c of darkClusters.slice(0,8)){
    const dx = c.x-p.px, dy = c.y-p.py;
    const distPx = Math.hypot(dx,dy);
    const distM = distPx * 1.318; // gsd 600dpi
    console.log("  label @("+c.x.toFixed(0)+","+c.y.toFixed(0)+") offset("+dx.toFixed(0)+","+dy.toFixed(0)+") jarak "+distPx.toFixed(0)+"px = "+distM.toFixed(0)+"m, saiz "+c.w+"x"+c.h+" ("+c.cnt+"px)");
  }
  console.log("");
}
