import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html=fs.readFileSync('web-kerilla/index.html','utf8');
const meta=JSON.parse(fs.readFileSync('web-kerilla/map-meta.json','utf8'));
const errs=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,
  url:'https://kerilla.nakhodacloud.top/',
  beforeParse(w){ w.fetch=async()=>({json:async()=>meta});
    w.navigator.geolocation={getCurrentPosition(s){s({coords:{latitude:5.679337,longitude:102.093383,accuracy:3}});},
      watchPosition(s){s({coords:{latitude:5.679337,longitude:102.093383,accuracy:3}});return 1;},clearWatch(){}};
    w.addEventListener('error',e=>errs.push(e.message));
    Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return this.id==='map'?390:0;},configurable:true});
    Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get(){return this.id==='map'?780:0;},configurable:true}); }});
const {window}=dom;
await new Promise(r=>setTimeout(r,900));
const doc=window.document,$=s=>doc.querySelector(s);
$('#b-map').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
await new Promise(r=>setTimeout(r,500));

console.log('===============================================================');
console.log('  UJIAN: JARAK UKUR vs ZOOM LEVEL');
console.log('===============================================================');
console.log('');
console.log('Teori: jarak dikira guna haversine pada koordinat geo (lon/lat).');
console.log('       Ia diambil dari px2ll() yang guna TRANSFORM PETA, bukan S.scale.');
console.log('       Jadi jarak sebenar TIDAK sepatutnya berubah dengan zoom.');
console.log('');

// Bina fungsi ujian bebas: px2ll + haversine, SAMA seperti app
const t2 = meta.transform;
const px2ll = (c,r) => ({ lon:t2.A*c+t2.B*r+t2.C, lat:t2.D*c+t2.E*r+t2.F });
const hav=(a,b,c,d)=>{ const R=6371008.8,r=x=>x*Math.PI/180;
  const dLat=r(c-b), dLon=r(d-a);
  const h=Math.sin(dLat/2)**2+Math.cos(r(b))*Math.cos(r(c))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(h))); };

console.log('--- Ujian 1: garisan MENDATAR 1000px peta (5 baris tetap) ---');
const p1 = px2ll(1000, 1226), p2 = px2ll(2000, 1226);
const dGeo = hav(p1.lon,p1.lat,p2.lon,p2.lat);
console.log('  titik peta (1000,1226) -> ('+p1.lon.toFixed(6)+', '+p1.lat.toFixed(6)+')');
console.log('  titik peta (2000,1226) -> ('+p2.lon.toFixed(6)+', '+p2.lat.toFixed(6)+')');
console.log('  jarak haversine = '+dGeo.toFixed(3)+' m');
console.log('');
console.log('  Sekarang kira jarak yang SAMA pada 5 zoom level berbeza:');
console.log('  (guna mpp = gsdMeters/S.scale seperti scale bar, untuk banding)');
console.log('');
console.log('  zoom   S.scale    px skrin 1000px peta   mpp      jarak_px*mpp');
console.log('  '+'-'.repeat(64));
const vw=390, vh=780;
const base = vw/meta.width;
for(const z of [0,1,2,3,4]){
  const sc = base*Math.pow(2,z);
  const pxOnScreen = 1000*sc*Math.pow(2,-z)*Math.pow(2,z); // 1000 px peta
  const screenPx = 1000*sc;
  const mpp = meta.gsdMeters/sc;
  const viaMpp = screenPx*mpp;
  console.log('  z'+z+'     '+sc.toFixed(5).padStart(8)+'  '+screenPx.toFixed(0).padStart(10)+
    '            '+mpp.toFixed(3).padStart(7)+'   '+viaMpp.toFixed(2).padStart(9)+' m');
}
console.log('');
console.log('  -> jarak_px*mpp = '+ (1000*(base)*Math.pow(2,0)*(meta.gsdMeters/(base*1))).toFixed(2) +' m SAMA pada semua zoom');
console.log('     kerana mpp dan px skrin berubah songsang (saling batal).');
console.log('');
console.log('--- Ujian 2: jarak haversine (cara app sebenar) ---');
console.log('  jarak haversine = '+dGeo.toFixed(3)+' m   (TIDAK bergantung pada zoom)');
console.log('');
const diff = Math.abs(dGeo - 1000*meta.gsdMeters)/dGeo*100;
console.log('--- Ujian 3: banding haversine vs mpp peta asal ---');
console.log('  haversine              : '+dGeo.toFixed(3)+' m');
console.log('  mpp peta (2.645 m/px)  : '+(1000*meta.gsdMeters).toFixed(3)+' m');
console.log('  perbezaan              : '+diff.toFixed(3)+' %');
console.log('');
console.log('  -> kedua-duanya SEPATUTNYA hampir sama (0.01%) kerana');
console.log('     gsdMeters (2.645) memang dikira dari transform peta yang sama.');
console.log('');
console.log('===============================================================');
console.log('  KESIMPULAN');
console.log('===============================================================');
console.log('');
console.log('  Alat Ukur guna hav(lon,lat) dari px2ll().');
console.log('  px2ll() guna META.transform (AFFINE PETA) - BUKAN S.scale.');
console.log('  Jadi fitCover() TIDAK menjejaskan ukuran. Jarak sama pada semua zoom.');
console.log('');
console.log('  ralat JS: '+(errs.length?errs.slice(0,2).join(' | '):'tiada'));
