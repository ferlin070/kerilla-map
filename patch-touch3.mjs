import fs from 'node:fs';
const P = 'app-core.js';
let s = fs.readFileSync(P, 'utf8');
const NL = String.fromCharCode(10);
const log = [];
const sub = (find, repl, label) => {
  if (!s.includes(find)) { log.push('GAGAL: ' + label); return; }
  s = s.replace(find, repl); log.push('OK: ' + label);
};

// ── KIRA SKALA PETA: pilih panjang "cantik" yang muat dalam ~110px ──
sub(
'function legend(){',
[ '/* ===== SCALE BAR — kira panjang sebenar ikut zoom ===== */',
  'function niceLen(m){',
  '  const pow=Math.pow(10,Math.floor(Math.log10(m)));',
  '  const n=m/pow;',
  '  const mult = n>=5?5 : n>=2?2 : 1;',
  '  return mult*pow;',
  '}',
  'function upScaleBar(){',
  '  const el=$("#sb-txt"), ln=$("#sb-line"), sc=$("#sb-scale");',
  '  if(!el||!META) return;',
  '  const mpp = META.gsdMeters / S.scale;                // meter per piksel skrin',
  '  const target = 110;                                   // sasaran lebar px',
  '  const len = niceLen(target*mpp);                      // panjang bulat',
  '  const px = len/mpp;                                   // lebar sebenar px',
  '  ln.style.width = px.toFixed(1)+"px";',
  '  ln.style.flex = "0 0 auto";',
  '  el.textContent = len>=1000 ? (len/1000)+" km" : len+" m";',
  '  if(sc) sc.textContent = mpp.toFixed(2)+" m/px";',
  '}',
  '',
  'function legend(){',
].join(NL),
'scale bar JS');

// ── panggil upScaleBar() dalam render() dan updet zoom ──
sub('  draw(sc,k);' + NL + '}', '  draw(sc,k);' + NL + '  upScaleBar();' + NL + '}', 'panggil upScaleBar dalam render');
sub('function setScale(v){', 'function setScale(v){' + NL + '  // skala bar dikemas kini melalui render -> upScaleBar', 'nota setScale');

// ── LEGEND: long-press untuk pin ──
sub(
'$("#lghd").onclick=()=>$("#legend").classList.toggle("min");',
[ '/* Legenda: ketik = buka/tutup, TEKAN LAMA = pin (kekal buka) */',
  'let lgPin=false, lgT=null, lgLong=false;',
  'const lghd=$("#lghd"), lgel=$("#legend");',
  'function lgOpen(){ lgel.classList.remove("min"); }',
  'function lgClose(){ if(!lgPin) lgel.classList.add("min"); }',
  'function setPin(){',
  '  lgPin=!lgPin;',
  '  lgel.classList.toggle("pinned", lgPin);',
  '  if(lgPin){ lgOpen(); toast("Legenda dipin — kekal terbuka",2600,"ok"); }',
  '  else toast("Pin legenda dibuang",1900);',
  '}',
  'lghd.addEventListener("pointerdown",()=>{',
  '  lgLong=false;',
  '  lgT=setTimeout(()=>{ lgLong=true; setPin(); }, 550);',
  '});',
  'lghd.addEventListener("pointerup",()=>{ clearTimeout(lgT); });',
  'lghd.addEventListener("pointercancel",()=>{ clearTimeout(lgT); });',
  'lghd.addEventListener("pointerleave",()=>{ clearTimeout(lgT); });',
  'lghd.addEventListener("click",()=>{',
  '  if(lgLong){ lgLong=false; return; }',
  '  if(lgPin){ toast("Legenda dipin — tekan lama untuk lepas",2200); return; }',
  '  lgel.classList.toggle("min");',
  '});',
].join(NL),
'legenda long-press pin');

fs.writeFileSync(P, s);
console.log(log.join(NL));

// ── CSS: penunjuk legenda dipin ──
const SP = 'web-kerilla/skin.html';
let sk = fs.readFileSync(SP, 'utf8');
const NL2 = String.fromCharCode(10);
const cssAdd = [
  '#legend.pinned{border-color:var(--accent);box-shadow:0 0 0 2px rgba(232,130,60,.28),var(--sh-lg)}',
  '#legend.pinned #lghd{color:var(--accent)}',
  '#legend.pinned #lghd .tg{color:var(--accent)}',
].join(NL2);
if (!sk.includes('#legend.pinned{')) {
  sk = sk.replace('.lgr{display:flex;align-items:center;gap:8px;font-size:10.5px;color:#3c3a30}',
    cssAdd + NL2 + '.lgr{display:flex;align-items:center;gap:8px;font-size:10.5px;color:#3c3a30}');
  fs.writeFileSync(SP, sk);
  console.log('OK: CSS pinned legenda');
} else console.log('pinned CSS sudah ada');
