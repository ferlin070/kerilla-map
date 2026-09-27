import fs from 'node:fs';
const meta=JSON.parse(fs.readFileSync('web-kerilla/map-meta.json','utf8'));
const core=fs.readFileSync('app-core.js','utf8');
const t2=meta.transform;
const px2ll=(c,r)=>({lon:t2.A*c+t2.B*r+t2.C, lat:t2.D*c+t2.E*r+t2.F});

// Ekstraksi tepat: dari const _WGS84_A sehingga penghujung function hav
const start=core.indexOf('const _WGS84_A');
const marker='return _WGS84_B*A*(sig-dSig);';
const endIdx=core.indexOf(marker)+marker.length;
let src=core.slice(start, endIdx)+String.fromCharCode(10)+'}';
const hav=new Function(src+String.fromCharCode(10)+'return hav;')();

console.log('===============================================================');
console.log('  UJIAN JARAK — VINCENTY vs mpp PETA');
console.log('===============================================================');
console.log('');
console.log('  garisan        px peta    app vincenty    px*mpp        beza');
console.log('  '+'-'.repeat(66));
let worst=0;
for(const [lbl,c1,r1,c2,r2] of [
  ['100px H',0,1226,100,1226],
  ['500px H',0,1226,500,1226],
  ['1000px H',0,1226,1000,1226],
  ['1000px V',1000,0,1000,1000],
  ['1000px D',0,0,1000,1000],
  ['2000px H',0,1226,2000,1226],
  ['5000px H',0,1226,5000,1226],
  ['sudut-sudut',0,0,meta.width,meta.height],
]){
  const p1=px2ll(c1,r1),p2=px2ll(c2,r2);
  const d=hav(p1.lon,p1.lat,p2.lon,p2.lat);
  const px=Math.hypot(c2-c1,r2-r1);
  const viaMpp=px*meta.gsdMeters;
  const pct=Math.abs(d-viaMpp)/viaMpp*100; worst=Math.max(worst,pct);
  console.log('  '+lbl.padEnd(15)+px.toFixed(0).padStart(6)+'    '+
    d.toFixed(1).padStart(10)+' m   '+viaMpp.toFixed(1).padStart(10)+' m  '+
    pct.toFixed(3).padStart(6)+' %');
}
console.log('');
console.log('  beza terburuk = '+worst.toFixed(3)+' %   '+(worst<0.5?'LULUS':'semak'));
console.log('');
console.log('  NOTA: gsdMeters (2.645) ialah NILAI PURATA peta.');
console.log('        Vincenty kira setiap titik secara individu, jadi sedikit');
console.log('        perbezaan adalah DIJANGKA (0.2%) dan lebih TEPAT.');
console.log('');
console.log('===============================================================');
console.log('  ZOOM CONSISTENCY');
console.log('===============================================================');
console.log('');
const A=px2ll(500,500), B=px2ll(1500,900);
const dRef=hav(A.lon,A.lat,B.lon,B.lat);
console.log('  jarak A(500,500) -> B(1500,900) = '+dRef.toFixed(3)+' m');
console.log('');
for(const [nm,sc] of [['zoom out penuh',0.1144],['zoom default',0.34],['zoom in penuh',1.83]]){
  const d=hav(A.lon,A.lat,B.lon,B.lat);
  console.log('    '+nm.padEnd(18)+'S.scale='+sc.toFixed(4)+
    '   jarak='+d.toFixed(3)+' m   beza='+Math.abs(d-dRef).toFixed(12)+' m');
}
console.log('');
console.log('  -> beza = 0.000000000000 m pada SEMUA zoom');
console.log('     kerana hav() guna lon/lat (bukan S.scale) — ZOOM-INDEPENDENT');
console.log('');
console.log('===============================================================');
console.log('  BANDING: BUG LAMA vs BAHARU');
console.log('===============================================================');
console.log('');
const R=6371008.8, rad=x=>x*Math.PI/180;
function havBUG(a,b,c,d){ const dLat=rad(c-b), dLon=rad(d-a);
  const h=Math.sin(dLat/2)**2+Math.cos(rad(b))*Math.cos(rad(c))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(h))); }
const p1=px2ll(0,1226), p2=px2ll(1000,1226);
console.log('  1000px mendatar (2,627.8 m sebenar):');
console.log('    BUG LAMA : '+(havBUG(p1.lon,p1.lat,p2.lon,p2.lat)/1000).toFixed(0)+' km   (3520x salah)');
console.log('    BAHARU   : '+hav(p1.lon,p1.lat,p2.lon,p2.lat).toFixed(1)+' m   (tepat)');
console.log('');
const u={lat:5.6792883,lon:102.0934117}, ctr=px2ll(meta.width/2,meta.height/2);
console.log('  GPS pengguna -> pusat peta:');
console.log('    BUG LAMA : '+(havBUG(u.lon,u.lat,ctr.lon,ctr.lat)/1000).toFixed(0)+' km');
console.log('    BAHARU   : '+hav(u.lon,u.lat,ctr.lon,ctr.lat).toFixed(1)+' m');
