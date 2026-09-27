import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html = fs.readFileSync('web-kerilla/index.html','utf8');
const meta = JSON.parse(fs.readFileSync('web-kerilla/map-meta.json','utf8'));
const dom = new JSDOM(html, { runScripts:'dangerously', url:'https://kerilla.nakhodacloud.top/', pretendToBeVisual:true,
  beforeParse(w){
    w.HTMLCanvasElement.prototype.getContext=()=>null;
    Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 360;}});
    Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get(){return 780;}});
    let store={};
    Object.defineProperty(w,'localStorage',{value:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}},configurable:true});
    let sess={};
    Object.defineProperty(w,'sessionStorage',{value:{getItem:k=>sess[k]??null,setItem:(k,v)=>{sess[k]=String(v);},removeItem:k=>{delete sess[k];}},configurable:true});
    w.fetch=async(u)=>{ 
      if(String(u).includes('version.json')) return {json:async()=>({v:'f86ea608'})};
      return {json:async()=>meta}; 
    };
    w.matchMedia=()=>({matches:false});
  }});
const w=dom.window, d=w.document;
await new Promise(r=>setTimeout(r,300));
d.querySelector('#b-map').click();
await new Promise(r=>setTimeout(r,400));

let pass=0, fail=0;
const T=(n,c)=>{ if(c){pass++;console.log('  PASS '+n);} else {fail++;console.log('  FAIL '+n);} };

console.log('=== UJI ZOOM-OUT ===');
const fit = Math.max(360/meta.width, 780/meta.height);
console.log('  fitCover = '+fit.toFixed(5));

// default scale selepas boot
let sc = w.S ? w.S.scale : null;
console.log('  skala awal: '+sc);
// boot mungkin tak set S di window - guna butang minus & periksa transform world
const world = d.querySelector('#world');
const getScale = ()=>{ const m=world.style.transform.match(/scale\(([\d.]+)\)/); return m?parseFloat(m[1]):0; };
// tapi transform scale adalah k = S.scale*sc(level) - relative. Kita ukur transform berturutan.
const before = getScale();
console.log('  transform scale awal: '+before);
// klik minus 6 kali
for(let i=0;i<6;i++){ d.querySelector('#f-out').click(); await new Promise(r=>setTimeout(r,80)); }
const after = getScale();
console.log('  transform scale selepas 6x minus: '+after);
T('zoom-out menujejaskan skala (transform berubah)', after < before);
console.log('  nisbah after/before = '+(after/before).toFixed(4)+' (patut ~0.40 = 0.4 fitCover had)');

// zoom balik in - mesti berfungsi juga
for(let i=0;i<4;i++){ d.querySelector('#f-in').click(); await new Promise(r=>setTimeout(r,80)); }
const afterIn = getScale();
T('zoom-in berfungsi balik', afterIn > after);
console.log('');
console.log('KEPUTUSAN: '+pass+' lulus, '+fail+' gagal');
