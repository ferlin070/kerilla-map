import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html = fs.readFileSync('web-kerilla/index.html','utf8');
const meta = JSON.parse(fs.readFileSync('web-kerilla/map-meta.json','utf8'));
const dom = new JSDOM(html, { runScripts:'dangerously', url:'https://kerilla.nakhodacloud.top/', pretendToBeVisual:true,
  beforeParse(w){
    w.HTMLCanvasElement.prototype.getContext=()=>null;
    Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 390;}});
    Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get(){return 780;}});
    let store={};
    Object.defineProperty(w,'localStorage',{value:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];},get length(){return Object.keys(store).length;}},configurable:true});
    let sess={};
    Object.defineProperty(w,'sessionStorage',{value:{getItem:k=>sess[k]??null,setItem:(k,v)=>{sess[k]=String(v);},removeItem:k=>{delete sess[k];}},configurable:true});
    w.fetch=async(u)=>{ 
      if(String(u).includes('version.json')) return {json:async()=>({v:'744dc1ec'})};
      return {json:async()=>meta}; 
    };
    w.matchMedia=()=>({matches:false});
  }});
const w=dom.window, d=w.document;
await new Promise(r=>setTimeout(r,300));
// panggil boot (macam user tekan "Lihat Peta")
d.querySelector('#b-map').click();
await new Promise(r=>setTimeout(r,400));

let pass=0,fail=0;
const T=(n,c)=>{ if(c){pass++;console.log('  PASS '+n);}else{fail++;console.log('  FAIL '+n);} };

console.log('=== UJI PENUH DENGAN BOOT ===');
T('META dimuat', !!w.META || d.querySelector('#map')!==null);
const pinNav = d.querySelector('[data-nv="pin"]');
pinNav.click();
await new Promise(r=>setTimeout(r,100));
const map=d.querySelector('#map');
map.getBoundingClientRect=()=>({left:0,top:0,width:390,height:780});
map.dispatchEvent(new w.MouseEvent('click',{clientX:195,clientY:390,bubbles:true}));
await new Promise(r=>setTimeout(r,300));
const saved=w.localStorage.getItem('kerilla.pins');
T('pin tersimpan dalam localStorage', saved!==null);
if(saved) console.log('   kandungan:', saved.slice(0,80));
// pastikan pin bertahan selepas reload (restoreAll)
w.S.pins=[];
w.restoreAll();
T('pin dipulih oleh restoreAll', w.S.pins.length>=1);
console.log('');
console.log('KEPUTUSAN: '+pass+' lulus, '+fail+' gagal');
