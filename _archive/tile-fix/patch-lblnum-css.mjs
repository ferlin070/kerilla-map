import fs from 'node:fs';
let s = fs.readFileSync('web-kerilla/skin.html','utf8');

const old = '.lblnum{position:absolute;pointer-events:none;image-rendering:-webkit-optimize-contrast;\n  image-rendering:crisp-edges;filter:drop-shadow(0 0 2px #fff) drop-shadow(0 0 1px #fff);\n  background-repeat:no-repeat;z-index:5}';

const nw = '.lblnum{position:absolute;pointer-events:none;\n  filter:drop-shadow(0 0 2px #fff) drop-shadow(0 0 1px #fff);\n  background-repeat:no-repeat;z-index:5}';

if(!s.includes(old)){ console.log('GAGAL: CSS tidak jumpa'); }
else { s=s.replace(old,nw); fs.writeFileSync('web-kerilla/skin.html',s); console.log('OK: buang crisp-edges (guna smoothing halus)'); }
