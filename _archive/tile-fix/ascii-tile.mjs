import fs from 'node:fs';
import { PNG } from 'pngjs';
const z2 = PNG.sync.read(fs.readFileSync('web-kerilla/tiles/2/1_0.png'));
function ascii(im){
  const W=im.width,H=im.height;
  let out='';
  for(let y=0;y<H;y+=8){
    let row='';
    for(let x=0;x<W;x+=8){
      const i=(y*W+x)*4;
      const r=im.data[i],g=im.data[i+1],b=im.data[i+2];
      if(g>180&&b>180&&r<120) row+='C';
      else if(r>180&&g<100&&b<100) row+='R';
      else if(r<60&&g<60&&b<60) row+='K';
      else if(r>230&&g>230&&b>230) row+=' ';
      else row+='.';
    }
    out+=row+String.fromCharCode(10);
  }
  return out;
}
console.log('=== z2/1_0.png (mewakili src 1024-2048 x 0-1024) ===');
console.log(ascii(z2));

