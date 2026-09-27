import fs from 'node:fs';
import { PNG } from 'pngjs';
const img = PNG.sync.read(fs.readFileSync('web-kerilla/kerilla-map.png'));
const W=img.width, H=img.height, D=img.data;
const m=JSON.parse(fs.readFileSync('web-kerilla/map-meta.json'));
const t4=m.levels[4].transform;
const ll2px=(lon,lat)=>{ 
  const d=t4.A*t4.E-t4.B*t4.D, dx=lon-t4.C, dy=lat-t4.F;
  return { col:(t4.E*dx-t4.B*dy)/d, row:(-t4.D*dx+t4.A*dy)/d }; };
const gps={lon:102.0934117,lat:5.6792883};
const p=ll2px(gps.lon,gps.lat);
console.log('GPS user => pixel peta: ('+p.col.toFixed(1)+', '+p.row.toFixed(1)+')');
console.log('');
// Carian nombor terdekat GPS: scan komponen digit dalam radius 600px
const lum=(x,y)=>{ const i=(y*W+x)*4; return D[i]*0.299+D[i+1]*0.587+D[i+2]*0.114; };
const cx=Math.floor(p.col), cy=Math.floor(p.row);
const seen=new Uint8Array(1201*1201);
const comps=[];
const X0=Math.max(0,cx-600), Y0=Math.max(0,cy-600);
const X1=Math.min(W,cx+600), Y1=Math.min(H,cy+600);
for(let y=Y0;y<Y1;y+=3){
  for(let x=X0;x<X1;x+=3){
    const lx=(x-X0), ly=(y-Y0);
    if(seen[ly*1201+lx]) continue;
    if(lum(x,y)>=120) continue;
    // flood
    const q=[[x,y]]; seen[ly*1201+lx]=1;
    let minx=x,maxx=x,miny=y,maxy=y,cnt=0;
    while(q.length){
      const [qx,qy]=q.pop(); cnt++;
      if(qx<minx)minx=qx; if(qx>maxx)maxx=qx; if(qy<miny)miny=qy; if(qy>maxy)maxy=qy;
      for(const [ddx,ddy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=qx+ddx, ny=qy+ddy;
        if(nx<X0||ny<Y0||nx>=X1||ny>=Y1) continue;
        const sx=(nx-X0), sy=(ny-Y0);
        if(seen[sy*1201+sx]) continue;
        if(lum(nx,ny)>=120) continue;
        seen[sy*1201+sx]=1; q.push([nx,ny]);
      }
    }
    if(cnt>=12&&cnt<=400&&(maxx-minx)<40&&(maxy-miny)<30){
      comps.push({x:minx,y:miny,w:maxx-minx+1,h:maxy-miny+1,cnt,dist:Math.hypot(minx-cx,miny-cy)});
    }
  }
}
comps.sort((a,b)=>a.dist-b.dist);
console.log('digit berhampiran GPS: '+comps.length);
console.log('5 terdekat:');
for(let i=0;i<Math.min(5,comps.length);i++){
  const c=comps[i];
  console.log('  @('+c.x+','+c.y+') '+c.w+'x'+c.h+' px='+c.cnt+' jarak='+Math.round(c.dist)+'px');
}

