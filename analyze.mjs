import fs from 'node:fs';
import { PNG } from 'pngjs';
const img = PNG.sync.read(fs.readFileSync('image.png'));
const W=img.width, H=img.height, D=img.data;
const px=(x,y)=>{ x=Math.max(0,Math.min(W-1,x|0)); y=Math.max(0,Math.min(H-1,y|0)); const i=(y*W+x)*4; return [D[i],D[i+1],D[i+2]]; };
console.log('saiz:', W+'x'+H);
let headerBottom = 0;
for(let y=0; y<120; y++) {
  let greenCount = 0;
  for(let x=0; x<W; x+=10) {
    const p = px(x,y);
    if(p[0]<70 && p[1]>70 && p[1]<140 && p[2]>70 && p[2]<140) greenCount++;
  }
  if(greenCount > W/10 * 0.3) headerBottom = y;
}
console.log('header bawah: ~', headerBottom);
let navTop = H;
for(let y=H-1; y>H-140; y--) {
  let paperCount = 0;
  for(let x=0; x<W; x+=10) {
    const p = px(x,y);
    if(p[0]>242 && p[1]>240 && p[2]>235) paperCount++;
  }
  if(paperCount > W/10 * 0.6) { navTop = y; break; }
}
console.log('nav atas: ~', navTop, 'tinggi:', H-navTop);
let legL=W, legB=0;
for(let y=60; y<220; y++) for(let x=W-420; x<W; x+=4) {
  const p=px(x,y);
  if(p[0]>248 && p[1]>248 && p[2]>248){ legL=Math.min(legL,x); legB=Math.max(legB,y); }
}
console.log('legend: kiri=',legL,' bawah=',legB);
let fabL=W,fabT=H,fabB=0;
for(let y=250; y<H-150; y++) for(let x=W-160; x<W-20; x+=2) {
  const p=px(x,y);
  if(p[0]>195 && p[1]>110 && p[1]<185 && p[2]<110){ fabL=Math.min(fabL,x); fabT=Math.min(fabT,y); fabB=Math.max(fabB,y); }
}
console.log('FAB: kiri=',fabL,' atas=',fabT,' bawah=',fabB);
let zT=H,zB=0,zL=W;
for(let y=fabB; y<H-140; y++) for(let x=W-140; x<W-20; x+=2) {
  const p=px(x,y);
  if(p[0]>245 && p[1]>245 && p[2]>245){ zL=Math.min(zL,x); zT=Math.min(zT,y); zB=Math.max(zB,y); }
}
console.log('zoom putih: kiri=',zL,' atas=',zT,' bawah=',zB);
let sbT=H;
for(let y=H-200; y<H-60; y++) for(let x=10; x<220; x+=4) {
  const p=px(x,y);
  if(p[0]>248 && p[1]>248 && p[2]>248){ sbT=Math.min(sbT,y); }
}
console.log('scale bar atas: ~', sbT);
console.log('');
console.log('=== RUANG MAP ===');
const mapTop=headerBottom+1, mapBot=Math.min(navTop, sbT)-1, mapRight=Math.min(legL, fabL, zL)-1;
console.log('skrin: '+W+'x'+H);
console.log('map: '+mapRight+'x'+(mapBot-mapTop));
console.log('guna %: '+((mapRight*(mapBot-mapTop))/(W*H)*100).toFixed(1)+'%');

