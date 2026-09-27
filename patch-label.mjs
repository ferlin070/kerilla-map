import fs from 'node:fs';
let s=fs.readFileSync('app-core.js','utf8');
const NL=String.fromCharCode(10);
const log=[];
const ins=(find,repl,label)=>{
  if(!s.includes(find)){ log.push('GAGAL: '+label); return; }
  s=s.replace(find,repl); log.push('OK: '+label);
};

// Lapisan label nombor: muat atlas + json, lukis dalam draw()
// Guna canvas-style div dengan background-image atlas, crop via background-position.
const lbl = [
'/* ===== LAPISAN LABEL NOMBER TASK ===== */',
'let LBL=null;',
'async function loadLabels(){',
'  try{',
'    const r=await fetch("labels.json",{cache:"no-store"});',
'    LBL=await r.json();',
'    const im=document.createElement("img");',
'    im.src="labels.png?v="+APP_V; im.id="lblatlas";',
'    im.style.display="none";',
'    document.body.appendChild(im);',
'    if(META) render();',
'  }catch(e){ console.warn("label gagal",e); }',
'}',
'loadLabels();'
].join(NL);
ins('/* ===== JARAK GEODESIK =====', lbl+NL+'/* ===== JARAK GEODESIK =====', 'loadLabels fn');

// Dalam draw(): selepas pins, sebelum GPS — lukis label yang masuk viewport
ins(['  if(S.gps){ const f=ll2px(S.gps.lon,S.gps.lat), q=P(f.col,f.row);',
     '    const e=document.createElement("div"); e.className="gps";',
     '    e.style.left=q.x+"px"; e.style.top=q.y+"px";',
     '    e.innerHTML=\'<div class="h"></div><div class="d"></div>\'; ov.appendChild(e); }',
     '}'].join(NL),
['  if(S.gps){ const f=ll2px(S.gps.lon,S.gps.lat), q=P(f.col,f.row);',
 '    const e=document.createElement("div"); e.className="gps";',
 '    e.style.left=q.x+"px"; e.style.top=q.y+"px";',
 '    e.innerHTML=\'<div class="h"></div><div class="d"></div>\'; ov.appendChild(e); }',
 '  // ===== LABEL NOMBER TASK (sentiasa nampak) =====',
 '  if(LBL && LBL.length){',
 '    // label dirender pada saiz asal peta (kali k = paparan sebenar),',
 '    // dengan saiz MINIMUM supaya sentiasa boleh dibaca.',
 '    const minh=13;   // px skrin minimum untuk label',
 '    const im=$("#lblatlas");',
 '    for(const lb of LBL){',
 '      // kedudukan pusat label dalam koordinat peta penuh (3408x2452)',
 '      // => dalam viewport: P(lb.x, lb.y)',
 '      const q=P(lb.x, lb.y);',
 '      if(q.x<-40||q.y<-40||q.x>S.vw+40||q.y>S.vh+40) continue;',
 '      // saiz label pada skrin = lb.w * (k/sc) kerna lb dalam koordinat level penuh',
 '      const fsc=k/sc;   // faktor skala sebenar dunia ke skrin',
 '      let w=lb.sw*fsc, h=lb.sh*fsc;',
 '      let scale=1;',
 '      if(h<minh){ scale=minh/h; w*=scale; h=minh; }',
 '      if(h>90) continue;   // terlalu besar (zoom jauh masuk) - biar peta asal tunjuk',
 '      const e=document.createElement("div"); e.className="lblnum";',
 '      e.style.left=(q.x-w/2)+"px"; e.style.top=(q.y-h/2)+"px";',
 '      e.style.width=w+"px"; e.style.height=h+"px";',
 '      e.style.backgroundImage="url(labels.png?v="+APP_V+")";',
 '      e.style.backgroundPosition=(-lb.sx*scale)+"px "+(-lb.sy*scale)+"px";',
 '      e.style.backgroundSize=(1024*scale)+"px "+(512*scale)+"px";',
 '      ov.appendChild(e);',
 '    }',
 '  }',
 '}'].join(NL),
'label drawing dalam draw()');

fs.writeFileSync('app-core.js',s);
console.log(log.join(NL));
