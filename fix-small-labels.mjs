import fs from 'node:fs';
let s=fs.readFileSync('app-core.js','utf8');
const log=[];
const ins=(find,repl,label)=>{
  if(!s.includes(find)){ log.push('GAGAL: '+label); return; }
  s=s.replace(find,repl); log.push('OK: '+label);
};

// FIX 1: maxh 64 -> 300 supaya label TIDAK dibuang pada zoom dalam.
// Peta asal pada zoom dalam adalah upsampled blur; label crop lebih tajam,
// jadi kekalkan label (cap pada 300px supaya tak gila besar).
ins('    const maxh=64;            // saiz max (elak terlalu besar)',
    '    const maxh=300;           // saiz max (zoom dalam: label crop lebih tajam dari tile blur)',
    'maxh 64->300');

// FIX 2: De-clutter - guna grid spacing lebih kecil + keutamaan.
// Sekarang overlap check guna kotak penuh. Kecilkan padding supaya label
// bersebelahan tidak saling buang; hanya buang jika betul-betul bertindih teruk (>40% luas).
ins(
'      // de-clutter: skip jika bertindih dengan label sedia ada\n      let overlap=false;\n      for(const p of placed){\n        if(L < p.x+p.w && L+w > p.x && T < p.y+p.h && T+h > p.y){ overlap=true; break; }\n      }\n      if(overlap) continue;',
'      // de-clutter: skip hanya jika bertindih TERUK (>35% luas label)\n      let overlap=false;\n      for(const p of placed){\n        const ox=Math.min(L+w,p.x+p.w)-Math.max(L,p.x);\n        const oy=Math.min(T+h,p.y+p.h)-Math.max(T,p.y);\n        if(ox>0&&oy>0){\n          const a=ox*oy;\n          if(a>0.35*w*h||a>0.35*p.w*p.h){overlap=true;break;}\n        }\n      }\n      if(overlap) continue;',
'de-clutter threshold 35%');

fs.writeFileSync('app-core.js',s);
console.log(log.join('\n'));
