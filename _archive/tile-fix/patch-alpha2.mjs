import fs from 'node:fs';
let s = fs.readFileSync('mklabels.mjs','utf8');
const NL = String.fromCharCode(10);

const old = [
  '      // Hanya kekalkan piksel GELAP (teks nombor). Latar berwarna (sungai/lot)',
  '      // dijadikan LUTSINAR supaya tak timbul blok warna di atas peta.',
  '      const l=(D[si]*0.299+D[si+1]*0.587+D[si+2]*0.114);',
  '      const a = l<90 ? 255 : (l<150 ? Math.round(255*(1-(l-90)/60)) : 0);',
  '      atlas.data[di]=D[si]; atlas.data[di+1]=D[si+1]; atlas.data[di+2]=D[si+2]; atlas.data[di+3]=a;'
].join(NL);

const nw = [
  '      // Kekalkan HANYA teks akromatik gelap (nombor hitam/kelabu).',
  '      // Piksel berwarna (latar merah lot / cyan sungai / hijau) jadi LUTSINAR.',
  '      const r=D[si], g=D[si+1], b=D[si+2];',
  '      const l=(r*0.299+g*0.587+b*0.114);',
  '      const mx=Math.max(r,g,b), mn=Math.min(r,g,b);',
  '      const kroma = mx-mn;                       // >~40 = berwarna (bukan hitam)',
  '      const gelap = l<140;',
  '      const a = (gelap && kroma<40) ? 255 : (gelap ? Math.round(255*(140-l)/60) : 0);',
  '      atlas.data[di]=r; atlas.data[di+1]=g; atlas.data[di+2]=b; atlas.data[di+3]=a;'
].join(NL);

if(!s.includes(old)){ console.log('GAGAL: blok alpha lama tidak dijumpai'); }
else { s = s.replace(old, nw); fs.writeFileSync('mklabels.mjs', s); console.log('OK: buang latar berwarna (kroma>40)'); }
