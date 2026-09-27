import fs from 'node:fs';
import { PNG } from 'pngjs';

const img = PNG.sync.read(fs.readFileSync('web-kerilla/kerilla-map.png'));
const W=img.width, H=img.height, D=img.data;
const lum=(x,y)=>{ const i=(y*W+x)*4; return D[i]*0.299+D[i+1]*0.587+D[i+2]*0.114; };

// flood-fill komponen gelap (hitam = nombor kontur)
console.log('flood-fill...');
const seen=new Uint8Array(W*H);
const comps=[];
for(let y=1;y<H-1;y++){
  for(let x=1;x<W-1;x++){
    const idx=y*W+x;
    if(seen[idx]) continue;
    if(lum(x,y)>=110) continue;
    let stack=[idx]; seen[idx]=1;
    let minx=x,maxx=x,miny=y,maxy=y,cnt=0;
    while(stack.length){
      const i2=stack.pop(); cnt++;
      const cx=i2%W, cy=(i2/W)|0;
      if(cx<minx)minx=cx; if(cx>maxx)maxx=cx; if(cy<miny)miny=cy; if(cy>maxy)maxy=cy;
      if(cx>0&&!seen[i2-1]&&lum(cx-1,cy)<110){seen[i2-1]=1;stack.push(i2-1);}
      if(cx<W-1&&!seen[i2+1]&&lum(cx+1,cy)<110){seen[i2+1]=1;stack.push(i2+1);}
      if(cy>0&&!seen[i2-W]&&lum(cx,cy-1)<110){seen[i2-W]=1;stack.push(i2-W);}
      if(cy<H-1&&!seen[i2+W]&&lum(cx,cy+1)<110){seen[i2+W]=1;stack.push(i2+W);}
    }
    const w=maxx-minx+1, h=maxy-miny+1;
    // digit: w 6-46, h 8-32, px 12-600
    if(cnt>=12&&cnt<=600&&w>=6&&w<=46&&h>=8&&h<=32){
      comps.push({x:minx,y:miny,w:w,h:h,cnt:cnt});
    }
  }
}
console.log('komponen digit:', comps.length);

// guguskan jadi nombor
comps.sort((a,b)=>(a.y-b.y)||(a.x-b.x));
const groups=[];
for(const c of comps){
  let placed=false;
  for(const g of groups){
    const oy=Math.min(g.y+g.h,c.y+c.h)-Math.max(g.y,c.y);
    const minH=Math.min(g.h,c.h);
    if(oy>minH*0.5){
      const gap=c.x-(g.x+g.w);
      if(gap>=-4 && gap<=c.h*1.4){
        const nx=Math.min(g.x,c.x), ny=Math.min(g.y,c.y);
        const nx2=Math.max(g.x+g.w,c.x+c.w), ny2=Math.max(g.y+g.h,c.y+c.h);
        g.x=nx; g.y=ny; g.w=nx2-nx; g.h=ny2-ny; g.n=(g.n||1)+1;
        placed=true; break;
      }
    }
  }
  if(!placed) groups.push({x:c.x,y:c.y,w:c.w,h:c.h,n:1});
}
const labels=groups.filter(g=>g.w<=130 && g.h>=9 && g.h<=32 && g.w>=7);
console.log('kumpulan nombor:', labels.length);

// atlas 1024x1024
const PAD=3;
let cursorX=0, cursorY=0, rowH=0, AW=1024, AH=1024;
const items=[];
const atlas=new PNG({width:AW,height:AH});
for(let i=0;i<AW*AH;i++){atlas.data[i*4]=255;atlas.data[i*4+1]=255;atlas.data[i*4+2]=255;atlas.data[i*4+3]=255;}
for(const g of labels){
  const sw=g.w+PAD*2, sh=g.h+PAD*2;
  if(cursorX+sw>AW){ cursorX=0; cursorY+=rowH+1; rowH=0; }
  if(cursorY+sh>AH){ console.log('  atlas penuh pada '+items.length+' label'); break; }
  for(let yy=0;yy<sh;yy++){
    for(let xx=0;xx<sw;xx++){
      const sx=g.x-PAD+xx, sy=g.y-PAD+yy;
      const di=((cursorY+yy)*AW+(cursorX+xx))*4;
      if(sx<0||sy<0||sx>=W||sy>=H){ continue; }
      const si=(sy*W+sx)*4;
      atlas.data[di]=D[si]; atlas.data[di+1]=D[si+1]; atlas.data[di+2]=D[si+2]; atlas.data[di+3]=255;
    }
  }
  items.push({x:g.x+g.w/2, y:g.y+g.h/2, w:g.w, h:g.h, sx:cursorX, sy:cursorY, sw:sw, sh:sh});
  cursorX+=sw+1; if(sh>rowH) rowH=sh;
}
fs.writeFileSync('web-kerilla/labels.png', PNG.sync.write(atlas));
fs.writeFileSync('web-kerilla/labels.json', JSON.stringify(items));
const kb=(fs.statSync('web-kerilla/labels.png').size/1024).toFixed(1);
console.log('atlas: '+AW+'x'+AH+', '+kb+'KB, '+items.length+' label disimpan');
console.log('SELESAI');

