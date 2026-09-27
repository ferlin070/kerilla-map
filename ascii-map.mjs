import fs from 'node:fs';
import { PNG } from 'pngjs';
const img = PNG.sync.read(fs.readFileSync('web-kerilla/kerilla-map.png'));
const W = img.width, H = img.height, D = img.data;
const lum = (x,y) => { const i=(y*W+x)*4; return D[i]*0.299+D[i+1]*0.587+D[i+2]*0.114; };
function ascii(x0,y0,w,h){
  let out='';
  for(let y=y0;y<y0+h;y++){
    let row='';
    for(let x=x0;x<x0+w;x++){
      const l=lum(x,y);
      row += l<110?'#':(l<180?'.':' ');
    }
    out+=row+'\n';
  }
  return out;
}
console.log('=== (200,800) 100x50 ===');
console.log(ascii(200,800,100,50));
console.log('=== (1500,400) 100x50 ===');
console.log(ascii(1500,400,100,50));
console.log('=== (1000,1500) 100x50 ===');
console.log(ascii(1000,1500,100,50));

