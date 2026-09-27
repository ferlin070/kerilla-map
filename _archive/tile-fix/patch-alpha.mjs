import fs from 'node:fs';
let s = fs.readFileSync('mklabels.mjs','utf8');
const NL = String.fromCharCode(10);

// Ganti baris yang menetapkan alpha opaque (255) dengan alpha berasaskan kegelapan
const old = [
  '  atlas=new PNG({width:AW,height:AH});',
  'for(let i=0;i<AW*AH;i++){atlas.data[i*4]=255;atlas.data[i*4+1]=255;atlas.data[i*4+2]=255;atlas.data[i*4+3]=255;}'
].join(NL);

// Cari baris sebenar (mungkin berbeza spacing) - guna replace pada core write
const oldWrite = '      atlas.data[di]=D[si]; atlas.data[di+1]=D[si+1]; atlas.data[di+2]=D[si+2]; atlas.data[di+3]=255;';
const newWrite = [
  '      // Hanya kekalkan piksel GELAP (teks nombor). Latar berwarna (sungai/lot)',
  '      // dijadikan LUTSINAR supaya tak timbul blok warna di atas peta.',
  '      const l=(D[si]*0.299+D[si+1]*0.587+D[si+2]*0.114);',
  '      const a = l<90 ? 255 : (l<150 ? Math.round(255*(1-(l-90)/60)) : 0);',
  '      atlas.data[di]=D[si]; atlas.data[di+1]=D[si+1]; atlas.data[di+2]=D[si+2]; atlas.data[di+3]=a;'
].join(NL);

if(!s.includes(oldWrite)){ console.log('GAGAL: baris write tidak dijumpai'); }
else {
  s = s.replace(oldWrite, newWrite);
  // Juga: background atlas mula lutsinar (bukan putih), untuk elak white box
  const oldBg = "for(let i=0;i<AW*AH;i++){atlas.data[i*4]=255;atlas.data[i*4+1]=255;atlas.data[i*4+2]=255;atlas.data[i*4+3]=255;}";
  const newBg = "for(let i=0;i<AW*AH;i++){atlas.data[i*4]=255;atlas.data[i*4+1]=255;atlas.data[i*4+2]=255;atlas.data[i*4+3]=0;}";
  if(s.includes(oldBg)) s = s.replace(oldBg, newBg); else console.log('NOTA: bg lama tak jumpa (ok)');
  fs.writeFileSync('mklabels.mjs', s);
  console.log('OK: alpha berasaskan kegelapan + bg lutsinar');
}
