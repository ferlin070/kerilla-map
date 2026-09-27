import fs from 'node:fs';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';

const meta = JSON.parse(fs.readFileSync('web-kerilla/map-meta.json','utf8'));
const W = meta.width, H = meta.height;

// Muat imej peta resolusi rendah (z0) sebagai asas visual
const z0 = PNG.sync.read(fs.readFileSync('web-kerilla/tiles/0/0_0.png'));

const VW = 390, VH = 844;   // iPhone 14

function makeFrame(kind) {
  const out = new PNG({ width: VW, height: VH });
  // warna cream = #f3efe4 (ini yang user nampak sebagai "ruang kosong")
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i]   = 0xf3;
    out.data[i+1] = 0xef;
    out.data[i+2] = 0xe4;
    out.data[i+3] = 255;
  }

  let scale, cx, cy;
  if (kind === 'before') {          // fitWidth (LAMA)
    scale = VW / W;
    cx = W/2; cy = H/2;
  } else {                          // fitCover (BARU)
    scale = Math.max(VW/W, VH/H);
    cx = W/2; cy = H/2;
  }

  const left = cx - VW/2/scale, top = cy - VH/2/scale;
  const right = left + VW/scale, bottom = top + VH/scale;

  // sampel z0 bagi setiap piksel skrin
  const z0ScaleX = z0.width / W, z0ScaleY = z0.height / H;
  for (let y = 0; y < VH; y++) {
    for (let x = 0; x < VW; x++) {
      const px = left + x/scale, py = top + y/scale;
      if (px < 0 || py < 0 || px >= W || py >= H) continue;
      const sx = Math.min(z0.width-1, Math.floor(px*z0ScaleX));
      const sy = Math.min(z0.height-1, Math.floor(py*z0ScaleY));
      const si = (sy*z0.width+sx)*4, di = (y*VW+x)*4;
      out.data[di]=z0.data[si]; out.data[di+1]=z0.data[si+1];
      out.data[di+2]=z0.data[si+2]; out.data[di+3]=255;
    }
  }

  // header (forest #1f4d3f)
  for (let y=0; y<52; y++) for (let x=0; x<VW; x++) {
    const di=(y*VW+x)*4;
    out.data[di]=0x1f; out.data[di+1]=0x4d; out.data[di+2]=0x3f;
  }
  // bottom nav (paper #fbfaf6)
  for (let y=VH-62; y<VH; y++) for (let x=0; x<VW; x++) {
    const di=(y*VW+x)*4;
    out.data[di]=0xfb; out.data[di+1]=0xfa; out.data[di+2]=0xf6;
  }

  return out;
}

const before = makeFrame('before');
const after  = makeFrame('after');

fs.writeFileSync('web-kerilla/proof-before.png', PNG.sync.write(before));
fs.writeFileSync('web-kerilla/proof-after.png',  PNG.sync.write(after));

// Buat imej sebelah-sebelah dengan pemisah
const GAP = 24;
const combo = new PNG({ width: VW*2+GAP, height: VH });
for (let i=0;i<combo.data.length;i+=4){ combo.data[i]=0x16; combo.data[i+1]=0x24; combo.data[i+2]=0x1f; combo.data[i+3]=255; }
function blit(src, ox) {
  for (let y=0;y<VH;y++) for (let x=0;x<VW;x++) {
    const si=(y*VW+x)*4, di=(y*combo.width+(x+ox))*4;
    combo.data[di]=src.data[si]; combo.data[di+1]=src.data[si+1];
    combo.data[di+2]=src.data[si+2]; combo.data[di+3]=255;
  }
}
blit(before, 0); blit(after, VW+GAP);
fs.writeFileSync('web-kerilla/proof-compare.png', PNG.sync.write(combo));

// Kira statistik cream
function creamPct(png) {
  let n=0;
  for (let y=53; y<VH-62; y++) for (let x=0;x<VW;x++) {
    const i=(y*VW+x)*4;
    if (png.data[i]===0xf3 && png.data[i+1]===0xef && png.data[i+2]===0xe4) n++;
  }
  return (n/((VH-115)*VW)*100);
}
console.log('iPhone 14 ('+VW+'x'+VH+')');
console.log('');
console.log('  SEBELUM (fitWidth) : cream dalam kawasan peta = '+creamPct(before).toFixed(1)+'%');
console.log('  SELEPAS (fitCover) : cream dalam kawasan peta = '+creamPct(after).toFixed(1)+'%');
console.log('');
console.log('  fail dijana:');
console.log('    proof-before.png   (sebelum)');
console.log('    proof-after.png    (selepas)');
console.log('    proof-compare.png  (sebelah-sebelah)');
console.log('');
console.log('  saiz: before='+(fs.statSync('web-kerilla/proof-before.png').size/1024).toFixed(1)+'KB'+
            '  after='+(fs.statSync('web-kerilla/proof-after.png').size/1024).toFixed(1)+'KB');
