import fs from 'node:fs';
import { PNG } from 'pngjs';

const VW=430, VH=600;  // potret lebar (kes terburuk untuk overlap)

function frame(kind) {
  const p = new PNG({width:VW,height:VH});
  const set=(x,y,r,g,b)=>{ if(x<0||y<0||x>=VW||y>=VH) return; const i=(y*VW+x)*4;
    p.data[i]=r; p.data[i+1]=g; p.data[i+2]=b; p.data[i+3]=255; };
  const rect=(x0,y0,w,h,r,g,b)=>{ for(let y=y0;y<y0+h;y++) for(let x=x0;x<x0+w;x++) set(x,y,r,g,b); };

  rect(0,0,VW,VH, 0xf3,0xef,0xe4);                    // sand
  rect(0,0,VW,44, 0x1f,0x4d,0x3f);                    // header
  rect(0,VH-62,VW,62, 0xfb,0xfa,0xf6);                // nav

  if (kind==='before') {
    // header btn 36x36
    rect(8,4,36,36, 0x2a,0x5c,0x4c);
    rect(VW-44,4,36,36, 0x2a,0x5c,0x4c);
    // chip kecil
    rect(10,52,72,26, 0x12,0x31,0x28);
    // legend toggle ~32 tinggi
    rect(VW-10-158,52,158,32, 0xfb,0xfa,0xf6);
    // fab 44x44 gap 10
    let by=VH-62-16-44;
    for(let k=4;k>=1;k--){ rect(VW-12-44,by,44,44, 0xfb,0xfa,0xf6); by-=54; }
  } else {
    // header btn 44x44
    rect(8,0,44,44, 0x2a,0x5c,0x4c);
    rect(VW-52,0,44,44, 0x2a,0x5c,0x4c);
    // chip dengan max-width
    rect(10,52,72,26, 0x12,0x31,0x28);
    // legend toggle 44 tinggi
    rect(VW-10-158,52,158,44, 0xfb,0xfa,0xf6);
    // scale bar baharu (kiri bawah)
    rect(12,VH-62-14-34,110,34, 0xfb,0xfa,0xf6);
    // fab 48x48 gap 12
    let by=VH-62-16-48;
    for(let k=4;k>=1;k--){ rect(VW-12-48,by,48,48, 0xfb,0xfa,0xf6); by-=60; }
    // bulatan tap-zone (garis putus) untuk tunjuk area sebenar
    const dash=(cx,cy,r,g,b,rad)=>{
      for(let a=0;a<360;a+=6){ const t=a*Math.PI/180;
        set(Math.round(cx+rad*Math.cos(t)), Math.round(cy+rad*Math.sin(t)), r,g,b); }
    };
    let cy=VH-62-16-48+24;
    for(let k=4;k>=1;k--){ dash(VW-12-24,cy, 232,130,60, 28); cy-=60; }
  }
  return p;
}

const b=frame('before'), a=frame('after');
fs.writeFileSync('web-kerilla/touch-before.png', PNG.sync.write(b));
fs.writeFileSync('web-kerilla/touch-after.png', PNG.sync.write(a));

const GAP=20;
const c=new PNG({width:VW*2+GAP,height:VH});
for(let i=0;i<c.data.length;i+=4){ c.data[i]=0x16;c.data[i+1]=0x24;c.data[i+2]=0x1f;c.data[i+3]=255; }
const blit=(src,ox)=>{ for(let y=0;y<VH;y++) for(let x=0;x<VW;x++){ const si=(y*VW+x)*4;
  const di=(y*c.width+(x+ox))*4; c.data[di]=src.data[si]; c.data[di+1]=src.data[si+1];
  c.data[di+2]=src.data[si+2]; c.data[di+3]=255; } };
blit(b,0); blit(a,VW+GAP);
fs.writeFileSync('web-kerilla/touch-compare.png', PNG.sync.write(c));
console.log('bukti dijana: touch-before.png, touch-after.png, touch-compare.png');
