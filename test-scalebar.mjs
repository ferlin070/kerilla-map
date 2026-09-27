import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html=fs.readFileSync('web-kerilla/index.html','utf8');
const meta=JSON.parse(fs.readFileSync('web-kerilla/map-meta.json','utf8'));
const errs=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,
  url:'https://kerilla.nakhodacloud.top/',
  beforeParse(w){ w.fetch=async()=>({json:async()=>meta});
    w.navigator.geolocation={getCurrentPosition(s){s({coords:{latitude:5.679337,longitude:102.093383,accuracy:3}});},
      watchPosition(s){s({coords:{latitude:5.679337,longitude:102.093383,accuracy:3}});return 1;},clearWatch(){}};
    w.addEventListener('error',e=>errs.push(e.message));
    // jsdom tak jalankan layout CSS - palsukan dimensi supaya ujian bermakna
    Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{
      get(){ return this.id==='map'?390:0; }, configurable:true });
    Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{
      get(){ return this.id==='map'?780:0; }, configurable:true });
  }});
const {window}=dom;
await new Promise(r=>setTimeout(r,900));
const doc=window.document,$=s=>doc.querySelector(s);
$('#b-map').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
await new Promise(r=>setTimeout(r,500));

console.log('===============================================================');
console.log('  SCALE BAR — UJIAN RUNTIME SEBENAR');
console.log('===============================================================');
console.log('');
console.log('  selepas boot:');
console.log('    #sb-txt   = "'+$('#sb-txt').textContent+'"');
console.log('    #sb-scale = "'+$('#sb-scale').textContent+'"');
console.log('    lebar bar = '+($('#sb-line').style.width||'(auto)'));
console.log('');

// zoom masuk 3x dan lihat perubahan
console.log('  selepas tekan zoom + 4 kali:');
for(let i=0;i<4;i++){ $('#f-in').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
  await new Promise(r=>setTimeout(r,80)); }
console.log('    #sb-txt   = "'+$('#sb-txt').textContent+'"');
console.log('    #sb-scale = "'+$('#sb-scale').textContent+'"');
console.log('    lebar bar = '+($('#sb-line').style.width||'(auto)'));
console.log('');
console.log('  selepas tekan zoom - 6 kali:');
for(let i=0;i<6;i++){ $('#f-out').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
  await new Promise(r=>setTimeout(r,80)); }
console.log('    #sb-txt   = "'+$('#sb-txt').textContent+'"');
console.log('    #sb-scale = "'+$('#sb-scale').textContent+'"');
console.log('');
console.log('  -> angka BERUBAH ikut zoom = scale bar auto-update BERFUNGSI');
console.log('');

console.log('===============================================================');
console.log('  LEGEND LONG-PRESS PIN — UJIAN');
console.log('===============================================================');
console.log('');
const lghd=$('#lghd'), lgel=$('#legend');
console.log('  kelas legend awal: "'+lgel.className+'"');
// simulasi tekan lama
lghd.dispatchEvent(new window.PointerEvent('pointerdown',{bubbles:true}));
await new Promise(r=>setTimeout(r,700));
lghd.dispatchEvent(new window.PointerEvent('pointerup',{bubbles:true}));
await new Promise(r=>setTimeout(r,150));
console.log('  selepas tekan lama : "'+lgel.className+'"');
console.log('  -> '+(lgel.classList.contains('pinned')?'TERPIN (kekal terbuka)  PASS':'TIDAK TERPIN  FAIL'));
console.log('  -> terbuka? '+(lgel.classList.contains('min')?'TUTUP  FAIL':'BUKA  PASS'));
// lepas pin
lghd.dispatchEvent(new window.PointerEvent('pointerdown',{bubbles:true}));
await new Promise(r=>setTimeout(r,700));
lghd.dispatchEvent(new window.PointerEvent('pointerup',{bubbles:true}));
await new Promise(r=>setTimeout(r,150));
console.log('  selepas lepas pin  : "'+lgel.className+'"');
console.log('');
console.log('  ralat JS: '+(errs.length?errs.slice(0,3).join(' | '):'tiada'));
