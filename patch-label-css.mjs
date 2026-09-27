import fs from 'node:fs';
let s=fs.readFileSync('web-kerilla/skin.html','utf8');
const NL=String.fromCharCode(10);
if(!s.includes('.lblnum{')){
  const css=[
  '',
  '/* Label nombor task: crop dari atlas, sentiasa boleh dibaca */',
  '.lblnum{position:absolute;pointer-events:none;image-rendering:-webkit-optimize-contrast;',
  '  image-rendering:crisp-edges;filter:drop-shadow(0 0 2px #fff) drop-shadow(0 0 1px #fff);',
  '  background-repeat:no-repeat;z-index:5}'
  ].join(NL);
  s=s.replace('</style>', css+NL+'</style>');
  console.log('OK: CSS .lblnum ditambah');
} else console.log('SKIP: CSS sudah ada');
fs.writeFileSync('web-kerilla/skin.html',s);
