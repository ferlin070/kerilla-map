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
    Object.defineProperty(w,'localStorage',{value:JSON.parse(JSON.stringify({getItem:()=>null,setItem:()=>{},removeItem:()=>{}})),configurable:true});
    Object.defineProperty(w,'sessionStorage',{value:JSON.parse(JSON.stringify({getItem:()=>null,setItem:()=>{},removeItem:()=>{}})),configurable:true});
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

// Gerak ke kawasan padat nombor: pusatkan ke (1700,1200) kemudian uji pelbagai zoom
console.log('=== UJI PADA JULAT ZOOM REALISTIK ===');
// zoom keluar sedikit dari default supaya nampak kawasan luas berlabel
for(let i=0;i<3;i++){ d.querySelector('#f-out').click(); await new Promise(r=>setTimeout(r,40)); }
await new Promise(r=>setTimeout(r,150));
const nWide=d.querySelectorAll('.lblnum').length;
console.log('  zoom keluar 3x: '+nWide+' label, scale='+w.eval('S.scale').toFixed(3));
T('zoom luas: label muncul (>50)', nWide>50);

// sekarang zoom MASUK sedikit-sedikit, label TIDAK boleh hilang (maxh fix)
let ok=true;
for(let i=0;i<8;i++){
  d.querySelector('#f-in').click(); await new Promise(r=>setTimeout(r,50));
  const n=d.querySelectorAll('.lblnum').length;
  const sc=w.eval('S.scale');
  // pada julat scale 0.3-4, mesti ada label (kawasan padat)
  if(sc>0.25 && sc<5 && n===0){ ok=false; console.log('    HILANG pada scale='+sc.toFixed(2)); }
}
T('label tidak hilang pada julat zoom 0.25-5', ok);

// semak saiz label pada zoom sederhana: min 14px
d.querySelector('#f-out').click(); await new Promise(r=>setTimeout(r,60));
const lbls=d.querySelectorAll('.lblnum');
let okH=true;
for(const el of lbls){ if(parseFloat(el.style.height)<13.5) okH=false; }
T('semua label >=14px', okH && lbls.length>0);

console.log('');
console.log('KEPUTUSAN: '+pass+' lulus, '+fail+' gagal');
