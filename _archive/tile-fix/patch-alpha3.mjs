import fs from 'node:fs';
let s = fs.readFileSync('mklabels.mjs','utf8');

const old = [
  '      const r=D[si], g=D[si+1], b=D[si+2];',
  '      const l=(r*0.299+g*0.587+b*0.114);',
  '      const mx=Math.max(r,g,b), mn=Math.min(r,g,b);',
  '      const kroma = mx-mn;                       // >~40 = berwarna (bukan hitam)',
  '      const gelap = l<140;',
  '      const a = (gelap && kroma<40) ? 255 : (gelap ? Math.round(255*(140-l)/60) : 0);',
  '      atlas.data[di]=r; atlas.data[di+1]=g; atlas.data[di+2]=b; atlas.data[di+3]=a;'
].join('\n');

const nw = [
  '      const pr=D[si], pg=D[si+1], pb=D[si+2];',
  '      const pl=(pr*0.299+pg*0.587+pb*0.114);',
  '      const pmx=Math.max(pr,pg,pb), pmn=Math.min(pr,pg,pb);',
  '      const kroma = pmx-pmn;                     // >~40 = berwarna (bukan hitam)',
  '      const gelap = pl<140;',
  '      const a = (gelap && kroma<40) ? 255 : (gelap ? Math.round(255*(140-pl)/60) : 0);',
  '      atlas.data[di]=pr; atlas.data[di+1]=pg; atlas.data[di+2]=pb; atlas.data[di+3]=a;'
].join('\n');

if(!s.includes(old)){ console.log('GAGAL: tidak jumpa'); }
else { s=s.replace(old,nw); fs.writeFileSync('mklabels.mjs',s); console.log('OK: nama pembolehubah dibetulkan (elak konflik dgn g)'); }
