import fs from 'node:fs';
import path from 'node:path';

const WEB = 'web-kerilla';
const meta = JSON.parse(fs.readFileSync(path.join(WEB,'map-meta.json'),'utf8'));

// ---- ikon (SVG helper bernama SVG untuk elak langgar state S) ----
const I = {
  menu:'M4 6h16M4 12h16M4 18h16',
  share:'M12 3v12m0 0l-4-4m4 4l4-4M5 21h14',
  gps:'__G',
  pin:'M12 21s7-6.5 7-11a7 7 0 10-14 0c0 4.5 7 11 7 11z|@12 10 r2.4',
  measure:'M4 15l6-6 3 3 7-7M20 5v5h-5',
  rec:'__R',
  more:'__M',
  plus:'M12 5v14M5 12h14',
  minus:'M5 12h14',
  layers:'M12 3 3 8l9 5 9-5z|M3 13l9 5 9-5|M3 17.5 12 22l9-4.5',
  close:'M6 6l12 12M18 6L6 18',
  chev:'m9 6 6 6-6 6',
  hex:'M12 2.6 20.5 7.6v9.8L12 22l-8.5-4.6V7.6z|@12 12 r3',
  undo:'M4 9h11a5 5 0 0 1 0 10H8|m8 5-4 4 4 4',
  dl:'M12 3v12m0 0l-4-4m4 4 4-4|M4 20h16',
  info:'@12 12 r9|M12 11v6M12 7.5v.5',
};
const svgIcon = (n,w) => {
  let d = I[n] || '';
  if (n==='gps')  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(w||2)+'" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 4v2m0 12v2m8-8h-2M6 12H4"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/></svg>';
  if (n==='rec')  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(w||2)+'"><rect x="4" y="7" width="16" height="12" rx="2"/><circle cx="12" cy="13" r="3.2"/><path d="M9 7l1.5-2h3L15 7"/></svg>';
  if (n==='more') return '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(w||2)+'" stroke-linecap="round" stroke-linejoin="round"><path d="'+d.split('|')[0]+'"/></svg>';
};

const h = [];
const W = (...a) => h.push(...a);
W('<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8">');
W('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">');
W('<meta name="theme-color" content="#1f4d3f">');
W('<meta name="apple-mobile-web-app-capable" content="yes">');
W('<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">');
W('<title>073 Kerilla — Peta</title><style>');
W(':root{--ink:#16241f;--forest:#1f4d3f;--forest-d:#123128;--sand:#f3efe4;--paper:#fbfaf6;');
W('  --line:#d8d2c2;--accent:#e8823c;--sky:#5b93a6;--mute:#8a8470;--red:#c2453a;--green:#3f8f5a;');
W('  --r:12px;--r-lg:14px;--r-xl:18px;');
W('  --sh:0 2px 8px rgba(18,49,40,.13);--sh-lg:0 6px 20px rgba(18,49,40,.20);--sh-up:0 -4px 20px rgba(18,49,40,.16);');
W('  --sat:env(safe-area-inset-top,0px);--sab:env(safe-area-inset-bottom,0px);');
W('  --sal:env(safe-area-inset-left,0px);--sar:env(safe-area-inset-right,0px);');
W('  --hdr:52px;--nav:62px;}');
W('*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-font-smoothing:antialiased}');
W('html,body{margin:0;height:100%;overflow:hidden;background:var(--sand);color:var(--ink);');
W('  font:14px/1.45 "Segoe UI",system-ui,-apple-system,BlinkMacSystemFont,Roboto,sans-serif;');
W('  overscroll-behavior:none;touch-action:none;user-select:none}');
W('#map{position:fixed;inset:0;overflow:hidden;touch-action:none;background:var(--sand);cursor:grab}');
W('#map.dragging{cursor:grabbing}#world{position:absolute;transform-origin:0 0;will-change:transform}');
W('#world img{position:absolute;pointer-events:none;user-select:none;-webkit-user-drag:none}');
W('.ovl{position:absolute;inset:0;pointer-events:none;z-index:5}');
W('.gps{position:absolute;z-index:12;pointer-events:none}');
W('.gps .h{position:absolute;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;');
W('  background:rgba(91,147,166,.18);border:1.5px solid rgba(91,147,166,.40);animation:pulse 2.4s ease-out infinite}');
W('.gps .d{position:absolute;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;');
W('  background:var(--sky);border:3.5px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.35)}');
W('@keyframes pulse{0%{transform:scale(.55);opacity:.9}70%{transform:scale(1.4);opacity:0}100%{opacity:0}}');
W('.pin-i{position:absolute;z-index:11;pointer-events:none;transform:translate(-50%,-100%);width:30px;height:38px;');
W('  filter:drop-shadow(0 2px 3px rgba(0,0,0,.3))}.pin-i svg{width:100%;height:100%}');
W('.gf{position:absolute;z-index:9;border-radius:50%;border:2.5px dashed var(--accent);background:rgba(232,130,60,.12);pointer-events:none}');
W('.ml{position:absolute;z-index:10;height:4px;background:var(--accent);transform-origin:0 50%;border-radius:2px;pointer-events:none}');
W('#mlabel{position:absolute;z-index:13;background:var(--accent);color:#fff;font-weight:700;font-size:12.5px;');
W('  padding:4px 10px;border-radius:9px;pointer-events:none;transform:translate(-50%,-180%);white-space:nowrap;box-shadow:var(--sh)}');
W('.vtx{position:absolute;z-index:10;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;');
W('  background:#fff;border:3.5px solid var(--accent);pointer-events:none;box-shadow:0 1px 4px rgba(0,0,0,.3)}');
W('#hdr{position:fixed;top:0;left:0;right:0;z-index:40;height:calc(var(--hdr) + var(--sat));');
W('  padding-top:var(--sat);background:var(--forest);color:#eef4ef;display:flex;align-items:center;gap:10px;');
W('  padding-left:calc(10px + var(--sal));padding-right:calc(10px + var(--sar));box-shadow:0 2px 10px rgba(18,49,40,.28)}');
W('.hbtn{width:36px;height:36px;flex:0 0 auto;border-radius:var(--r);border:0;background:rgba(255,255,255,.10);');
W('  color:#eef4ef;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .16s,transform .12s}');
W('.hbtn:active{background:rgba(255,255,255,.22);transform:scale(.93)}.hbtn svg{width:19px;height:19px}');
W('#htitle{flex:1;min-width:0;padding:0 2px}');
W('#htitle b{display:block;font-size:16px;font-weight:600;line-height:1.2;letter-spacing:-.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}');
W('#htitle span{display:block;font-size:11.5px;color:#b9ceb9;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}');
W('#chip{position:fixed;top:calc(var(--hdr) + var(--sat) + 10px);left:calc(10px + var(--sal));z-index:36;');
W('  background:rgba(18,49,40,.85);color:#d7f0c9;font-size:11px;font-weight:600;padding:6px 11px;border-radius:20px;');
W('  display:flex;align-items:center;gap:6px;backdrop-filter:blur(6px);box-shadow:var(--sh);pointer-events:none;');
W('  opacity:0;transform:translateY(-6px);transition:opacity .25s,transform .25s;white-space:nowrap}');
W('#chip.on{opacity:1;transform:translateY(0)}');
W('#chip i{width:7px;height:7px;border-radius:50%;background:#7fe07f;box-shadow:0 0 0 3px rgba(127,224,127,.25)}');
W('#fab{position:fixed;right:calc(12px + var(--sar));bottom:calc(var(--nav) + var(--sab) + 16px);z-index:36;');
W('  display:flex;flex-direction:column;gap:10px}');
W('.fab{width:44px;height:44px;border-radius:var(--r-lg);border:1px solid var(--line);background:var(--paper);');
W('  color:var(--forest-d);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--sh);');
W('  transition:transform .12s,background .16s,box-shadow .16s;animation:fabIn .3s cubic-bezier(.32,.72,0,1) backwards}');
W('.fab:nth-child(1){animation-delay:.05s}.fab:nth-child(2){animation-delay:.09s}');
W('.fab:nth-child(3){animation-delay:.13s}.fab:nth-child(4){animation-delay:.17s}');
W('.fab:active{transform:scale(.88);box-shadow:0 1px 4px rgba(18,49,40,.2)}.fab svg{width:20px;height:20px}');
W('.fab.pri{background:var(--forest);border-color:var(--forest);color:#eef4ef}');
W('.fab.on{background:var(--accent);border-color:var(--accent);color:#fff}');
W('@keyframes fabIn{from{opacity:0;transform:translateX(14px) scale(.9)}to{opacity:1;transform:none}}');
W('#cmp{width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:var(--paper);');
W('  box-shadow:var(--sh);display:flex;align-items:center;justify-content:center;flex-direction:column;');
W('  cursor:pointer;color:var(--forest-d);font-size:9.5px;font-weight:800;letter-spacing:.4px;transition:transform .12s}');
W('#cmp:active{transform:scale(.88)}');
W('#cmp .nd{width:20px;height:20px;color:var(--accent);transition:transform .3s cubic-bezier(.32,.72,0,1)}');
W('#cmp .nd svg{width:100%;height:100%}');
W('#legend{position:fixed;top:calc(var(--hdr) + var(--sat) + 10px);right:calc(10px + var(--sar));z-index:36;');
W('  width:158px;background:rgba(251,250,246,.96);backdrop-filter:blur(10px);border:1px solid var(--line);');
W('  border-radius:var(--r-lg);box-shadow:var(--sh-lg);overflow:hidden;transition:width .22s cubic-bezier(.32,.72,0,1)}');
W('#lghd{padding:9px 12px;display:flex;align-items:center;gap:8px;cursor:pointer;font-size:11.5px;font-weight:700;');
W('  color:var(--forest-d);border-bottom:1px solid var(--line);transition:border-color .2s}');
W('#legend.min #lghd{border-color:transparent}#lghd .t{flex:1}');
W('#lghd .tg{width:16px;height:16px;color:var(--mute);transition:transform .25s}');
W('#lghd .tg svg{width:100%;height:100%}#legend.min #lghd .tg{transform:rotate(-90deg)}');
W('#lgbd{padding:9px 12px 10px;display:flex;flex-direction:column;gap:7px;max-height:280px;overflow:hidden;');
W('  transition:max-height .28s cubic-bezier(.32,.72,0,1),padding .28s,opacity .2s;opacity:1}');
W('#legend.min #lgbd{max-height:0;padding-top:0;padding-bottom:0;opacity:0}');
W('.lgr{display:flex;align-items:center;gap:8px;font-size:10.5px;color:#3c3a30}');
W('.sw{width:12px;height:12px;border-radius:3px;flex:0 0 auto;border:1px solid rgba(0,0,0,.10)}');
W('#nav{position:fixed;left:0;right:0;bottom:0;z-index:40;height:calc(var(--nav) + var(--sab));');
W('  padding-bottom:var(--sab);background:rgba(251,250,246,.97);backdrop-filter:blur(16px) saturate(180%);');
W('  border-top:1px solid var(--line);box-shadow:var(--sh-up);display:flex;align-items:stretch;');
W('  padding-left:calc(6px + var(--sal));padding-right:calc(6px + var(--sar))}');
W('.nv{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;');
W('  background:none;border:0;color:var(--mute);cursor:pointer;font:600 10.5px/1 "Segoe UI",system-ui,sans-serif;');
W('  letter-spacing:.1px;position:relative;transition:color .18s;padding:6px 2px 0;border-radius:10px}');
W('.nv svg{width:21px;height:21px;transition:transform .18s}.nv:active svg{transform:scale(.86)}');
W('.nv.on{color:var(--forest)}');
W('.nv.on::before{content:"";position:absolute;top:0;left:50%;transform:translateX(-50%);width:24px;height:3px;');
W('  border-radius:0 0 3px 3px;background:var(--accent);animation:indIn .22s cubic-bezier(.32,.72,0,1)}');
W('@keyframes indIn{from{width:0;opacity:0}to{width:24px;opacity:1}}');
W('#scrim{position:fixed;inset:0;z-index:48;background:rgba(18,49,40,.34);opacity:0;pointer-events:none;transition:opacity .26s}');
W('#scrim.on{opacity:1;pointer-events:auto}');
W('#sheet{position:fixed;left:0;right:0;bottom:0;z-index:50;background:var(--paper);');
W('  border-radius:var(--r-xl) var(--r-xl) 0 0;box-shadow:var(--sh-up);transform:translateY(103%);');
W('  transition:transform .32s cubic-bezier(.32,.72,0,1);max-height:78vh;display:flex;flex-direction:column;padding-bottom:var(--sab)}');
W('#sheet.on{transform:translateY(0)}');
W('#shnd{padding:9px 0 5px;display:flex;justify-content:center}#shnd i{width:36px;height:5px;border-radius:3px;background:#c9c3b3}');
W('#shd{display:flex;align-items:center;gap:12px;padding:3px 16px 12px}');
W('#shd h2{margin:0;font-size:17px;font-weight:700;flex:1;letter-spacing:-.3px;color:var(--forest-d)}');
W('#shd button{width:34px;height:34px;border-radius:50%;border:0;background:var(--sand);color:var(--mute);');
W('  display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .12s}');
W('#shd button:active{transform:scale(.9)}#shd button svg{width:17px;height:17px}');
W('#shb{padding:6px 0 22px;overflow-y:auto;-webkit-overflow-scrolling:touch;flex:1;border-top:1px solid var(--line)}');
W('.opt{display:flex;align-items:center;gap:13px;padding:13px 16px;cursor:pointer;background:none;border:0;');
W('  width:100%;text-align:left;font:inherit;color:var(--ink);transition:background .14s}.opt:active{background:var(--sand)}');
W('.opt .oi{width:40px;height:40px;flex:0 0 auto;border-radius:var(--r);background:var(--sand);display:flex;');
W('  align-items:center;justify-content:center;color:var(--forest);transition:background .16s,color .16s}');
W('.opt .oi svg{width:20px;height:20px}.opt.on .oi{background:var(--forest);color:#eef4ef}');
W('.opt .ot{flex:1;min-width:0}.opt .ot b{display:block;font-size:14.5px;font-weight:600;letter-spacing:-.1px}');
W('.opt .ot em{display:block;font-style:normal;font-size:12px;color:var(--mute);margin-top:1px}');
W('.opt .ch{color:#c9c3b3}.opt .ch svg{width:16px;height:16px}');
W('.kv{display:flex;justify-content:space-between;gap:12px;padding:12px 16px;font-size:13.5px;border-bottom:1px solid #ece7dc}');
W('.kv:last-child{border-bottom:0}.kv .k{color:var(--mute)}');
W('.kv .v{font-weight:600;text-align:right;max-width:58%;word-break:break-word;font-variant-numeric:tabular-nums}');
W('.kv .v.mono{font-family:ui-monospace,Menlo,monospace;font-size:12.5px}');
W('.hint{padding:12px 16px 3px;font-size:11px;font-weight:800;color:var(--mute);text-transform:uppercase;letter-spacing:.7px}');
W('.bbtn{display:flex;align-items:center;justify-content:center;gap:9px;margin:12px 16px 2px;padding:15px;');
W('  border-radius:var(--r-lg);border:0;font-size:15px;font-weight:700;cursor:pointer;width:calc(100% - 32px);');
W('  background:var(--forest);color:#eef4ef;transition:transform .12s,background .16s}');
W('.bbtn:active{transform:scale(.985);background:var(--forest-d)}.bbtn.g{background:var(--sand);color:var(--forest-d)}');
W('.bbtn svg{width:19px;height:19px}');
W('#toast{position:fixed;left:50%;top:calc(var(--hdr) + var(--sat) + 66px);transform:translate(-50%,-6px);z-index:60;');
W('  background:rgba(18,49,40,.95);color:#eef4ef;padding:11px 18px;border-radius:var(--r-lg);font-size:13px;');
W('  font-weight:500;opacity:0;pointer-events:none;transition:opacity .24s,transform .24s;');
W('  max-width:calc(100vw - 32px);text-align:center;box-shadow:var(--sh-lg);backdrop-filter:blur(8px)}');
W('#toast.on{opacity:1;transform:translate(-50%,0)}#toast.ok{background:rgba(63,143,90,.96)}#toast.err{background:rgba(194,69,58,.96)}');
W('#intro{position:fixed;inset:0;z-index:90;background:var(--paper);display:flex;flex-direction:column;');
W('  align-items:center;justify-content:center;padding:24px;padding-top:calc(24px + var(--sat));');
W('  padding-bottom:calc(24px + var(--sab));text-align:center;gap:13px;overflow:auto}');
W('#intro .bg{width:70px;height:70px;border-radius:20px;background:var(--forest);color:#eef4ef;display:flex;');
W('  align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(31,77,63,.35)}#intro .bg svg{width:38px;height:38px}');
W('#intro h1{font-size:21px;margin:0;font-weight:700;letter-spacing:-.5px;color:var(--forest-d)}');
W('#intro p{color:var(--mute);margin:0;max-width:420px;font-size:13.5px;line-height:1.6}');
W('#intro .card{background:var(--sand);border-radius:var(--r-lg);width:100%;max-width:420px;text-align:left;padding:4px 0;overflow:hidden}');
W('#intro .card .kv{border-color:#e4ddcd;padding:10px 15px;font-size:13px}');
W('#intro button{width:100%;max-width:420px;padding:16px;border-radius:var(--r-lg);border:0;font-size:15.5px;');
W('  font-weight:700;cursor:pointer;background:var(--forest);color:#eef4ef;display:flex;align-items:center;');
W('  justify-content:center;gap:9px;transition:transform .12s,background .16s}');
W('#intro button:active{transform:scale(.985);background:var(--forest-d)}');
W('#intro button.g{background:var(--sand);color:var(--forest-d)}#intro button svg{width:20px;height:20px}');
W('@media (max-height:440px){:root{--hdr:48px;--nav:54px}#legend{display:none}.nv span{display:none}}');
W('</style></head><body>');
W('<div id="map"><div id="world"></div><div class="ovl" id="ov"></div></div>');
W('<header id="hdr">');
W('<button class="hbtn" id="h-menu" aria-label="Menu">'+svgIcon('menu')+'</button>');
W('<div id="htitle"><b>073 Kerilla</b><span id="hsub">memuatkan…</span></div>');
W('<button class="hbtn" id="h-share" aria-label="Kongsi">'+svgIcon('share')+'</button>');
W('</header>');
W('<div id="chip"><i></i><span id="chipt">GPS</span></div>');
W('<div id="legend" class="min"><div id="lghd"><span class="t">Legenda</span><span class="tg">'+svgIcon('chev')+'</span></div><div id="lgbd"></div></div>');
W('<div id="fab">');
W('<button class="fab" id="f-loc" aria-label="Lokasi">'+svgIcon('gps')+'</button>');
W('<button class="fab" id="f-in" aria-label="Zoom masuk">'+svgIcon('plus')+'</button>');
W('<button class="fab" id="f-out" aria-label="Zoom keluar">'+svgIcon('minus')+'</button>');
W('<div id="cmp" role="button" aria-label="Kompas"><span class="nd" id="nd"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 16.5 13 12 10.6 7.5 13z"/></svg></span>N</div>');
W('</div>');
W('<nav id="nav">');
W('<button class="nv" data-nv="loc">'+svgIcon('gps')+'<span>Lokasi</span></button>');
W('<button class="nv" data-nv="pin">'+svgIcon('pin')+'<span>Placemark</span></button>');
W('<button class="nv" data-nv="measure">'+svgIcon('measure')+'<span>Ukur</span></button>');
W('<button class="nv" data-nv="rec">'+svgIcon('rec')+'<span>Rakam</span></button>');
W('<button class="nv" data-nv="more">'+svgIcon('more')+'<span>Lagi</span></button>');
W('</nav>');
W('<div id="scrim"></div>');
W('<div id="sheet"><div id="shnd"><i></i></div>');
W('<div id="shd"><h2 id="sht">Status</h2><button id="shx">'+svgIcon('close')+'</button></div>');
W('<div id="shb"></div></div>');
W('<div id="toast"></div>');
W('<div id="intro">');
W('<div class="bg">'+svgIcon('layers')+'</div>');
W('<h1>073 Kerilla Aug26 Task Map</h1>');
W('<p>Peta GeoPDF sebenar (QGIS) — Kelantan, Malaysia</p>');
W('<div class="card">');
W('<div class="kv"><span class="k">Kawasan</span><span class="v">8.99 × 6.53 km</span></div>');
W('<div class="kv"><span class="k">Resolusi</span><span class="v">2.64 m/piksel</span></div>');
W('<div class="kv"><span class="k">Zoom</span><span class="v">5 peringkat</span></div>');
W('<div class="kv"><span class="k">Ketepatan</span><span class="v">0.000 m</span></div>');
W('</div>');
W('<button id="b-gps">'+svgIcon('gps')+'<span>Cari Lokasi Saya</span></button>');
W('<button id="b-map" class="g">Lihat Peta</button>');
W('</div>');

// ---- JS ----
W('<script>');
W('var JS = ' + JSON.stringify({ I: I }) + ';');
W('const IC = {};');
W('for (const k in JS.I) IC[k] = svgIcon(k);');
W('function svgIcon(n,w){');
W('  const two=(w||2);');
W('  if(n==="gps") return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+two+'" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 4v2m0 12v2m8-8h-2M6 12H4"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/></svg>';');
W('  if(n==="rec") return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+two+'"><rect x="4" y="7" width="16" height="12" rx="2"/><circle cx="12" cy="13" r="3.2"/><path d="M9 7l1.5-2h3L15 7"/></svg>';');
W('  if(n==="more") return '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';');
W('  const d=(JS.I[n]||"").split("|")[0];');
W('  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+two+'" stroke-linecap="round" stroke-linejoin="round"><path d="'+d+'"/></svg>';');
W('}');
W(fs.readFileSync('app-core.js','utf8'));
W('</script></body></html>');

fs.writeFileSync(path.join(WEB,'index.html'), h.join(String.fromCharCode(10)));
fs.writeFileSync(path.join(WEB,'app.html'), h.join(String.fromCharCode(10)));
fs.writeFileSync(path.join(WEB,'map.html'), h.join(String.fromCharCode(10)));
console.log('v3 dibina:', (fs.statSync(path.join(WEB,'index.html')).size/1024).toFixed(1),'KB');
