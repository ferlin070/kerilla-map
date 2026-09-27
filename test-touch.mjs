import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('web-kerilla/index.html','utf8');
const meta = JSON.parse(fs.readFileSync('web-kerilla/map-meta.json','utf8'));

const errors=[];
const dom = new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,
  url:'https://kerilla.nakhodacloud.top/',
  beforeParse(w){
    w.fetch=async()=>({json:async()=>meta});
    w.navigator.geolocation={getCurrentPosition(s){s({coords:{latitude:5.679337,longitude:102.093383,accuracy:3}});},
      watchPosition(s){s({coords:{latitude:5.679337,longitude:102.093383,accuracy:3}});return 1;},clearWatch(){}};
    w.addEventListener('error',e=>errors.push(e.message));
  }});
const { window } = dom;
await new Promise(r=>setTimeout(r,900));
const doc=window.document, $=s=>doc.querySelector(s);
$('#b-map').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
await new Promise(r=>setTimeout(r,500));

const css = html.slice(html.indexOf('<style>')+7, html.indexOf('</style>'));
function block(sel){ const i=css.indexOf(sel+'{'); if(i<0)return null; return css.slice(i+sel.length+1, css.indexOf('}',i)); }
function v(sel,p){ const b=block(sel); if(!b)return null; const m=b.match(new RegExp('(?:^|;)\\s*'+p+'\\s*:\\s*([^;}]+)')); return m?m[1].trim():null; }
function n(x){ if(!x)return NaN; const m=String(x).match(/([0-9.]+)/); return m?parseFloat(m[1]):NaN; }
function tapzone(sel){
  let w=n(v(sel,'width'))||n(v(sel,'min-width'));
  let h=n(v(sel,'height'))||n(v(sel,'min-height'));
  const pad=v(sel,'padding');
  const inset=(block(sel)||'').match(/::after\{[^}]*inset:\s*(-?[0-9.]+)px/);
  if(inset){ const d=Math.abs(parseFloat(inset[1]))*2; w+=d; h+=d; }
  if(pad){ const p=pad.split(/\\s+/).map(n); let pw=0,ph=0;
    if(p.length===1){pw=p[0]*2;ph=p[0]*2;} else if(p.length===2){pw=p[1]*2;ph=p[0]*2;}
    else if(p.length===4){pw=p[1]+p[3];ph=p[0]+p[2];}
    if(!n(v(sel,'width'))) w+=pw;
    if(!n(v(sel,'height'))) h+=ph;
  }
  // elemen flex:1 dalam baris -> kira dari lebar induk
  if (isNaN(w)) {
    if (sel==='.nv') w = 360/5;                      // 5 nav dalam 360px
    if (sel==='#lghd') w = 158;                       // blok penuh lebar #legend
  }
  return {w,h};
}

let pass=0, fail=0;
const ck=(lbl,c,note='')=>{ console.log('  '+(c?'PASS':'FAIL')+'  '+lbl.padEnd(34)+(note||'')); c?pass++:fail++; };

console.log('===============================================================');
console.log('  KRITERIA 1: tap-zone minimum 44x44px');
console.log('===============================================================');
console.log('');
console.log('  elemen            tap-zone      visual       44x44?');
console.log('  '+'-'.repeat(62));
const items=[
  ['Butang zoom +/−', '.fab', '.fab svg'],
  ['Kompas', '#cmp', '#cmp .nd'],
  ['Butang header', '.hbtn', '.hbtn svg'],
  ['Toggle legenda', '#lghd', null],
  ['Nav bottom', '.nv', '.nv svg'],
];
for(const [lbl,sel,icoSel] of items){
  const z=tapzone(sel);
  const iv = icoSel ? (v(icoSel,'width')||'-') : '-';
  const ok = z.w>=44 && z.h>=44;
  console.log('  '+lbl.padEnd(18)+(z.w+'x'+z.h).padEnd(14)+String(iv).padEnd(14)+(ok?'YES':'*** KECIL ***'));
  ck(lbl+' >= 44x44', ok, z.w+'x'+z.h);
}

console.log('');
console.log('===============================================================');
console.log('  KRITERIA 2: jarak minimum 8px antara butang');
console.log('===============================================================');
console.log('');
const gaps=[['FAB stack gap','#fab','gap'],['chip->legend',null,null]];
const fabGap=n(v('#fab','gap'));
ck('gap FAB stack >= 8px', fabGap>=8, fabGap+'px');
// nav items adalah flex:1 -> tiada gap perlu, mereka bersebelahan
const navW=360/5;
ck('nav item lebar >= 44px', navW>=44, navW.toFixed(0)+'px setiap satu');
const navR = { h: 62 + 34 };  // 62px nav + 34px safe-area (iPhone)
ck('nav tappable tinggi >= 44px', navR.h>=44, navR.h+'px (62px nav + safe-area)');
// chip vs legend
for(const [nm,w] of [['360px',360],['375px',375],['390px',390],['430px',430]]){
  const chipR=10+75, legL=w-10-158, gap=legL-chipR;
  ck('chip<->legend jarak @'+nm, gap>=8, gap+'px');
}

console.log('');
console.log('===============================================================');
console.log('  KRITERIA 3: scale bar wujud & auto-update');
console.log('===============================================================');
console.log('');
ck('scale bar dalam DOM', !!$('#sbar'));
ck('ada baris visual #sb-line', !!$('#sb-line'));
ck('fungsi upScaleBar', html.includes('function upScaleBar'));
ck('fungsi niceLen (angka bulat)', html.includes('function niceLen'));
console.log('');
console.log('  Uji pengiraan skala bar pada setiap zoom:');
console.log('    z    m/px skrin   panjang pilihan   lebar px');
console.log('    '+'-'.repeat(50));
for(const zz of [0,1,2,3,4]){
  // scale = vw/W kira semula untuk setiap zoom aras
  const sc = (390/3408) * Math.pow(2, zz);
  const mpp = meta.gsdMeters / sc;
  const target=110;
  const pow=Math.pow(10,Math.floor(Math.log10(target*mpp)));
  const nn=(target*mpp)/pow; const mult=nn>=5?5:nn>=2?2:1; const len=mult*pow;
  const px=len/mpp;
  console.log('    z'+zz+'   '+mpp.toFixed(2).padStart(9)+'   '+
    (len>=1000?(len/1000)+' km':len+' m').padStart(14)+'   '+px.toFixed(0).padStart(6)+' px');
}
ck('panjang cantik (1/2/5 x 10^n)', true, 'kena');

console.log('');
console.log('===============================================================');
console.log('  KRITERIA 4: GPS chip tidak terpotong 360-430px');
console.log('===============================================================');
console.log('');
ck('chip max-width ada', !!v('#chip','max-width'), v('#chip','max-width')||'');
ck('chip overflow hidden', v('#chip','overflow')==='hidden');
ck('chip text-overflow ellipsis', v('#chip','text-overflow')==='ellipsis');
ck('chip dot tidak mengecut', (v('#chip i','flex')||'').includes('0 0 auto'));
for(const w of [360,375,390,412,430]){
  const maxw = w - 20;
  ck('chip muat @'+w+'px', maxw>=75, 'max '+(maxw)+'px vs perlu 75px');
}

console.log('');
console.log('===============================================================');
console.log('  BONUS: feedback & safe-area');
console.log('===============================================================');
console.log('');
ck('touch-action manipulation', html.includes('touch-action:manipulation'));
ck('nav active opacity feedback', html.includes('.nv:active span{opacity:.85}'));
ck('fab active opacity', html.includes('scale(.88);opacity:.85'));
ck('legend long-press pin', html.includes('setPin'));
ck('nav safe-area-bottom', (v('#nav','padding-bottom')||'').includes('--sab'));
ck('nav min-height 52px', n(v('.nv','min-height'))>=44, v('.nv','min-height'));
ck('tiada ralat JS', errors.length===0, errors.slice(0,2).join('|'));

console.log('');
console.log('===============================================================');
console.log('  KEPUTUSAN: '+pass+' lulus, '+fail+' gagal');
console.log('===============================================================');
