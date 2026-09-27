import fs from 'node:fs';
import { PNG } from 'pngjs';
const img = PNG.sync.read(fs.readFileSync('web-kerilla/kerilla-map.png'));
const W=img.width, H=img.height, D=img.data;
const m=JSON.parse(fs.readFileSync('web-kerilla/map-meta.json'));
const t4=m.levels[4].transform;
const ll2px=(lon,lat)=>{ 
  const d=t4.A*t4.E-t4.B*t4.D, dx=lon-t4.C, dy=lat-t4.F;
  return { col:(t4.E*dx-t4.B*dy)/d, row:(-t4.D*dx+t4.A*dy)/d }; };
const lum=(x,y)=>{ const i=(y*W+x)*4; return D[i]*0.299+D[i+1]*0.587+D[i+2]*0.114; };

// Skrinshot user: map 1499x732 CSS, m/p = 0.22, GPS tengah
const gps={lon:102.0934117,lat:5.6792883};
const gpx=ll2px(gps.lon,gps.lat);
const mapW=1499, mapH=732, mpp=0.22;
const halfW=mpp*mapW/2, halfH=mpp*mapH/2;
// 1 px peta = 2.645m => dalam px peta: half = halfW/2.645
const halfPxW=halfW/2.645, halfPxH=halfH/2.645;
console.log('user melihat (px peta): tengah=('+gpx.col.toFixed(0)+','+gpx.row.toFixed(0)+') half='+halfPxW.toFixed(0)+'x'+halfPxH.toFixed(0));
const x0=Math.max(0,Math.floor(gpx.col-halfPxW)), x1=Math.min(W,Math.ceil(gpx.col+halfPxW));
const y0=Math.max(0,Math.floor(gpx.row-halfPxH)), y1=Math.min(H,Math.ceil(gpx.row+halfPxH));
console.log('bbox peta dilihat: ('+x0+','+y0+') ke ('+x1+','+y1+') = '+(x1-x0)+'x'+(y1-y0)+'px');
console.log('');
// Scan digit dalam bbox ini
let digitCount=0;
const digits=[];
const seen=new Uint8Array((x1-x0)*(y1-y0));
for(let y=y0;y<y1;y+=2){
  for(let x=x0;x<x1;x+=2){
    const sx=x-x0, sy=y-y0;
    if(seen[sy*(x1-x0)+sx]) continue;
    if(lum(x,y)>=120) continue;
    const q=[[x,y]]; seen[sy*(x1-x0)+sx]=1;
    let minx=x,maxx=x,miny=y,maxy=y,cnt=0;
    while(q.length){
      const [qx,qy]=q.pop(); cnt++;
      if(qx<minx)minx=qx; if(qx>maxx)maxx=qx; if(qy<miny)miny=qy; if(qy>maxy)maxy=qy;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=qx+dx, ny=qy+dy;
        if(nx<x0||ny<y0||nx>=x1||ny>=y1) continue;
        const sx2=nx-x0, sy2=ny-y0;
        if(seen[sy2*(x1-x0)+sx2]) continue;
        if(lum(nx,ny)>=120) continue;
        seen[sy2*(x1-x0)+sx2]=1; q.push([nx,ny]);
      }
    }
    if(cnt>=12&&cnt<=400&&(maxx-minx)<40&&(maxy-miny)<30){
      digitCount++;
      digits.push({x:minx,y:miny,w:maxx-minx+1,h:maxy-miny+1,cnt});
    }
  }
}
console.log('digit dalam view user: '+digitCount);
if(digitCount>0){
  console.log('contoh 8 pertama:');
  for(let i=0;i<Math.min(8,digits.length);i++){
    const c=digits[i];
    console.log('  @('+c.x+','+c.y+') '+c.w+'x'+c.h+' px='+c.cnt);
  }
  // Print ASCII beberapa digit pertama
  const c=digits[0];
  console.log('');
  console.log('ASCII digit pertama @('+c.x+','+c.y+'):');
  for(let yy=c.y-2;yy<c.y+c.h+2;yy++){
    let row='';
    for(let xx=c.x-2;xx<c.x+c.w+2;xx++){
      row += lum(xx,yy)<120?'#':(lum(xx,yy)<200?'.':' ');
    }
    console.log('  '+row);
  }
} else {
  console.log('=> TIADA digit dalam view user pada zoom 12x');
  console.log('   Ini bukti kawasan itu memang kosong (tanah/lot kosong).');
}

