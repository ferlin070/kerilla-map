import fs from 'node:fs';
let s = fs.readFileSync('mklabels.mjs','utf8');
const NL = String.fromCharCode(10);

// 1. Tambah fungsi isDarkInk (hitam/kelabu sahaja, bukan merah/hijau/biru gelap)
const oldLum = "const lum=(x,y)=>{ const i=(y*W+x)*4; return D[i]*0.299+D[i+1]*0.587+D[i+2]*0.114; };";
const newLum = "const lum=(x,y)=>{ const i=(y*W+x)*4; return D[i]*0.299+D[i+1]*0.587+D[i+2]*0.114; };\n// Dakwat HITAM/GREY sahaja (nombor). Tolak teks berwarna (merah lot, dll).\nconst ink=(x,y)=>{ const i=(y*W+x)*4; const r=D[i],g=D[i+1],b=D[i+2]; const mx=Math.max(r,g,b), mn=Math.min(r,g,b); return (mx-mn)<45; };";
if(!s.includes(oldLum)){ console.log('GAGAL lum'); process.exit(1); }
s = s.replace(oldLum, newLum);

// 2. Semua flood-fill lum<110 tambah && ink
s = s.replace(/lum(x,y)>=110/g, '(lum(x,y)>=110 || !ink(x,y))');
s = s.replace(/lum(cx-1,cy)<110/g, '(lum(cx-1,cy)<110 && ink(cx-1,cy))');
s = s.replace(/lum(cx+1,cy)<110/g, '(lum(cx+1,cy)<110 && ink(cx+1,cy))');
s = s.replace(/lum(cx,cy-1)<110/g, '(lum(cx,cy-1)<110 && ink(cx,cy-1))');
s = s.replace(/lum(cx,cy+1)<110/g, '(lum(cx,cy+1)<110 && ink(cx,cy+1))');

fs.writeFileSync('mklabels.mjs', s);
console.log('OK: flood-fill hanya tangkap dakwat hitam/grey');
