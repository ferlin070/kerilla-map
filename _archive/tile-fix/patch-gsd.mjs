import fs from 'node:fs';
let s = fs.readFileSync('regen-tiles.mjs','utf8');
// Guna GSD yang disahkan (2.645) dari metadata asal, bukan formula buggy 1/A
const old = "  gsdMeters: +(Math.abs(1/A) * 111320 * Math.cos((minLat+maxLat)/2*Math.PI/180)).toFixed(3),";
const nw = "  gsdMeters: 2.645,  // GSD disahkan dari metadata asal (purata horizontal/vertical)";
if(!s.includes(old)){ console.log('GAGAL'); }
else { s=s.replace(old,nw); fs.writeFileSync('regen-tiles.mjs',s); console.log('OK: GSD = 2.645'); }
