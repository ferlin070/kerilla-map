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
      if(String(u).includes('version.json')) return {json:async()=>({v:'3647f730'})};
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

console.log('=== UJI LABEL (641 label, atlas 1024) ===');
console.log('  jumlah label dalam json:', labels.length);

const lbls = d.querySelectorAll('.lblnum');
console.log('  label dirender pada default view:', lbls.length);
T('label dirender (>100)', lbls.length>100);

let okMin=0, okBg=0;
for(const el of lbls){
  const h=parseFloat(el.style.height);
  if(h>=16) okMin++;
  if(el.style.backgroundImage.includes('labels.png')) okBg++;
}
T('semua label >=16px', okMin===lbls.length && lbls.length>0);
T('semua guna atlas', okBg===lbls.length);

// semak backgroundSize guna 1024 tinggi
if(lbls[0]){
  T('atlas 1024x1024', lbls[0].style.backgroundSize.includes('1024'));
}

// zoom keluar penuh - semua label kekal nampak
for(let i=0;i<15;i++){ d.querySelector('#f-out').click(); await new Promise(r=>setTimeout(r,40)); }
await new Promise(r=>setTimeout(r,150));
const lbls2 = d.querySelectorAll('.lblnum');
console.log('  label pada zoom keluar penuh:', lbls2.length);
T('label pada zoom keluar penuh (>400)', lbls2.length>400);

console.log('');
console.log('KEPUTUSAN: '+pass+' lulus, '+fail+' gagal');
