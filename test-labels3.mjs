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
      if(String(u).includes('version.json')) return {json:async()=>({v:'b866a636'})};
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

console.log('=== UJI LABEL DE-CLUTTER ===');
const lbls = d.querySelectorAll('.lblnum');
console.log('  label pada default view:', lbls.length);
T('label dirender (>50)', lbls.length>50);

let okMin=0;
for(const el of lbls){ if(parseFloat(el.style.height)>=14) okMin++; }
T('semua label >=14px', okMin===lbls.length && lbls.length>0);

// sahkan tiada tindih (de-clutter)
let overlap=0;
const rects=[];
for(const el of lbls){
  const L=parseFloat(el.style.left), T=parseFloat(el.style.top);
  const w2=parseFloat(el.style.width), h2=parseFloat(el.style.height);
  rects.push({L,T,w:w2,h:h2});
}
for(let i=0;i<rects.length;i++){
  for(let j=i+1;j<rects.length;j++){
    const a=rects[i], b=rects[j];
    if(a.L < b.L+b.w && a.L+a.w > b.L && a.T < b.T+b.h && a.T+a.h > b.T) overlap++;
  }
}
console.log('  pasangan label bertindih:', overlap);
T('tiada label bertindih (de-clutter)', overlap===0);

// zoom keluar penuh - label masih ada tapi de-cluttered
for(let i=0;i<15;i++){ d.querySelector('#f-out').click(); await new Promise(r=>setTimeout(r,40)); }
await new Promise(r=>setTimeout(r,150));
const lbls2 = d.querySelectorAll('.lblnum');
console.log('  label pada fitCover (de-clutter):', lbls2.length);
T('label fitCover tidak terlalu padat (<300)', lbls2.length<300);
T('label fitCover masih ada (>30)', lbls2.length>30);

console.log('');
console.log('KEPUTUSAN: '+pass+' lulus, '+fail+' gagal');
