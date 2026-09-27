import fs from 'node:fs';
import { PNG } from 'pngjs';
const img = PNG.sync.read(fs.readFileSync('web-kerilla/kerilla-map.png'));
const W=img.width, H=img.height, D=img.data;
const px=(x,y)=>{ const i=(y*W+x)*4; return [D[i],D[i+1],D[i+2]]; };
const lum=(x,y)=>{ const i=(y*W+x)*4; return D[i]*0.299+D[i+1]*0.587+D[i+2]*0.114; };
const isRed=(x,y)=>{ const p=px(x,y); return p[0]>150 && p[1]<110 && p[2]<110; };
const isLight=(x,y)=>lum(x,y)>200;

// 1. Cari blok merah besar
console.log('=== CARI BLOK MERAH & SEMAK PIXEL PUTIH DALAMNYA ===');
const visited=new Uint8Array(W*H);
let blocksFound=0;
for(let y=100;y<H-100;y+=10){
  for(let x=100;x<W-100;x+=10){
    if(visited[y*W+x]||!isRed(x,y)) continue;
    // flood fill merah
    const q=[[x,y]]; visited[y*W+x]=1;
    let minx=x,maxx=x,miny=y,maxy=y,cnt=0;
    while(q.length && cnt<50000){
      const [cx,cy]=q.pop(); cnt++;
      if(cx<minx)minx=cx; if(cx>maxx)maxx=cx; if(cy<miny)miny=cy; if(cy>maxy)maxy=cy;
      for(const [dx,dy] of [[3,0],[-3,0],[0,3],[0,-3]]){
        const nx=cx+dx,ny=cy+dy;
        if(nx<0||ny<0||nx>=W||ny>=H) continue;
        const idx=ny*W+nx;
        if(visited[idx]||!isRed(nx,ny)) continue;
        visited[idx]=1; q.push([nx,ny]);
      }
    }
    if(cnt>800){ // blok besar
      blocksFound++;
      if(blocksFound<=8){
        // kira pixel TERANG dalam bbox
        let light=0, total=0;
        for(let yy=miny;yy<=maxy;yy+=2) for(let xx=minx;xx<=maxx;xx+=2){
          total++;
          if(isLight(xx,yy)) light++;
        }
        console.log('blok merah @('+minx+','+miny+') '+((maxx-minx))+'x'+((maxy-miny))+' area='+cnt+' terang='+(light/total*100).toFixed(1)+'%');
        // print ASCII tengah blok untuk nampak ada teks putih?
        if(cnt>2000 && blocksFound<=4){
          const cw=Math.min(120,maxx-minx), ch=Math.min(50,maxy-miny);
          const cx0=Math.floor((minx+maxx)/2-cw/2), cy0=Math.floor((miny+maxy)/2-ch/2);
          console.log('  --- ASCII tengah blok (R=merah, #=terang, .=gelap) ---');
          for(let yy=cy0;yy<cy0+ch;yy+=2){
            let row='';
            for(let xx=cx0;xx<cx0+cw;xx+=2){
              if(isRed(xx,yy)) row += isLight(xx,yy)?'*':'R';
              else row += lum(xx,yy)<120?'#':(lum(xx,yy)<200?'.':' ');
            }
            console.log('  '+row);
          }
        }
      }
    }
  }
}
console.log('jumlah blok merah besar: '+blocksFound);

