import fs from 'node:fs';
let s = fs.readFileSync('test-scalebar.mjs','utf8');
const NL = String.fromCharCode(10);
// jsdom tak layout CSS: palsukan clientWidth/Height supaya kiraan boleh diuji
s = s.replace(
  "    w.addEventListener('error',e=>errs.push(e.message)); }});",
  [
    "    w.addEventListener('error',e=>errs.push(e.message));",
    "    // jsdom tak jalankan layout CSS - palsukan dimensi supaya ujian bermakna",
    "    Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{",
    "      get(){ return this.id==='map'?390:0; }, configurable:true });",
    "    Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{",
    "      get(){ return this.id==='map'?780:0; }, configurable:true });",
    "  }});",
  ].join(NL)
);
fs.writeFileSync('test-scalebar.mjs', s);
console.log('ujian dipalsukan dimensi');
