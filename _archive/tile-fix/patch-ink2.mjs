import fs from 'node:fs';
let s = fs.readFileSync('mklabels.mjs','utf8');

// Betulkan semua baki flood-fill condition (regex escape gagal sebelum ini)
s = s.replace('if(lum(x,y)>=110) continue;', 'if(lum(x,y)>=110 || !ink(x,y)) continue;');
s = s.replace('lum(cx-1,cy)<110', 'lum(cx-1,cy)<110 && ink(cx-1,cy)');
s = s.replace('lum(cx+1,cy)<110', 'lum(cx+1,cy)<110 && ink(cx+1,cy)');
s = s.replace('lum(cx,cy-1)<110', 'lum(cx,cy-1)<110 && ink(cx,cy-1)');
s = s.replace('lum(cx,cy+1)<110', 'lum(cx,cy+1)<110 && ink(cx,cy+1)');

fs.writeFileSync('mklabels.mjs', s);
console.log('OK: flood-fill hanya tangkap dakwat hitam (kroma<45)');
