import fs from 'node:fs';
const P='app-core.js';
let s=fs.readFileSync(P,'utf8');
const NL=String.fromCharCode(10);
const log=[];
const sub=(f,r,l)=>{ if(!s.includes(f)){log.push('GAGAL: '+l);return;} s=s.replace(f,r); log.push('OK: '+l); };

// ── PELINDUNG: viewport 0 -> jangan kira (elak Infinity) ──
sub(
'function upScaleBar(){' + NL +
'  const el=$("#sb-txt"), ln=$("#sb-line"), sc=$("#sb-scale");' + NL +
'  if(!el||!META) return;',
[ 'function upScaleBar(){',
  '  const el=$("#sb-txt"), ln=$("#sb-line"), sc=$("#sb-scale");',
  '  if(!el||!META) return;',
  '  // Pelindung: viewport/scale tak sah (tab tersembunyi, display:none, dsb)',
  '  if(!(S.vw>0)||!(S.scale>0)) {',
  '    if(ln) ln.style.width="0px";',
  '    el.textContent="— m";',
  '    if(sc) sc.textContent="— m/px";',
  '    return;',
  '  }',
].join(NL),
'pelindung Infinity');

// ── PELINDUNG: fitCover/fitAll jangan jadi 0 ──
sub(
'function fitCover(){' + NL +
'  S.scale = Math.max(S.vw / META.width, S.vh / META.height);',
[ 'function fitCover(){',
  '  const vw=S.vw||map.clientWidth||window.innerWidth||360;',
  '  const vh=S.vh||map.clientHeight||window.innerHeight||640;',
  '  S.scale = Math.max(vw / META.width, vh / META.height);',
].join(NL),
'pelindung fitCover');

sub(
'function minScale(){ return Math.max(S.vw/META.width, S.vh/META.height); }',
[ 'function minScale(){',
  '  const vw=S.vw||map.clientWidth||window.innerWidth||360;',
  '  const vh=S.vh||map.clientHeight||window.innerHeight||640;',
  '  return Math.max(vw/META.width, vh/META.height);',
  '}',
].join(NL),
'pelindung minScale');

// ── PELINDUNG: render() gunakan dimensi fallback ──
sub(
'  S.vw = map.clientWidth; S.vh = map.clientHeight;',
[ '  const cw=map.clientWidth||window.innerWidth||360;',
  '  const ch=map.clientHeight||window.innerHeight||640;',
  '  S.vw = cw; S.vh = ch;',
].join(NL),
'pelindung render');

fs.writeFileSync(P,s);
console.log(log.join(NL));
