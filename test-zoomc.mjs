import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html = fs.readFileSync('web-kerilla/index.html','utf8');
const meta = JSON.parse(fs.readFileSync('web-kerilla/map-meta.json','utf8'));
const dom = new JSDOM(html, { runScripts:'dangerously', url:'https://x.test/', pretendToBeVisual:true,
  beforeParse(w){
    w.HTMLCanvasElement.prototype.getContext=()=>null;
    Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 360;}});
    Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get(){return 780;}});
    Object.defineProperty(w,'localStorage',{value:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},configurable:true});
    Object.defineProperty(w,'sessionStorage',{value:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},configurable:true});
    w.fetch=async()=>({json:async()=>meta});
    w.matchMedia=()=>({matches:false});
  }});
const w=dom.window, d=w.document;
await new Promise(r=>setTimeout(r,300));
d.querySelector('#b-map').click();
await new Promise(r=>setTimeout(r,400));
const world=d.querySelector('#world');
const getK=()=>{ const m=world.style.transform.match(/scale\(([\d.]+)\)/); return m?parseFloat(m[1]):0; };

let pass=0, fail=0;
const T=(n,c)=>{ if(c){pass++;console.log('  PASS '+n);}else{fail++;console.log('  FAIL '+n);} };
console.log('=== UJIAN AKHIR PILIHAN C (urutan betul) ===');

w.fix({coords:{longitude:102.0934,latitude:5.6793,accuracy:15}},true);
await new Promise(r=>setTimeout(r,200));
const kDef=getK();
console.log('  k default selepas GPS: '+kDef.toFixed(3));
T('default zoom ~900m (k 0.95-1.25)', kDef>=0.95 && kDef<=1.25);
T('nombor task pada default ~'+Math.round(21*kDef)+'px', 21*kDef>=20);

for(let i=0;i<25;i++){ d.querySelector('#f-in').click(); await new Promise(r=>setTimeout(r,30)); }
const kMax=getK();
console.log('  maks zoom: k='+kMax.toFixed(1)+' (nombor ~'+Math.round(21*kMax)+'px)');
T('maks zoom 12', kMax>=11.9);

for(let i=0;i<40;i++){ d.querySelector('#f-out').click(); await new Promise(r=>setTimeout(r,30)); }
const lvlZ=w.eval('lvl(S.scale).z');
const L=meta.levels.find(l=>l.z===lvlZ);
const kOut=getK();
const petaW=L.width*kOut;
console.log('  zoom-out maks: z'+lvlZ+', peta '+Math.round(petaW)+'px lebar (skrin 360)');
T('peta mengecil bawah saiz skrin', petaW<360 || lvlZ<=1);

w.fix({coords:{longitude:102.0934,latitude:5.6793,accuracy:15}},true);
await new Promise(r=>setTimeout(r,200));
const kBack=getK();
T('GPS fix selepas zoom-out kembali ke ~900m', kBack>=0.95 && kBack<=1.25);
console.log('  k selepas GPS re-fix: '+kBack.toFixed(3));

console.log('');
console.log('KEPUTUSAN: '+pass+' lulus, '+fail+' gagal');
