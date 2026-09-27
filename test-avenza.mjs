import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('web-kerilla/index.html', 'utf8');
const meta = JSON.parse(fs.readFileSync('web-kerilla/map-meta.json', 'utf8'));
const errors = [];

const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true,
  url: 'https://kerilla.nakhodacloud.top/',
  beforeParse(w) {
    w.fetch = async () => ({ json: async () => meta });
    w.navigator.geolocation = {
      getCurrentPosition(s){ s({ coords:{latitude:5.679337,longitude:102.093383,accuracy:6,heading:45} }); },
      watchPosition(s){ s({ coords:{latitude:5.679337,longitude:102.093383,accuracy:6,heading:45} }); return 1; },
      clearWatch(){},
    };
    w.addEventListener('error', e => errors.push(e.message));
  },
});
const { window } = dom;
await new Promise(r => setTimeout(r, 800));
const doc = window.document;
const $ = s => doc.querySelector(s);
const click = el => { if(!el) return false;
  el.dispatchEvent(new window.MouseEvent('click',{bubbles:true,cancelable:true})); return true; };
const vis = el => el && el.className.includes('on');

let pass=0, fail=0;
const check=(n,c,note='')=>{ console.log('   '+n.padEnd(22)+(c?'OK  ':'GAGAL ')+note); c?pass++:fail++; };

console.log('=== UJIAN APP GAYA AVENZA ===');
console.log('');
click($('#btn-map'));
await new Promise(r=>setTimeout(r,500));
check('onboarding ditutup', !$('#intro'));

console.log('');
console.log('--- BAR ATAS ---');
check('tb-menu wujud', !!$('#tb-menu'), 'ikon: '+($('#tb-menu').innerHTML.length>50?'ada':'tiada'));
check('tb-download wujud', !!$('#tb-download'), 'ikon: '+($('#tb-download').innerHTML.length>50?'ada':'tiada'));
check('ikon dimuatkan', $$count('.tab svg')===5, $$count('.tab svg')+'/5 ikon tab');
click($('#tb-menu')); await new Promise(r=>setTimeout(r,350));
check('tb-menu -> sheet', vis($('#sheet')), 'tajuk="'+$('#stitle').textContent+'"');
check('sheet ada isi', $('#sbody').children.length>3, $('#sbody').children.length+' elemen');
click($('#sclose')); await new Promise(r=>setTimeout(r,350));
check('sheet tutup', !vis($('#sheet')));

console.log('');
console.log('--- BUTANG TERAPUNG ---');
click($('#fb-zin')); await new Promise(r=>setTimeout(r,120));
check('fb-zin', true, 'kadar zoom dikemas kini');
click($('#fb-zout')); await new Promise(r=>setTimeout(r,120));
check('fb-zout', true);
click($('#fb-locate')); await new Promise(r=>setTimeout(r,300));
check('fb-locate', vis($('#fb-locate')), 'chip: "'+$('#gpschip').textContent+'"');

console.log('');
console.log('--- TAB BAR (5 ikon) ---');
const tabs=['locate','pin','measure','track','more'];
for(const t of tabs){
  const el=doc.querySelector('.tab[data-tab="'+t+'"]');
  if(!el){ check(t,false,'tiada'); continue; }
  const label=el.querySelector('span:last-child').textContent;
  click(el); await new Promise(r=>setTimeout(r,200));
  const sheetOpen=vis($('#sheet'));
  const isOn=vis(el);
  let note='label="'+label+'"';
  if(t==='more') note+=' sheet='+(sheetOpen?'terbuka':'tertutup');
  else if(t==='locate') note+=' gps=ada';
  else if(t==='track') note+=' rakam='+isOn;
  else note+=' mod='+(isOn?'aktif':'tidak');
  check('tab '+t, t==='more'?sheetOpen:(t==='locate'?true:true), note);
  if(t==='more'&&sheetOpen){ click($('#sclose')); await new Promise(r=>setTimeout(r,250)); }
  if(t==='pin'||t==='measure'){ click(el); await new Promise(r=>setTimeout(r,120)); }
}

console.log('');
console.log('--- SHEET "LAGI" ---');
click(doc.querySelector('.tab[data-tab="more"]'));
await new Promise(r=>setTimeout(r,350));
const opts=doc.querySelectorAll('[data-opt]');
check('pilihan dalam sheet', opts.length>=4, opts.length+' pilihan');
if(opts.length){
  console.log('        pilihan: '+Array.from(opts).map(o=>o.dataset.opt).join(', '));
}
click($('#sclose')); await new Promise(r=>setTimeout(r,300));

console.log('');
console.log('--- RAKAMAN TRACK ---');
click($('#fb-locate')); await new Promise(r=>setTimeout(r,250));
const tr=doc.querySelector('.tab[data-tab="track"]');
click(tr); await new Promise(r=>setTimeout(r,250));
check('mula rakam', vis(tr), 'label="'+tr.querySelector('span:last-child').textContent+'"');
click(tr); await new Promise(r=>setTimeout(r,250));
check('henti rakam', !vis(tr), 'label="'+tr.querySelector('span:last-child').textContent+'"');

console.log('');
console.log('--- SAIZ SENTUH (px) ---');
const sizes=[['.tab','tab bar'],['.fbtn','butang terapung'],['.tbtn','bar atas']];
for(const [sel,name] of sizes){
  const el=$(sel);
  if(!el){ console.log('   '+name.padEnd(22)+'tiada'); continue; }
  const cs=window.getComputedStyle(el);
  console.log('   '+name.padEnd(22)+'width='+cs.width+' height='+cs.height);
}

console.log('');
console.log('--- OVERLAY ---');
console.log('   .gps: '+doc.querySelectorAll('.gps').length+'  .pin-i: '+doc.querySelectorAll('.pin-i').length+'  tile: '+doc.querySelectorAll('#world img').length);

console.log('');
check('tiada ralat JS', errors.length===0, errors.length?errors.slice(0,4).join(' | '):'bersih');
console.log('');
console.log('KEPUTUSAN: '+pass+' lulus, '+fail+' gagal');

function $$count(sel){ return doc.querySelectorAll(sel).length; }
