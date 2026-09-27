import fs from 'node:fs';
let s = fs.readFileSync('mklabels.mjs','utf8');
const NL = String.fromCharCode(10);

const old = [
  '      const kroma = pmx-pmn;                     // >~40 = berwarna (bukan hitam)',
  '      const gelap = pl<140;',
  '      const a = (gelap && kroma<40) ? 255 : (gelap ? Math.round(255*(140-pl)/60) : 0);',
].join(NL);

const nw = [
  '      const kroma = pmx-pmn;                     // berwarna (bukan hitam)',
  '      // Berwarna (kroma>=40) => sentiasa lutsinar, walaupun gelap.',
  '      // Teks nombor adalah AKROMATIK (hitam/kelabu, kroma kecil).',
  '      let a = 0;',
  '      if(kroma < 40){',
  '        a = pl<90 ? 255 : (pl<140 ? Math.round(255*(140-pl)/50) : 0);',
  '      }',
].join(NL);

if(!s.includes(old)){ console.log('GAGAL: tidak jumpa'); }
else { s=s.replace(old,nw); fs.writeFileSync('mklabels.mjs',s); console.log('OK: kroma>=40 sentiasa lutsinar'); }
