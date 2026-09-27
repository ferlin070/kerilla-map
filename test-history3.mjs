import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('web-kerilla/index.html','utf8');
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  url: 'https://kerilla.nakhodacloud.top/',
  pretendToBeVisual: true,
  beforeParse(w){
    w.HTMLCanvasElement.prototype.getContext = () => null;
    Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 390;}});
    Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get(){return 780;}});
    let store = {};
    const LS = {
      getItem:k=>store[k]??null,
      setItem:(k,v)=>{store[k]=String(v);},
      removeItem:k=>{delete store[k];},
      clear:()=>{store={};},
      key:i=>Object.keys(store)[i]??null,
      get length(){return Object.keys(store).length;}
    };
    Object.defineProperty(w, 'localStorage', {value: LS, configurable: true});
    let sess = {};
    const SS = {
      getItem:k=>sess[k]??null,
      setItem:(k,v)=>{sess[k]=String(v);},
      removeItem:k=>{delete sess[k];}
    };
    Object.defineProperty(w, 'sessionStorage', {value: SS, configurable: true});
    w.fetch = async (u)=>{
      if(String(u).includes('version.json')) return {json:async()=>({v:'744dc1ec'})};
      if(String(u).includes('map-meta.json')) return {json:async()=>JSON.parse(fs.readFileSync('web-kerilla/map-meta.json','utf8'))};
      return {json:async()=>({}),ok:true};
    };
    w.matchMedia = w.matchMedia || (()=>({matches:false,addListener(){},removeListener(){}}));
  }
});

const w = dom.window, d = w.document;
await new Promise(r=>setTimeout(r,300));

let pass=0, fail=0;
const T=(name,cond)=>{ if(cond){pass++; console.log('  PASS '+name);} else {fail++; console.log('  FAIL '+name);} };

console.log('=== UJIAN ALIRAN PENUH SEJARAH ===');
// 1. Klik nav "Lagi" (data-nv="more"? atau id)
const moreNav = d.querySelector('[data-nv="more"]') || d.querySelector('.nv:last-child');
if(moreNav){ moreNav.click(); await new Promise(r=>setTimeout(r,150)); }
const histBtn = d.querySelector('[data-o="hist"]');
T('item Sejarah muncul selepas buka Lagi', !!histBtn);
if(histBtn){
  histBtn.click();
  await new Promise(r=>setTimeout(r,150));
  T('sheet Sejarah terbuka', d.querySelector('#sht') && d.querySelector('#sht').textContent==='Sejarah');
  T('tiada rekod message', d.body.textContent.includes('Tiada rekod') || d.body.textContent.includes('Sejarah Trek'));
  // simpan 2 trek melalui API, kemudian buka semula
  w.histSave({type:'track',name:'Trek A',pts:[{lon:102.1,lat:5.7,t:1},{lon:102.11,lat:5.71,t:2}],n:2,d:1500,s:100,spd:54});
  w.histSave({type:'track',name:'Trek B',pts:[{lon:102.2,lat:5.8,t:3},{lon:102.21,lat:5.81,t:4}],n:2,d:2200,s:120,spd:66});
  w.histSheet();
  await new Promise(r=>setTimeout(r,150));
  const rows = d.querySelectorAll('.hrow');
  T('2 baris trek dipaparkan', rows.length===2);
  const gpxBtn = d.querySelector('[data-act="gpx"]');
  T('butang GPX ada', !!gpxBtn);
  const loadBtn = d.querySelector('[data-act="load"]');
  T('butang muat ada', !!loadBtn);
  const delBtn = d.querySelector('[data-act="del"]');
  T('butang buang ada', !!delBtn);
  // uji buang
  if(delBtn){ delBtn.click(); await new Promise(r=>setTimeout(r,150));
    T('selepas buang: 1 rekod', w.histLoad().length===1);
  }
}

// 2. uji pin persist melalui klik sebenar
const pinNav = d.querySelector('[data-nv="pin"]');
if(pinNav){
  pinNav.click();
  await new Promise(r=>setTimeout(r,100));
  // semak mode aktif
  T('pin mode aktif', pinNav.classList.contains('on'));
  const map=d.querySelector('#map');
  // tap di peta
  map.dispatchEvent(new w.PointerEvent('pointerdown',{clientX:200,clientY:300,bubbles:true,pointerId:1}));
  map.dispatchEvent(new w.PointerEvent('pointerup',{clientX:200,clientY:300,bubbles:true,pointerId:1}));
  await new Promise(r=>setTimeout(r,250));
  const saved=w.localStorage.getItem('kerilla.pins');
  T('pin tersimpan dalam localStorage', saved!==null && JSON.parse(saved).length>=1);
}

console.log('');
console.log('KEPUTUSAN: '+pass+' lulus, '+fail+' gagal');
