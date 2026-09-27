import fs from 'node:fs';
let s=fs.readFileSync('app-core.js','utf8');
const NL=String.fromCharCode(10);
const log=[];
const ins=(find,repl,label)=>{
  if(!s.includes(find)){ log.push('GAGAL: '+label); return; }
  s=s.replace(find,repl); log.push('OK: '+label);
};

// 1. minh 13 -> 16, dan saiz max 90 -> 110
ins('    const minh=13;   // px skrin minimum untuk label',
    '    const minh=16;   // px skrin minimum untuk label',
    'minh 13->16');

// 2. backgroundSize 512 -> 1024 (atlas sekarang 1024x1024)
ins('      e.style.backgroundSize=(1024*scale)+"px "+(512*scale)+"px";',
    '      e.style.backgroundSize=(1024*scale)+"px "+(1024*scale)+"px";',
    'atlas tinggi 512->1024');

fs.writeFileSync('app-core.js',s);
console.log(log.join(NL));
