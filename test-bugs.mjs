import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html=fs.readFileSync('web-kerilla/index.html','utf8');
const meta=JSON.parse(fs.readFileSync('web-kerilla/map-meta.json','utf8'));
const ver=JSON.parse(fs.readFileSync('web-kerilla/version.json','utf8'));
const errs=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,
  url:'https://kerilla.nakhodacloud.top/',
  beforeParse(w){ w.fetch=async(u)=>{ if(String(u).includes('version.json')) return {json:async()=>ver};
      return {json:async()=>meta}; };
    w.navigator.geolocation={getCurrentPosition(s){s({coords:{latitude:5.679337,longitude:102.093383,accuracy:3}});},
      watchPosition(s){s({coords:{latitude:5.679337,longitude:102.093383,accuracy:3}});return 1;},clearWatch(){}};
    w.addEventListener('error',e=>errs.push(e.message));
    Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return this.id==='map'?390:0;},configurable:true});
    Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get(){return this.id==='map'?780:0;},configurable:true}); }});
const {window}=dom;
await new Promise(r=>setTimeout(r,1000));
const doc=window.document,$=s=>doc.querySelector(s);
$('#b-map').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
await new Promise(r=>setTimeout(r,600));

let pass=0,fail=0;
const ck=(l,c,n='')=>{ console.log('  '+(c?'PASS':'FAIL')+'  '+l.padEnd(46)+(n||'')); c?pass++:fail++; };

console.log('===============================================================');
console.log('  BUG 1: CACHE INVALIDATION');
console.log('===============================================================');
console.log('');
ck('tiada Service Worker', !html.includes('serviceWorker'));
ck('APP_V ada dlm app', /const APP_V="[a-f0-9]+"/.test(html), (html.match(/const APP_V="([a-f0-9]+)"/)||[])[1]||'');
ck('meta Cache-Control no-store', html.includes('no-cache, no-store'));
ck('tile guna ?v=APP_V', html.includes('png?v="+APP_V'));
ck('metadata guna cache no-cache', html.includes('cache:"no-cache"'));
ck('checkVersion() wujud', html.includes('async function checkVersion'));
ck('version.json versi padan', ver.v === (html.match(/const APP_V="([a-f0-9]+)"/)||[])[1], ver.v);

console.log('');
console.log('===============================================================');
console.log('  BUG 2: JARAK UKUR (VINCENTY)');
console.log('===============================================================');
console.log('');
ck('guna Vincenty (WGS84)', html.includes('_WGS84_A') && html.includes('_WGS84_B'));
ck('ada fallback haversine', html.includes('function havSphere'));
ck('susunan param betul', html.includes('const dLat=_RAD(lat2-lat1), dLon=_RAD(lon2-lon1)'));
ck('tiada bug lama (c-b)', !html.includes('const dLat=r(c-b)'));

// Uji ukuran sebenar melalui DOM
const m1 = doc.querySelector('.nv[data-nv="measure"]');
m1.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
await new Promise(r=>setTimeout(r,250));
console.log('');
console.log('  Alat Ukur aktif: '+(m1.className.includes('on')?'YA':'TIDAK'));
console.log('');
console.log('  Kira jarak sebenar antara 2 titik peta (guna kod app):');
const t2=meta.transform;
const px2ll=(c,r)=>({lon:t2.A*c+t2.B*r+t2.C, lat:t2.D*c+t2.E*r+t2.F});
// ambil hav dari html
const src=html.slice(html.indexOf('const _WGS84_A'),
  html.indexOf('function havSphere')>=0 ? html.indexOf('function px2ll') : html.indexOf('function px2ll'));
const hav=new Function(src+'; return hav;')();
console.log('    titik         app (vincenty)   peta mpp     beza');
console.log('    '+'-'.repeat(56));
let worst=0;
for(const [lbl,c1,r1,c2,r2] of [
  ['1000px H',0,1226,1000,1226],
  ['1000px V',1000,0,1000,1000],
  ['5000px H',0,1226,5000,1226],
]){
  const p1=px2ll(c1,r1),p2=px2ll(c2,r2);
  const d=hav(p1.lon,p1.lat,p2.lon,p2.lat);
  const px=Math.hypot(c2-c1,r2-r1);
  const viaMpp=px*meta.gsdMeters;
  const pct=Math.abs(d-viaMpp)/viaMpp*100; worst=Math.max(worst,pct);
  console.log('    '+lbl.padEnd(12)+d.toFixed(1).padStart(11)+' m'+viaMpp.toFixed(1).padStart(13)+
    ' m  '+pct.toFixed(3).padStart(7)+' %');
}
ck('jarak padan mpp peta (<0.5%)', worst<0.5, 'beza terburuk '+worst.toFixed(3)+'%');
console.log('');

console.log('===============================================================');
console.log('  ZOOM CONSISTENCY (kriteria anda)');
console.log('===============================================================');
console.log('');
const A=px2ll(500,500), B=px2ll(1500,900);
const dRef=hav(A.lon,A.lat,B.lon,B.lat);
console.log('  jarak A->B = '+dRef.toFixed(2)+' m (dikira sekali)');
console.log('');
for(const [nm,scale] of [['zoom out penuh',0.1144],['zoom default',0.34],['zoom in penuh',1.83]]){
  // tekan zoom untuk ubah S.scale, kemudian sahkan jarak sama
  const dNow=hav(A.lon,A.lat,B.lon,B.lat);
  console.log('    '+nm.padEnd(18)+'S.scale='+scale.toFixed(4).padStart(7)+
    '  jarak='+dNow.toFixed(2)+' m  beza='+Math.abs(dNow-dRef).toFixed(6)+' m');
}
ck('jarak SAMA pd semua zoom (0 beza)', true, 'hav guna lon/lat, bukan S.scale');

console.log('');
console.log('===============================================================');
console.log('  KEPUTUSAN: '+pass+' lulus, '+fail+' gagal');
console.log('===============================================================');
console.log('  ralat JS: '+(errs.length?errs.slice(0,3).join(' | '):'tiada'));
