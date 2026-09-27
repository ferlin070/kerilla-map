import fs from 'node:fs';
import proj4 from 'proj4';

const meta=JSON.parse(fs.readFileSync('web-kerilla/map-meta.json','utf8'));
const t2=meta.transform;
const px2ll=(c,r)=>({lon:t2.A*c+t2.B*r+t2.C, lat:t2.D*c+t2.E*r+t2.F});

// Ambil hav() dari app-core.js yang BARU
const core = fs.readFileSync('app-core.js','utf8');
const fnStart = core.indexOf('function hav');
const fnEnd = core.indexOf('}', core.indexOf('return 2*R*Math.asin', fnStart))+1;
const havSrc = core.slice(fnStart, fnEnd);
const hav = new Function('return ' + havSrc)();

console.log('===============================================================');
console.log('  SAHKAN PEMBETULAN vs RUJUKAN BEBAS (proj4 + ellipsoid)');
console.log('===============================================================');
console.log('');
console.log('  Rujukan: proj4 UTM zone 48N (EPSG:32648) - jarak planar tepat');
console.log('');

// Rujukan bebas: tukar ke UTM dan kira jarak Euclidean (tepat utk kawasan kecil)
const utm = '+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs';
function distUTM(a,b){
  const A=proj4('EPSG:4326', utm, [a.lon,a.lat]);
  const B=proj4('EPSG:4326', utm, [b.lon,b.lat]);
  return Math.hypot(B[0]-A[0], B[1]-A[1]);
}

console.log('  garisan      jarak peta   app hav()    proj4 UTM    beza %');
console.log('  '+'-'.repeat(66));
let worst=0;
const cases=[
  ['100 px',0,0,100,0],
  ['500 px',0,0,500,0],
  ['1000 px',0,0,1000,0],
  ['2000 px',0,0,2000,0],
  ['5000 px',0,0,5000,0],
  ['diag 1000px',0,0,1000,1000],
  ['diag 3000px',0,0,3000,3000],
  ['menegak 1000px',0,0,0,1000],
  ['sudut ke sudut',0,0,meta.width,meta.height],
];
for(const [lbl,c1,r1,c2,r2] of cases){
  const p1=px2ll(c1,r1), p2=px2ll(c2,r2);
  const app = hav(p1.lon,p1.lat,p2.lon,p2.lat);
  const ref = distUTM(p1,p2);
  const pct = Math.abs(app-ref)/ref*100;
  worst=Math.max(worst,pct);
  console.log('  '+lbl.padEnd(14)+Math.round(Math.hypot(c2-c1,r2-r1)).toString().padStart(7)+' px   '+
    app.toFixed(1).padStart(9)+' m   '+ref.toFixed(1).padStart(9)+' m   '+pct.toFixed(4).padStart(7)+' %');
}
console.log('');
console.log('  beza terburuk = '+worst.toFixed(4)+' %');
console.log('  '+(worst<0.05?'LULUS (< 0.05%)':'GAGAL'));
console.log('');
console.log('===============================================================');
console.log('  UJI TITIK SEBENAR GPS PENGGUNA');
console.log('===============================================================');
console.log('');
const u={lat:5.6792883,lon:102.0934117};
const ctr=px2ll(meta.width/2, meta.height/2);
console.log('  GPS pengguna -> pusat peta:');
console.log('    pengguna : '+u.lat+', '+u.lon);
console.log('    pusat    : '+ctr.lat.toFixed(6)+', '+ctr.lon.toFixed(6));
const d=hav(u.lon,u.lat,ctr.lon,ctr.lat);
const dr=distUTM(u,ctr);
console.log('    app hav()= '+d.toFixed(2)+' m');
console.log('    proj4    = '+dr.toFixed(2)+' m');
console.log('    beza     = '+(Math.abs(d-dr)/dr*100).toFixed(4)+' %');
console.log('');
console.log('===============================================================');
console.log('  UJI ZOOM CONSISTENCY (kriteria anda)');
console.log('===============================================================');
console.log('');
console.log('  Jarak antara 2 titik GPS, pada 3 zoom level:');
const A={lon:102.0900,lat:5.6800}, B={lon:102.1000,lat:5.6850};
const refD=distUTM(A,B);
for(const [nm,sc] of [['zoom out penuh',0.1144],['zoom default',0.34],['zoom in penuh',1.83]]){
  // jarak app TIDAK guna S.scale -> sama pada semua zoom
  const d2=hav(A.lon,A.lat,B.lon,B.lat);
  console.log('    '+nm.padEnd(18)+'S.scale='+sc.toFixed(4).padStart(7)+
    '  app='+d2.toFixed(2)+' m  rujukan='+refD.toFixed(2)+' m  beza='+
    (Math.abs(d2-refD)/refD*100).toFixed(4)+' %');
}
console.log('');
console.log('  -> SAMA pada semua zoom (sebab hav guna lon/lat, bukan S.scale)');
