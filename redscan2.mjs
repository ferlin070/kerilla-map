import fs from 'node:fs';
import { PNG } from 'pngjs';
const img = PNG.sync.read(fs.readFileSync('web-kerilla/kerilla-map.png'));
const W=img.width, H=img.height, D=img.data;
const px=(x,y)=>{ const i=(y*W+x)*4; return [D[i],D[i+1],D[i+2]]; };

// kira distribusi warna merah
let redCount=0, redBright=0;
const reds={};
for(let y=0;y<H;y+=3) for(let x=0;x<W;x+=3){
  const p=px(x,y);
  if(p[0]>150 && p[1]<110 && p[2]<110){
    redCount++;
    if(p[0]>230&&p[1]<80) redBright++;
  }
}
console.log('piksel merah (sampel):', redCount);
console.log('piksel merah BRIGHT:', redBright);
// ambil sample koordinat merah pertama & print warna
let found=0;
for(let y=0;y<H&&found<5;y++) for(let x=0;x<W&&found<5;x++){
  const p=px(x,y);
  if(p[0]>150&&p[1]<110&&p[2]<110){
    console.log('merah @('+x+','+y+') rgb('+p.join(',')+')');
    found++;
  }
}

