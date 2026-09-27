const haversine = (lon1,lat1,lon2,lat2) => {
  const R=6371008.8, r=d=>d*Math.PI/180;
  const dLat=r(lat2-lat1), dLon=r(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(r(lat1))*Math.cos(r(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(a)));
};
const fmtD = m => m<1000 ? m.toFixed(1)+' m' : (m/1000).toFixed(2)+' km';

console.log('=== SIMULASI RAKAMAN TRACK (GPS SEBENAR) ===');
console.log('');
console.log('Titik mula (GPS sebenar anda): 5.679337, 102.093383');
console.log('');

const pts = [{lon:102.093383, lat:5.679337, t:0}];
let lon=102.093383, lat=5.679337;
for (let i=1; i<=12; i++) {
  lat += 22/111320;
  lon += 14/(111320*Math.cos(lat*Math.PI/180));
  pts.push({lon, lat, t:i*2000});
}
let d=0;
for (let i=1;i<pts.length;i++) d += haversine(pts[i-1].lon,pts[i-1].lat,pts[i].lon,pts[i].lat);
const sec=(pts[pts.length-1].t-pts[0].t)/1000;
console.log('  titik direkod : ' + pts.length);
console.log('  jumlah jarak  : ' + fmtD(d));
console.log('  masa          : ' + sec + ' s');
console.log('  kelajuan      : ' + ((d/sec)*3.6).toFixed(1) + ' km/j');
console.log('  titik akhir   : ' + lat.toFixed(6) + ', ' + lon.toFixed(6));
console.log('');
const far = pts.filter(p => haversine(102.093383,5.679337,p.lon,p.lat) > 500).length;
console.log('  titik >500m dari mula: ' + far + ' ' + (far===0?'YA, semua dekat lokasi anda':'ada yang jauh'));
console.log('');
console.log('=== PERBANDINGAN: versi LAMA (simulasi) ===');
console.log('  mula di tengah peta: 5.7013, 102.1039');
console.log('  jarak dari GPS anda: ' + fmtD(haversine(102.093383,5.679337,102.1039,5.7013)));
console.log('  -> sebab itu track nampak jauh & peta bergerak sendiri');
console.log('');
console.log('=== SAIZ BUTANG ===');
console.log('  sebelum: 48px butang, 21px ikon, 62px min alat, 18px ikon alat');
console.log('  sekarang: 62px butang, 29px ikon, 84px min alat, 26px ikon alat');
console.log('  peningkatan: +29% butang, +38% ikon, +35% lebar alat, +44% ikon alat');
