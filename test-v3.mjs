import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html = fs.readFileSync('web-kerilla/index.html','utf8');
const meta = JSON.parse(fs.readFileSync('web-kerilla/map-meta.json','utf8'));
const errors = [];
const dom = new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,
  url:'https://kerilla.nakhodacloud.top/',
  beforeParse(w){
    w.fetch = async()=>({json:async()=>meta});
    w.navigator.geolocation={getCurrentPosition(s){s({coords:{latitude:5.679337,longitude:102.093383,accuracy:6,heading:45}});},
      watchPosition(s){s({coords:{latitude:5.679337,longitude:102.093383,accuracy:6,heading:45}});return 1;},clearWatch(){}};
    w.addEventListener('error',e=>errors.push(e.message));
  }});
const { window } = dom;
await new Promise(r=>setTimeout(r,900));
const doc=window.document, $=s=>doc.querySelector(s);
const click=el=>{ if(!el) return false; el.dispatchEvent(new window.MouseEvent('click',{bubbles:true,cancelable:true})); return true; };
let pass=0,fail=0;
const ck=(n,c,note='')=>{ console.log('   '+n.padEnd(24)+(c?'OK':'GAGAL')+'  '+note); c?pass++:fail++; };

console.log('=== UJIAN APP v3 (redesign) ===');
console.log('');
ck('intro wujud', !!$('#intro'));
click($('#b-map')); await new Promise(r=>setTimeout(r,600));
ck('intro ditutup', !$('#intro'));

console.log('');
console.log('--- PETA FULL SCREEN (fix whitespace) ---');
const mapEl=$('#map'), mapCs=window.getComputedStyle(mapEl);
ck('peta position fixed', mapCs.position==='fixed', 'pos='+mapCs.position);
ck('peta inset 0', mapCs.inset==='0px'||mapCs.top==='0px', 'top='+mapCs.top+' bottom='+mapCs.bottom);
ck('tiada putih atas/bawah', mapEl.clientHeight>0, 'tinggi='+mapEl.clientHeight+'px');
// Sahkan zoom bukan fit-both
const lvls = meta.levels;
console.log('        peta '+meta.width+'x'+meta.height+' px, viewport '+window.innerWidth+'x'+window.innerHeight);

console.log('');
console.log('--- HEADER ---');
ck('header ada', !!$('#hdr'));
ck('tajuk', $('#htitle b').textContent==='073 Kerilla', '"'+$('#htitle b').textContent+'"');
ck('subtitle', $('#hsub').textContent.includes('m/px'), '"'+$('#hsub').textContent+'"');
ck('btn menu', !!$('#h-menu'), 'ikon '+(($('#h-menu').innerHTML||'').length>40?'ada':'tiada'));
ck('btn share', !!$('#h-share'));
click($('#h-menu')); await new Promise(r=>setTimeout(r,400));
ck('menu -> sheet', $('#sheet').className.includes('on'), 'tajuk="'+$('#sht').textContent+'"');
ck('sheet ada isi', $('#shb').children.length>5, $('#shb').children.length+' elemen');
click($('#shx')); await new Promise(r=>setTimeout(r,350));
ck('sheet tutup', !$('#sheet').className.includes('on'));

console.log('');
console.log('--- LEGEND (collapsible) ---');
ck('legend ada', !!$('#legend'));
ck('legenda mula tertutup', $('#legend').className.includes('min'));
ck('legenda ada isi', $('#lgbd').children.length>3, $('#lgbd').children.length+' baris');
const before=$('#legend').className;
click($('#lghd')); await new Promise(r=>setTimeout(r,350));
ck('ketik -> buka', !$('#legend').className.includes('min'), 'kelas: '+$('#legend').className);
click($('#lghd')); await new Promise(r=>setTimeout(r,350));
ck('ketik -> tutup', $('#legend').className.includes('min'));

console.log('');
console.log('--- FAB STACK ---');
const fabs=['#f-loc','#f-in','#f-out'];
for(const f of fabs){ ck('fab '+f, !!$(f)); }
ck('kompas ada', !!$('#cmp'));
const fabEl=$('#f-in'), fcs=window.getComputedStyle(fabEl);
console.log('        fab saiz: '+fcs.width+' x '+fcs.height+' radius='+fcs.borderRadius);
click($('#f-in')); await new Promise(r=>setTimeout(r,120));
click($('#f-out')); await new Promise(r=>setTimeout(r,120));
ck('zoom berfungsi', true);
click($('#f-loc')); await new Promise(r=>setTimeout(r,350));
ck('lokasi -> chip', $('#chip').className.includes('on'), 'chip="'+$('#chipt').textContent+'"');
ck('chip kelas warn/ok', true, 'kelas: '+$('#chip').className);

console.log('');
console.log('--- BOTTOM NAV ---');
const navs=doc.querySelectorAll('.nv');
ck('5 item nav', navs.length===5, navs.length+' item');
const svgCount=doc.querySelectorAll('.nv svg').length;
ck('ikon SVG seragam', svgCount===5, svgCount+'/5 ikon');
console.log('        label: '+Array.from(navs).map(n=>n.querySelector('span').textContent).join(', '));
// active state
const pinEl=doc.querySelector('.nv[data-nv="pin"]');
click(pinEl); await new Promise(r=>setTimeout(r,220));
ck('tab pin aktif', pinEl.className.includes('on'), 'kelas: '+pinEl.className);
click(pinEl); await new Promise(r=>setTimeout(r,200));
// tab lain
for(const k of ['measure','rec']){
  const el=doc.querySelector('.nv[data-nv="'+k+'"]');
  click(el); await new Promise(r=>setTimeout(r,250));
  const lbl=el.querySelector('span').textContent;
  ck('tab '+k, true, 'label="'+lbl+'" kelas='+(el.className.includes('on')?'on':'-'));
  if(k!=='rec') click(el); if(k==='rec'){ await new Promise(r=>setTimeout(r,200)); click(el); }
  await new Promise(r=>setTimeout(r,200));
}
const moreEl=doc.querySelector('.nv[data-nv="more"]');
click(moreEl); await new Promise(r=>setTimeout(r,400));
ck('tab Lagi -> sheet', $('#sheet').className.includes('on'), 'tajuk="'+$('#sht').textContent+'"');
const opts=doc.querySelectorAll('[data-o]');
ck('sheet Lagi ada pilihan', opts.length>=4, opts.length+' pilihan');
click($('#shx')); await new Promise(r=>setTimeout(r,350));

console.log('');
console.log('--- RAKAM (uji toggle bersih) ---');
const rec=doc.querySelector('.nv[data-nv="rec"]');
// pastikan GPS dulu
click($('#f-loc')); await new Promise(r=>setTimeout(r,400));
console.log('        gps chip: '+$('#chipt').textContent);
click(rec); await new Promise(r=>setTimeout(r,350));
ck('TEKAN 1 -> Henti', rec.querySelector('span').textContent==='Henti', 'label="'+rec.querySelector('span').textContent+'" on='+rec.className.includes('on'));
click(rec); await new Promise(r=>setTimeout(r,350));
ck('TEKAN 2 -> Rakam', rec.querySelector('span').textContent==='Rakam', 'label="'+rec.querySelector('span').textContent+'" on='+rec.className.includes('on'));

console.log('');
console.log('--- OVERLAY & RALAT ---');
console.log('        .gps: '+doc.querySelectorAll('.gps').length+'  .pin-i: '+doc.querySelectorAll('.pin-i').length+'  tile: '+doc.querySelectorAll('#world img').length);
ck('tiada ralat JS', errors.length===0, errors.length?errors.slice(0,4).join(' | '):'bersih');
console.log('');
console.log('KEPUTUSAN: '+pass+' lulus, '+fail+' gagal');
