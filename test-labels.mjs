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
      if(String(u).includes('version.json')) return {json:async()=>({v:'3bfc2b46'})};
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

console.log('=== UJI LAPISAN LABEL NOMBER ===');
const lbls = d.querySelectorAll('.lblnum');
console.log('  label pada default view (900m): '+lbls.length);
T('label dirender (>10)', lbls.length>10);
T('label dirender (>30)', lbls.length>30);

// semak setiap label: min-height 13px, ada backgroundImage
let okMin=0, okBg=0;
for(const el of lbls){
  const h=parseFloat(el.style.height);
  if(h>=13) okMin++;
  if(el.style.backgroundImage.includes('labels.png')) okBg++;
}
T('semua label >=13px tinggi', okMin===lbls.length);
T('semua label guna atlas', okBg===lbls.length);

// uji zoom jauh keluar: label kekal min 13px
for(let i=0;i<12;i++){ d.querySelector('#f-out').click(); await new Promise(r=>setTimeout(r,40)); }
await new Promise(r=>setTimeout(r,150));
const lbls2 = d.querySelectorAll('.lblnum');
let okMin2=0;
for(const el of lbls2){ if(parseFloat(el.style.height)>=13) okMin2++; }
console.log('  label pada zoom keluar penuh: '+lbls2.length+', min-height ok: '+okMin2);
T('label kekal >=13px pada zoom keluar', okMin2===lbls2.length && lbls2.length>0);

// zoom masuk penuh - label tidak timbul besar melampau
for(let i=0;i<30;i++){ d.querySelector('#f-in').click(); await new Promise(r=>setTimeout(r,30)); }
await new Promise(r=>setTimeout(r,150));
const lbls3 = d.querySelectorAll('.lblnum');
let maxH=0;
for(const el of lbls3){ maxH=Math.max(maxH, parseFloat(el.style.height)); }
console.log('  label pada zoom masuk penuh: '+lbls3.length+', maxH='+maxH);
T('label di-zoom-in tak melebihi 90px', maxH<=90);

console.log('');
console.log('KEPUTUSAN: '+pass+' lulus, '+fail+' gagal');
