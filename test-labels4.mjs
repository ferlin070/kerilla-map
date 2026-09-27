import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html = fs.readFileSync('web-kerilla/index.html','utf8');
const meta = JSON.parse(fs.readFileSync('web-kerilla/map-meta.json','utf8'));
const labels = JSON.parse(fs.readFileSync('web-kerilla/labels.json','utf8'));
const dom = new JSDOM(html, { runScripts:'dangerously', url:'https://x.test/', pretendToBeVisual:true,
  beforeParse(w){
    w.HTMLCanvasElement.prototype.getContext=()=>null;
    Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 360;}});
    Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get(){return 780;}});
    Object.defineProperty(w,'localStorage',{value:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},configurable:true});
    Object.defineProperty(w,'sessionStorage',{value:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},configurable:true});
    w.fetch=async(u)=>{
      if(String(u).includes('version.json')) return {json:async()=>({v:'12cc762b'})};
      if(String(u).includes('labels.json')) return {json:async()=>labels};
      return {json:async()=>meta};
    };
    w.matchMedia=()=>({matches:false});
  }});
const w=dom.window, d=w.document;
await new Promise(r=>setTimeout(r,400));
d.querySelector('#b-map').click();
await new Promise(r=>setTimeout(r,500));
let pass=0, fail=0;
const T=(n,c)=>{ if(c){pass++;console.log('  PASS '+n);}else{fail++;console.log('  FAIL '+n);} };

console.log('=== UJI FIX NOMBOR KECIL ===');
T('label pada default view (>50)', d.querySelectorAll('.lblnum').length>50);

// Zoom dalam perlahan-lahan, semak label TIDAK hilang (punca maxh)
let prev=0, dropped=false;
for(let i=0;i<20;i++){
  d.querySelector('#f-in').click(); await new Promise(r=>setTimeout(r,40));
  const n=d.querySelectorAll('.lblnum').length;
  if(i===8 && n===0) dropped=true;
}
await new Promise(r=>setTimeout(r,150));
const nIn=d.querySelectorAll('.lblnum').length;
console.log('  label pada zoom dalam penuh: '+nIn);
T('label TIDAK dibuang pada zoom dalam (>0)', nIn>0);

// zoom keluar penuh: label muncul (de-clutter 35% lebih toleran)
for(let i=0;i<40;i++){ d.querySelector('#f-out').click(); await new Promise(r=>setTimeout(r,30)); }
await new Promise(r=>setTimeout(r,150));
const nOut=d.querySelectorAll('.lblnum').length;
console.log('  label pada zoom keluar penuh: '+nOut);
T('label pada zoom keluar penuh (>30)', nOut>30);
T('label zoom keluar tidak melampau (<400)', nOut<400);

console.log('');
console.log('KEPUTUSAN: '+pass+' lulus, '+fail+' gagal');
