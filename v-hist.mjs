import fs from 'node:fs';
const s=fs.readFileSync('web-kerilla/index.html','utf8');
const i=s.indexOf('<script>'), j=s.lastIndexOf('</script>');
fs.writeFileSync('/tmp/f.js', s.slice(i+8,j));
const checks=[
  ['kerilla.hist',      'localStorage kunci sejarah'],
  ['function histSave', 'histSave'],
  ['function histLoad', 'histLoad'],
  ['function dlGPX',    'dlGPX'],
  ['function histSheet','histSheet'],
  ['function persistAll','persistAll'],
  ['function restoreAll','restoreAll'],
  ['restoreAll();',     'boot memanggil restoreAll'],
  ['Trek disimpan',     'toast simpan'],
  ['Sejarah & GPX',     'menu item'],
  ['data-act="gpx"',    'butang eksport'],
  ['.hrow{',            'CSS sejarah'],
];
let p=0;
for(const [f,l] of checks){
  const ok=s.includes(f);
  if(ok)p++; else console.log('FAIL: '+l);
}
console.log('statik: '+p+'/'+checks.length+' lulus');
