import fs from 'node:fs';
const P = 'app-core.js';
let s = fs.readFileSync(P, 'utf8');
const NL = String.fromCharCode(10);
let done = [];

// ── FIX 1: fitWidth -> fitCover ──
const oldFit = [
  '/* peta FULL SCREEN — fit ke lebar supaya tiada whitespace atas/bawah */',
  'function fitWidth(){',
  '  S.scale = S.vw / META.width;',
  '  S.cx = META.width/2;',
  '  S.cy = S.gps ? ll2px(S.gps.lon,S.gps.lat).row : META.height/2;',
  '}',
].join(NL);

const newFit = [
  '/* PETA FULL SCREEN — fit COVER: zoom masuk supaya peta menutup SELURUH skrin.',
  '   Ini membuang SEMUA ruang kosong (cream) di atas/bawah peta.',
  '   Peta menjadi lebih lebar dari skrin -> boleh pan kiri/kanan, tetapi TIADA gap. */',
  'function fitCover(){',
  '  S.scale = Math.max(S.vw / META.width, S.vh / META.height);',
  '  S.cx = META.width/2;',
  '  S.cy = S.gps ? ll2px(S.gps.lon,S.gps.lat).row : META.height/2;',
  '}',
].join(NL);

if (s.includes(oldFit)) { s = s.replace(oldFit, newFit); done.push('fitCover'); }
else done.push('FIT:GAGAL');

// ── FIX 2: clamp — kunci keras, tiada gap ──
const oldClamp = [
  '    const hw=S.vw/2/S.scale, hh=S.vh/2/S.scale;',
  '    const mx=S.vw*.16/S.scale, my=S.vh*.16/S.scale;',
  '    S.cx = (META.width>2*hw)?Math.max(hw-mx,Math.min(META.width-hw+mx,S.cx)):META.width/2;',
  '    S.cy = (META.height>2*hh)?Math.max(hh-my,Math.min(META.height-hh+my,S.cy)):META.height/2;',
].join(NL);
const newClamp = [
  '    const hw=S.vw/2/S.scale, hh=S.vh/2/S.scale;',
  '    // Kunci supaya TIADA gap: had TEPAT (tiada margin) bila peta lebih besar',
  '    S.cx = (META.width>2*hw)?Math.min(META.width-hw,Math.max(hw,S.cx)):META.width/2;',
  '    S.cy = (META.height>2*hh)?Math.min(META.height-hh,Math.max(hh,S.cy)):META.height/2;',
].join(NL);
if (s.includes(oldClamp)) { s = s.replace(oldClamp, newClamp); done.push('clamp'); }
else done.push('CLAMP:GAGAL');

// ── FIX 3: minScale + had zoom keluar ──
const oldSet = 'function setScale(v){ S.scale=Math.max(.10,Math.min(6,v)); render(); }';
const newSet = [
  'function minScale(){ return Math.max(S.vw/META.width, S.vh/META.height); }',
  'function setScale(v){',
  '  const mn=minScale();',
  '  S.scale=Math.max(mn,Math.min(6,v));',
  '  render();',
  '}',
].join(NL);
if (s.includes(oldSet)) { s = s.replace(oldSet, newSet); done.push('minScale'); }
else done.push('SCALE:GAGAL');

// ── FIX 4: boot guna fitCover ──
if (s.includes('  fitWidth();')) { s = s.replace('  fitWidth();', '  fitCover();'); done.push('boot'); }
else done.push('BOOT:tiada');

// ── FIX 5: fix() guna minScale ──
const oldFix = '  if(center){ S.follow=true; S.scale=Math.max(S.scale, S.vw/META.width); }';
if (s.includes(oldFix)) {
  s = s.replace(oldFix, '  if(center){ S.follow=true; S.scale=Math.max(S.scale, minScale()); }');
  done.push('fix');
} else done.push('FIX:tiada');

// ── FIX 6: ResizeObserver ──
const oldResize = '  addEventListener("resize",render);';
const newResize = [
  '  const onResize = () => {',
  '    const wasFull = S.scale <= minScale() * 1.002;',
  '    S.vw = map.clientWidth; S.vh = map.clientHeight;',
  '    if (wasFull) fitCover();',
  '    render();',
  '  };',
  '  addEventListener("resize", onResize);',
  '  if (window.ResizeObserver) new ResizeObserver(onResize).observe(map);',
  '  if (window.visualViewport) visualViewport.addEventListener("resize", onResize);',
].join(NL);
if (s.includes(oldResize)) { s = s.replace(oldResize, newResize); done.push('ResizeObserver'); }
else done.push('RESIZE:GAGAL');

s = s.replace('  addEventListener("orientationchange",()=>setTimeout(render,300));',
              '  addEventListener("orientationchange",()=>setTimeout(onResize,300));');

fs.writeFileSync(P, s);
console.log('Pembetulan:', done.join(' | '));
console.log('fitWidth tinggal:', (s.split('fitWidth').length-1));
console.log('fitCover:', (s.split('fitCover').length-1));
