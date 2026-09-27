/**
 * build-avenza-style.mjs — App gaya AVENZA MAPS.
 *
 * Ikut design Avenza sebenar:
 *   - Tema TERANG (bukan gelap)
 *   - Ikon GARIS SVG (bukan emoji)
 *   - 5 ikon utama di bar bawah, BESAR
 *   - Panel LERAI naik dari bawah (bottom sheet)
 *   - Butang zoom/kompas bulat terapung
 *   - Saiz sentuh >60px
 */
import fs from 'node:fs';
import path from 'node:path';

const WEB = 'web-kerilla';
const meta = JSON.parse(fs.readFileSync(path.join(WEB, 'map-meta.json'), 'utf8'));

// Ikon SVG gaya Avenza (garis, bukan emoji)
const ICON = {
  locate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="12" r="8.5"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-6.2 7-11.5A7 7 0 0 0 5 10.5C5 15.8 12 22 12 22z"/><circle cx="12" cy="10.5" r="2.6"/></svg>',
  measure: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17.5 17.5 3l3.5 3.5L6.5 21z"/><path d="M8 12.5l2 2M11 9.5l2 2M14 6.5l2 2"/></svg>',
  geofence: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2.5 21 8v8l-9 5.5L3 16V8z"/><circle cx="12" cy="12" r="3"/></svg>',
  track: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5" stroke-dasharray="3 3"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2.5 2.5 7.5 12 12.5l9.5-5z"/><path d="M2.5 12.5 12 17.5l9.5-5"/><path d="M2.5 17 12 22l9.5-5"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13 13l-4.5 2.5L11 11z" fill="currentColor"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 11l5 5 5-5"/><path d="M4 20h16"/></svg>',
  undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h11a5 5 0 0 1 0 10H8"/><path d="M8 5 4 9l4 4"/></svg>',
};

const ICONS_DEF = "const ICON = {\n  locate: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><circle cx=\"12\" cy=\"12\" r=\"3.5\"/><circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 1v3M12 20v3M1 12h3M20 12h3\"/></svg>',\n  pin: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 22s7-6.2 7-11.5A7 7 0 0 0 5 10.5C5 15.8 12 22 12 22z\"/><circle cx=\"12\" cy=\"10.5\" r=\"2.6\"/></svg>',\n  measure: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 17.5 17.5 3l3.5 3.5L6.5 21z\"/><path d=\"M8 12.5l2 2M11 9.5l2 2M14 6.5l2 2\"/></svg>',\n  geofence: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"><path d=\"M12 2.5 21 8v8l-9 5.5L3 16V8z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>',\n  track: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><circle cx=\"12\" cy=\"12\" r=\"8.5\" stroke-dasharray=\"3 3\"/><circle cx=\"12\" cy=\"12\" r=\"3\" fill=\"currentColor\" stroke=\"none\"/></svg>',\n  layers: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"><path d=\"M12 2.5 2.5 7.5 12 12.5l9.5-5z\"/><path d=\"M2.5 12.5 12 17.5l9.5-5\"/><path d=\"M2.5 17 12 22l9.5-5\"/></svg>',\n  more: '<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><circle cx=\"5\" cy=\"12\" r=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><circle cx=\"19\" cy=\"12\" r=\"2\"/></svg>',\n  menu: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><path d=\"M3 6h18M3 12h18M3 18h18\"/></svg>',\n  compass: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M15.5 8.5 13 13l-4.5 2.5L11 11z\" fill=\"currentColor\"/></svg>',\n  close: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><path d=\"M5 5l14 14M19 5 5 19\"/></svg>',\n  download: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3v12M7 11l5 5 5-5\"/><path d=\"M4 20h16\"/></svg>',\n  undo: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 9h11a5 5 0 0 1 0 10H8\"/><path d=\"M8 5 4 9l4 4\"/></svg>',\n};";

const html = `<!DOCTYPE html>
<html lang="ms">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#ffffff">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<title>073 Kerilla — Avenza Style</title>
<style>
  :root{
    --blue:#0a84ff; --blue-d:#0060df; --bg:#ffffff; --bg2:#f2f2f7;
    --ink:#1c1c1e; --ink2:#6c6c70; --line:#d1d1d6;
    --green:#30d158; --red:#ff453a; --amber:#ff9f0a;
    --sat:env(safe-area-inset-top,0px);
    --sab:env(safe-area-inset-bottom,0px);
    --sal:env(safe-area-inset-left,0px);
    --sar:env(safe-area-inset-right,0px);
    --shadow:0 2px 10px rgba(0,0,0,.14);
    --shadow-lg:0 -4px 28px rgba(0,0,0,.18);
  }
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;
    -webkit-font-smoothing:antialiased}
  html,body{margin:0;height:100%;overflow:hidden;background:var(--bg);color:var(--ink);
    font:16px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,sans-serif;
    overscroll-behavior:none;touch-action:none;user-select:none}

  /* ---------- PETA ---------- */
  #map{position:fixed;inset:0;overflow:hidden;touch-action:none;background:#e5e5ea;cursor:grab}
  #map.dragging{cursor:grabbing}
  #world{position:absolute;transform-origin:0 0;will-change:transform}
  #world img{position:absolute;pointer-events:none;user-select:none;-webkit-user-drag:none}
  .ovl{position:absolute;inset:0;pointer-events:none;z-index:5}

  .gps{position:absolute;z-index:12;pointer-events:none}
  .gps .halo{position:absolute;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;
    background:rgba(10,132,255,.16);border:1.5px solid rgba(10,132,255,.35);
    animation:pulse 2.4s ease-out infinite}
  .gps .dot{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;
    background:var(--blue);border:3.5px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.4)}
  @keyframes pulse{0%{transform:scale(.5);opacity:.9}70%{transform:scale(1.45);opacity:0}100%{opacity:0}}

  .pin-i{position:absolute;z-index:11;pointer-events:none;transform:translate(-50%,-100%);
    width:34px;height:44px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}
  .pin-i svg{width:100%;height:100%}
  .gf{position:absolute;z-index:9;border-radius:50%;border:2.5px dashed var(--green);
    background:rgba(48,209,88,.12);pointer-events:none}
  .ml{position:absolute;z-index:10;height:4px;background:var(--amber);transform-origin:0 50%;
    border-radius:2px;pointer-events:none;box-shadow:0 0 0 1px rgba(0,0,0,.15)}
  #mlabel{position:absolute;z-index:13;background:var(--amber);color:#fff;font-weight:700;
    font-size:14px;padding:4px 11px;border-radius:9px;pointer-events:none;
    transform:translate(-50%,-180%);white-space:nowrap;box-shadow:var(--shadow)}
  .vtx{position:absolute;z-index:10;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;
    background:#fff;border:4px solid var(--amber);pointer-events:none;box-shadow:0 1px 4px rgba(0,0,0,.3)}

  /* ---------- BAR ATAS (gaya Avenza) ---------- */
  #topbar{position:fixed;top:0;left:0;right:0;z-index:40;
    padding-top:var(--sat);
    background:rgba(255,255,255,.94);backdrop-filter:blur(20px) saturate(180%);
    border-bottom:1px solid var(--line);
    display:flex;align-items:center;gap:4px;
    height:calc(56px + var(--sat));
    padding-left:calc(6px + var(--sal));padding-right:calc(6px + var(--sar))}
  .tbtn{width:56px;height:56px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;
    background:none;border:0;color:var(--blue);cursor:pointer;border-radius:12px}
  .tbtn:active{background:rgba(10,132,255,.1)}
  .tbtn svg{width:27px;height:27px}
  #maptitle{flex:1;min-width:0;text-align:center;padding:0 4px}
  #maptitle b{display:block;font-size:16px;font-weight:600;white-space:nowrap;overflow:hidden;
    text-overflow:ellipsis;letter-spacing:-.3px;color:var(--ink)}
  #maptitle span{display:block;font-size:12px;color:var(--ink2);margin-top:1px;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #gpschip{position:absolute;top:calc(var(--sat) + 62px);left:50%;transform:translateX(-50%);
    z-index:35;background:rgba(48,209,88,.96);color:#fff;font-size:12.5px;font-weight:700;
    padding:7px 15px;border-radius:999px;box-shadow:var(--shadow);white-space:nowrap;
    opacity:0;transition:opacity .25s;pointer-events:none}
  #gpschip.on{opacity:1}

  /* ---------- BUTANG TERAPUNG (kanan) ---------- */
  #float{position:fixed;right:calc(12px + var(--sar));
    bottom:calc(96px + var(--sab));z-index:35;
    display:flex;flex-direction:column;gap:12px}
  .fbtn{width:60px;height:60px;border-radius:50%;border:0;
    background:rgba(255,255,255,.96);backdrop-filter:blur(20px);
    color:var(--ink);display:flex;align-items:center;justify-content:center;
    box-shadow:var(--shadow);cursor:pointer;transition:transform .1s,background .15s}
  .fbtn:active{transform:scale(.9);background:#e5e5ea}
  .fbtn.on{background:var(--blue);color:#fff}
  .fbtn svg{width:29px;height:29px}
  .fbtn.txt{font-size:30px;font-weight:300;color:var(--blue);line-height:1}
  #cmp{width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,.96);
    backdrop-filter:blur(20px);box-shadow:var(--shadow);display:flex;align-items:center;
    justify-content:center;flex-direction:column;gap:0;color:var(--ink2);font-size:11px;
    font-weight:700;position:relative}
  #cmp .nd{width:22px;height:22px;color:var(--red);transition:transform .25s}
  #cmp .nd svg{width:100%;height:100%}

  /* ---------- BAR BAWAH (5 ikon utama, gaya Avenza) ---------- */
  #tabbar{position:fixed;left:0;right:0;bottom:0;z-index:40;
    background:rgba(255,255,255,.96);backdrop-filter:blur(20px) saturate(180%);
    border-top:1px solid var(--line);
    display:flex;align-items:stretch;
    height:calc(64px + var(--sab));
    padding-bottom:var(--sab);
    padding-left:var(--sal);padding-right:var(--sar)}
  .tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:3px;background:none;border:0;color:var(--ink2);cursor:pointer;
    font-size:11.5px;font-weight:600;letter-spacing:-.1px;padding:0 2px;
    transition:color .15s;position:relative}
  .tab svg{width:29px;height:29px;stroke-width:1.9}
  .tab:active{background:rgba(0,0,0,.04)}
  .tab.on{color:var(--blue)}
  .tab.on::after{content:'';position:absolute;top:0;left:22%;right:22%;height:3px;
    background:var(--blue);border-radius:0 0 3px 3px}

  /* ---------- SHEET (panel leraikan gaya Avenza) ---------- */
  #scrim{position:fixed;inset:0;z-index:48;background:rgba(0,0,0,.32);
    opacity:0;pointer-events:none;transition:opacity .28s}
  #scrim.on{opacity:1;pointer-events:auto}
  #sheet{position:fixed;left:0;right:0;bottom:0;z-index:50;
    background:#fff;border-radius:20px 20px 0 0;
    box-shadow:var(--shadow-lg);
    transform:translateY(102%);transition:transform .32s cubic-bezier(.32,.72,0,1);
    max-height:76vh;display:flex;flex-direction:column;
    padding-bottom:var(--sab)}
  #sheet.on{transform:translateY(0)}
  #shandle{padding:10px 0 6px;display:flex;justify-content:center;flex:0 0 auto;cursor:grab}
  #shandle i{width:38px;height:5px;border-radius:3px;background:#c7c7cc;display:block}
  #shead{display:flex;align-items:center;gap:12px;padding:2px 18px 12px;flex:0 0 auto;
    border-bottom:1px solid var(--line)}
  #shead h2{margin:0;font-size:19px;font-weight:700;flex:1;letter-spacing:-.4px}
  #shead button{width:44px;height:44px;border-radius:50%;border:0;background:#e5e5ea;
    color:var(--ink2);display:flex;align-items:center;justify-content:center;cursor:pointer}
  #shead button svg{width:21px;height:21px}
  #sbody{padding:8px 0 24px;overflow-y:auto;-webkit-overflow-scrolling:touch;flex:1}

  /* pilihan dalam sheet */
  .opt{display:flex;align-items:center;gap:15px;padding:15px 18px;cursor:pointer;
    background:none;border:0;width:100%;text-align:left;font:inherit;color:var(--ink)}
  .opt:active{background:var(--bg2)}
  .opt .oi{width:44px;height:44px;flex:0 0 auto;border-radius:12px;background:var(--bg2);
    display:flex;align-items:center;justify-content:center;color:var(--blue)}
  .opt .oi svg{width:24px;height:24px}
  .opt .ot{flex:1;min-width:0}
  .opt .ot b{display:block;font-size:16px;font-weight:600;letter-spacing:-.2px}
  .opt .ot span{display:block;font-size:13px;color:var(--ink2);margin-top:1px}
  .opt.active .oi{background:var(--blue);color:#fff}
  .opt .chev{color:#c7c7cc;flex:0 0 auto}
  .opt .chev svg{width:18px;height:18px}
  .sep{height:8px;background:var(--bg2);margin:8px 0}
  .shint{padding:12px 18px 4px;font-size:12.5px;color:var(--ink2);text-transform:uppercase;
    letter-spacing:.6px;font-weight:700}

  /* senarai status / rekod */
  .kv{display:flex;justify-content:space-between;gap:14px;padding:13px 18px;
    border-bottom:1px solid var(--line);font-size:15px}
  .kv:last-child{border-bottom:0}
  .kv .k{color:var(--ink2)}
  .kv .v{font-weight:600;font-variant-numeric:tabular-nums;text-align:right;
    max-width:56%;word-break:break-word}
  .kv .v.mono{font-family:ui-monospace,Menlo,monospace;font-size:13.5px}

  /* butang besar dalam sheet */
  .bigbtn{display:flex;align-items:center;justify-content:center;gap:10px;
    margin:14px 18px 4px;padding:17px;border-radius:14px;border:0;font-size:17px;
    font-weight:700;cursor:pointer;background:var(--blue);color:#fff;width:calc(100% - 36px)}
  .bigbtn:active{transform:scale(.985);background:var(--blue-d)}
  .bigbtn.red{background:var(--red)}
  .bigbtn.grey{background:#e5e5ea;color:var(--ink)}
  .bigbtn svg{width:23px;height:23px}

  /* toast */
  #toast{position:fixed;left:50%;top:calc(var(--sat) + 116px);transform:translateX(-50%);
    z-index:60;background:rgba(28,28,30,.94);color:#fff;padding:13px 20px;border-radius:13px;
    font-size:15px;font-weight:500;opacity:0;transition:opacity .25s,transform .25s;
    pointer-events:none;max-width:calc(100vw - 32px);text-align:center;
    box-shadow:0 8px 30px rgba(0,0,0,.3);backdrop-filter:blur(10px)}
  #toast.show{opacity:1;transform:translateX(-50%) translateY(4px)}
  #toast.ok{background:rgba(36,138,61,.96)}
  #toast.err{background:rgba(191,38,32,.96)}

  /* intro */
  #intro{position:fixed;inset:0;z-index:90;background:#fff;display:flex;flex-direction:column;
    align-items:center;justify-content:center;padding:26px;padding-top:calc(26px + var(--sat));
    padding-bottom:calc(26px + var(--sab));text-align:center;gap:14px;overflow:auto}
  #intro .badge{width:76px;height:76px;border-radius:20px;background:var(--blue);
    display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 8px 26px rgba(10,132,255,.4)}
  #intro .badge svg{width:42px;height:42px}
  #intro h1{font-size:23px;margin:0;font-weight:800;letter-spacing:-.6px}
  #intro p{color:var(--ink2);margin:0;max-width:430px;font-size:15px;line-height:1.6}
  #intro .card{background:var(--bg2);border-radius:16px;padding:4px 0;width:100%;max-width:430px;text-align:left}
  #intro .card .kv{border-color:#dcdce1}
  #intro button{width:100%;max-width:430px;padding:18px;border-radius:15px;border:0;
    font-size:17px;font-weight:700;cursor:pointer;background:var(--blue);color:#fff;
    display:flex;align-items:center;justify-content:center;gap:10px}
  #intro button.ghost{background:var(--bg2);color:var(--blue)}
  #intro button:active{transform:scale(.985)}
  #intro button svg{width:23px;height:23px}

  @media (max-height:430px){
    #float{bottom:calc(86px + var(--sab))}
    #float .fbtn,#cmp{width:52px;height:52px}
    .tab span{display:none}
  }
</style>
</head>
<body>

<div id="map"><div id="world"></div><div class="ovl" id="ov"></div></div>

<!-- BAR ATAS -->
<div id="topbar">
  <button class="tbtn" id="tb-menu" aria-label="Menu"></button>
  <div id="maptitle">
    <b>073 Kerilla</b>
    <span id="sub">memuatkan...</span>
  </div>
  <button class="tbtn" id="tb-download" aria-label="Muat turun"></button>
</div>
<div id="gpschip">GPS aktif</div>

<!-- BUTANG TERAPUNG -->
<div id="float">
  <button class="fbtn" id="fb-locate" aria-label="Lokasi"></button>
  <button class="fbtn" id="fb-zin" aria-label="Zoom masuk"><span class="txt">+</span></button>
  <button class="fbtn" id="fb-zout" aria-label="Zoom keluar"><span class="txt">−</span></button>
  <div id="cmp"><span class="nd" id="nd"></span>N</div>
</div>

<!-- BAR BAWAH (5 ikon) -->
<div id="tabbar">
  <button class="tab" data-tab="locate"><span class="ti"></span><span>Lokasi</span></button>
  <button class="tab" data-tab="pin"><span class="ti"></span><span>Placemark</span></button>
  <button class="tab" data-tab="measure"><span class="ti"></span><span>Ukur</span></button>
  <button class="tab" data-tab="track"><span class="ti"></span><span>Rakam</span></button>
  <button class="tab" data-tab="more"><span class="ti"></span><span>Lagi</span></button>
</div>

<!-- SHEET -->
<div id="scrim"></div>
<div id="sheet">
  <div id="shandle"><i></i></div>
  <div id="shead">
    <h2 id="stitle">Status</h2>
    <button id="sclose"></button>
  </div>
  <div id="sbody"></div>
</div>

<div id="toast"></div>

<div id="intro">
  <div class="badge" id="ibadge"></div>
  <h1>073 Kerilla Aug26 Task Map</h1>
  <p>Peta GeoPDF sebenar dari QGIS — Kelantan, Malaysia</p>
  <div class="card">
    <div class="kv"><span class="k">Kawasan</span><span class="v">8.99 × 6.53 km</span></div>
    <div class="kv"><span class="k">Resolusi</span><span class="v">2.64 m/piksel</span></div>
    <div class="kv"><span class="k">Zoom</span><span class="v">5 peringkat</span></div>
    <div class="kv"><span class="k">Ketepatan</span><span class="v">0.000 m</span></div>
  </div>
  <button id="btn-go"></button>
  <button id="btn-map" class="ghost">Lihat Peta Dahulu</button>
</div>

<script>
const TILE = 256;
let META = null;
const S = {
  scale: .5, cx: 0, cy: 0, vw: 0, vh: 0, tiles: new Map(),
  gps: null, acc: null, watchId: null, follow: true,
  mode: null, pins: [], measure: [], geofences: [],
  trackPts: [], recording: false, drawn: {},
};
const $ = s => document.querySelector(s);
const map = $('#map'), world = $('#world'), ov = $('#ov');


/* ikon */
function svg(name){ const t = ICON[name] || ''; return t.replace('<svg', '<svg fill="none"'); }
function setIcons(){
  $('#tb-menu').innerHTML = ICON.menu;
  $('#tb-download').innerHTML = ICON.download;
  $('#fb-locate').innerHTML = ICON.locate;
  $('#nd').innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 16 12 12 10 8 12z"/></svg>';
  $('#sclose').innerHTML = ICON.close;
  $('#ibadge').innerHTML = ICON.layers;
  $('#btn-go').innerHTML = ICON.locate + '<span>Cari Lokasi Saya</span>';
  const tabs = { locate:'locate', pin:'pin', measure:'measure', track:'track', more:'more' };
  document.querySelectorAll('.tab').forEach(t => {
    const i = t.querySelector('.ti'); if (i) i.innerHTML = ICON[tabs[t.dataset.tab]];
  });
}

/* transform */
const px2ll = (col,row) => { const t=META.transform;
  return { lon:t.A*col+t.B*row+t.C, lat:t.D*col+t.E*row+t.F }; };
const ll2px = (lon,lat) => { const t=META.transform;
  const det=t.A*t.E-t.B*t.D, dx=lon-t.C, dy=lat-t.F;
  return { col:(t.E*dx-t.B*dy)/det, row:(-t.D*dx+t.A*dy)/det }; };

function hav(lon1,lat1,lon2,lat2){ const R=6371008.8,r=d=>d*Math.PI/180;
  const dLat=r(lat2-lat1),dLon=r(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(r(lat1))*Math.cos(r(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(a))); }
const fmtD = m => m==null?'—':(m<1000?m.toFixed(1)+' m':(m/1000).toFixed(2)+' km');
function toast(msg,ms=2800,kind=''){ const t=$('#toast'); t.textContent=msg;
  t.className='show '+kind; clearTimeout(t._t);
  t._t=setTimeout(()=>t.className='',ms); }

function levelFor(sc){ const target=(1/sc)*META.gsdMeters;
  let b=META.levels[META.levels.length-1], bd=Infinity;
  for(const l of META.levels){ const d=Math.abs(l.metersPerPixel-target); if(d<bd){bd=d;b=l;} }
  return b; }

function render(){
  if(!META) return;
  S.vw=map.clientWidth; S.vh=map.clientHeight;
  if(S.follow && S.gps){ const fp=ll2px(S.gps.lon,S.gps.lat); S.cx=fp.col; S.cy=fp.row; }
  const lv=levelFor(S.scale), sc=lv.scale, k=S.scale*sc;
  if(!S.follow){
    const hw=S.vw/2/S.scale, hh=S.vh/2/S.scale;
    const mx=S.vw*.16/S.scale, my=S.vh*.16/S.scale;
    S.cx = (META.width>2*hw) ? Math.max(hw-mx,Math.min(META.width-hw+mx,S.cx)) : META.width/2;
    S.cy = (META.height>2*hh) ? Math.max(hh-my,Math.min(META.height-hh+my,S.cy)) : META.height/2;
  }
  world.style.transform='translate('+(-(S.cx/sc)*k+S.vw/2)+'px,'+(-(S.cy/sc)*k+S.vh/2)+'px) scale('+k+')';
  const need=new Map(), lx=S.cx/sc, ly=S.cy/sc, hw=S.vw/2/k, hh=S.vh/2/k;
  for(let tx=Math.floor((lx-hw)/TILE);tx<=Math.floor((lx+hw)/TILE);tx++)
    for(let ty=Math.floor((ly-hh)/TILE);ty<=Math.floor((ly+hh)/TILE);ty++){
      if(tx<0||ty<0||tx>=lv.tilesX||ty>=lv.tilesY) continue;
      need.set(lv.z+'_'+tx+'_'+ty,{z:lv.z,x:tx,y:ty});
    }
  for(const [key,el] of S.tiles) if(!need.has(key)){ el.remove(); S.tiles.delete(key); }
  for(const [key,t] of need){
    if(S.tiles.has(key)) continue;
    const im=document.createElement('img');
    im.src='tiles/'+t.z+'/'+t.x+'_'+t.y+'.png';
    im.style.left=(t.x*TILE)+'px'; im.style.top=(t.y*TILE)+'px';
    im.width=TILE; im.height=TILE; world.appendChild(im); S.tiles.set(key,im);
  }
  overlay(sc,k);
}

function overlay(sc,k){
  ov.innerHTML='';
  const p=(col,row)=>({ x:(col/sc-S.cx/sc)*k+S.vw/2, y:(row/sc-S.cy/sc)*k+S.vh/2 });
  for(const g of S.geofences){ const c=ll2px(g.lon,g.lat), q=p(c.col,c.row);
    const r=(g.r/META.gsdMeters)/sc*k;
    const e=document.createElement('div'); e.className='gf';
    e.style.left=(q.x-r)+'px'; e.style.top=(q.y-r)+'px';
    e.style.width=(r*2)+'px'; e.style.height=(r*2)+'px'; ov.appendChild(e); }
  if(S.trackPts.length>1){
    const ns='http://www.w3.org/2000/svg';
    const sv=document.createElementNS(ns,'svg');
    sv.setAttribute('style','position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:8');
    let d='';
    S.trackPts.forEach((pt,i)=>{ const f=ll2px(pt.lon,pt.lat), q=p(f.col,f.row);
      d+=(i?' L ':'M ')+q.x+' '+q.y; });
    const pa=document.createElementNS(ns,'path');
    pa.setAttribute('d',d); pa.setAttribute('fill','none');
    pa.setAttribute('stroke','#0a84ff'); pa.setAttribute('stroke-width','6');
    pa.setAttribute('stroke-linejoin','round'); pa.setAttribute('stroke-linecap','round');
    pa.setAttribute('opacity','.92'); sv.appendChild(pa); ov.appendChild(sv);
  }
  if(S.measure.length){ let tot=0;
    S.measure.forEach((m,i)=>{ const f=ll2px(m.lon,m.lat), q=p(f.col,f.row);
      if(i>0){
        const pv=S.measure[i-1];
        tot+=hav(pv.lon,pv.lat,m.lon,m.lat);
        const f0=ll2px(pv.lon,pv.lat), q0=p(f0.col,f0.row);
        const len=Math.hypot(q.x-q0.x,q.y-q0.y), ang=Math.atan2(q.y-q0.y,q.x-q0.x)*180/Math.PI;
        const ln=document.createElement('div'); ln.className='ml';
        ln.style.left=q0.x+'px'; ln.style.top=q0.y+'px';
        ln.style.width=len+'px'; ln.style.transform='rotate('+ang+'deg)'; ov.appendChild(ln);
      }
      const v=document.createElement('div'); v.className='vtx';
      v.style.left=q.x+'px'; v.style.top=q.y+'px'; ov.appendChild(v);
    });
    const last=S.measure[S.measure.length-1];
    const f=ll2px(last.lon,last.lat), q=p(f.col,f.row);
    const la=document.createElement('div'); la.id='mlabel'; la.textContent=fmtD(tot);
    la.style.left=q.x+'px'; la.style.top=q.y+'px'; ov.appendChild(la);
  }
  for(const pin of S.pins){ const f=ll2px(pin.lon,pin.lat), q=p(f.col,f.row);
    const e=document.createElement('div'); e.className='pin-i';
    e.innerHTML='<svg viewBox="0 0 24 24" fill="#ff453a" stroke="#fff" stroke-width="1.2">' +
      '<path d="M12 22s7-6.2 7-11.5A7 7 0 0 0 5 10.5C5 15.8 12 22 12 22z"/>' +
      '<circle cx="12" cy="10.5" r="2.6" fill="#fff" stroke="none"/></svg>';
    e.style.left=q.x+'px'; e.style.top=q.y+'px'; ov.appendChild(e); }
  if(S.gps){ const f=ll2px(S.gps.lon,S.gps.lat), q=p(f.col,f.row);
    const e=document.createElement('div'); e.className='gps';
    e.style.left=q.x+'px'; e.style.top=q.y+'px';
    e.innerHTML='<div class="halo"></div><div class="dot"></div>'; ov.appendChild(e); }
}

/* interaksi peta */
let drag=null;
map.addEventListener('pointerdown',e=>{
  if(e.target.closest('button')) return;
  if(S.mode) return;
  S.follow=false; updateFollowUI();
  drag={x:e.clientX,y:e.clientY,cx:S.cx,cy:S.cy};
  map.classList.add('dragging');
  try{ map.setPointerCapture(e.pointerId); }catch{}
});
map.addEventListener('pointermove',e=>{ if(!drag) return;
  S.cx=drag.cx-(e.clientX-drag.x)/S.scale;
  S.cy=drag.cy-(e.clientY-drag.y)/S.scale; render(); });
const stopDrag=()=>{ drag=null; map.classList.remove('dragging'); };
map.addEventListener('pointerup',stopDrag);
map.addEventListener('pointercancel',stopDrag);

let pinch=null;
map.addEventListener('touchstart',e=>{ if(e.touches.length===2){
  const[a,b]=e.touches;
  pinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),s:S.scale};
  S.follow=false; updateFollowUI();
}},{passive:true});
map.addEventListener('touchmove',e=>{ if(e.touches.length===2&&pinch){
  const[a,b]=e.touches;
  setScale(pinch.s*(Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)/pinch.d));
  e.preventDefault(); }},{passive:false});
map.addEventListener('touchend',()=>{pinch=null;});
function setScale(v){ S.scale=Math.max(.12,Math.min(8,v)); render(); }
map.addEventListener('wheel',e=>{ e.preventDefault();
  setScale(S.scale*(e.deltaY<0?1.15:1/1.15)); },{passive:false});

map.addEventListener('click',e=>{
  if(!S.mode) return;
  const r=map.getBoundingClientRect();
  const px=S.cx+(e.clientX-r.left-S.vw/2)/S.scale;
  const py=S.cy+(e.clientY-r.top-S.vh/2)/S.scale;
  const ll=px2ll(px,py);
  if(S.mode==='pin'){ S.pins.push(ll); toast('Placemark ditambah',1800,'ok'); }
  else if(S.mode==='measure'){ S.measure.push(ll);
    toast(S.measure.length===1?'Titik mula ditetapkan':'Titik ditambah',1600,'ok'); }
  else if(S.mode==='geofence'){ S.geofences.push({...ll,r:150});
    toast('Geofence 150 m',1800,'ok'); }
  render();
});

/* ---------- SHEET ---------- */
function openSheet(title, bodyHTML){
  $('#stitle').textContent=title;
  $('#sbody').innerHTML=bodyHTML;
  $('#scrim').classList.add('on');
  $('#sheet').classList.add('on');
}
function closeSheet(){
  $('#scrim').classList.remove('on');
  $('#sheet').classList.remove('on');
}
$('#scrim').onclick=closeSheet;
$('#sclose').onclick=closeSheet;

function sheetStatus(){
  const g=S.gps;
  openSheet('Status',
    '<div class="kv"><span class="k">Latitude</span><span class="v mono">'+(g?g.lat.toFixed(6):'—')+'</span></div>'+
    '<div class="kv"><span class="k">Longitude</span><span class="v mono">'+(g?g.lon.toFixed(6):'—')+'</span></div>'+
    '<div class="kv"><span class="k">Ketepatan</span><span class="v">'+(S.acc?'±'+Math.round(S.acc)+' m':'—')+'</span></div>'+
    '<div class="kv"><span class="k">Zoom</span><span class="v">'+levelFor(S.scale).metersPerPixel.toFixed(2)+' m/piksel</span></div>'+
    '<div class="kv"><span class="k">Jarak diukur</span><span class="v">'+(S.measure.length>1?fmtD(measureTotal()):'—')+'</span></div>'+
    '<div class="kv"><span class="k">Titik track</span><span class="v">'+S.trackPts.length+'</span></div>'+
    '<div class="kv"><span class="k">Placemark</span><span class="v">'+S.pins.length+'</span></div>'+
    '<div class="sep"></div>'+
    '<button class="bigbtn grey" id="sb-locate">'+ICON.locate+'Kemas kini lokasi</button>'+
    '<button class="bigbtn grey" id="sb-fit">'+ICON.layers+'Papar seluruh peta</button>'
  );
  $('#sb-locate').onclick=()=>{ closeSheet(); locate(); };
  $('#sb-fit').onclick=()=>{ closeSheet(); fitAll(); };
}
function measureTotal(){ let d=0;
  for(let i=1;i<S.measure.length;i++) d+=hav(S.measure[i-1].lon,S.measure[i-1].lat,S.measure[i].lon,S.measure[i].lat);
  return d; }

function sheetMore(){
  const opts = [
    ['geofence','geofence','Geofence','Tanda kawasan 150 m'],
    ['layers','layers','Lapisan','Paparkan atau sorok'],
    ['download','download','Muat turun peta','Simpan salinan penuh'],
    ['clear','undo','Kosongkan semua','Buang semua tanda'],
  ];
  let h='<div class="shint">Alat lain</div>';
  for(const [id,ic,t,s] of opts){
    h+='<button class="opt" data-opt="'+id+'"><span class="oi">'+ICON[ic]+'</span>'+
       '<span class="ot"><b>'+t+'</b><span>'+s+'</span></span>'+
       '<span class="chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 5 7 7-7 7"/></svg></span></button>';
  }
  h+='<div class="shint">Maklumat</div>'+
     '<div class="kv"><span class="k">Sumber</span><span class="v">GeoPDF QGIS</span></div>'+
     '<div class="kv"><span class="k">Saiz peta</span><span class="v">3408 × 2452 px</span></div>'+
     '<div class="kv"><span class="k">Zoom</span><span class="v">z0 – z4</span></div>';
  openSheet('Lagi', h);

  $('#sbody').querySelectorAll('[data-opt]').forEach(el=>{
    el.onclick=()=>{
      const o=el.dataset.opt;
      if(o==='geofence'){ closeSheet(); setMode('geofence'); }
      else if(o==='download'){ window.open('kerilla-map.png','_blank'); }
      else if(o==='clear'){ S.pins=[]; S.measure=[]; S.geofences=[]; S.trackPts=[]; render(); closeSheet(); toast('Semua dibuang',1800); }
      else if(o==='layers'){ toast('Track: '+S.trackPts.length+' · Placemark: '+S.pins.length,2200); }
    };
  });
}

/* ---------- MOD ---------- */
function setMode(m){
  S.mode = (S.mode===m)?null:m;
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on', t.dataset.tab===S.mode));
  if(S.mode){
    const names={pin:'Placemark',measure:'Ukur',geofence:'Geofence'};
    toast('Ketik peta untuk letak '+names[S.mode],2600);
  }
}

/* ---------- RAKAMAN ---------- */
function startRec(){
  if(!S.gps){ toast('Tekan Lokasi dahulu',3200,'err'); return; }
  S.recording=true; S.trackPts=[{lon:S.gps.lon,lat:S.gps.lat,t:Date.now()}];
  S.follow=true; updateFollowUI(); updateRecUI();
  toast('Merakam laluan — mula berjalan',3200,'ok');
}
function stopRec(){
  S.recording=false; updateRecUI();
  const n=S.trackPts.length, d=trackDist();
  if(n<2){ toast('Berhenti — kurang titik',3200,'err'); return; }
  const sec=(S.trackPts[n-1].t-S.trackPts[0].t)/1000;
  toast('Berhenti: '+n+' titik · '+fmtD(d)+(sec>3?' · '+((d/sec)*3.6).toFixed(1)+' km/j':''),6000,'ok');
}
function trackDist(){ let d=0;
  for(let i=1;i<S.trackPts.length;i++) d+=hav(S.trackPts[i-1].lon,S.trackPts[i-1].lat,S.trackPts[i].lon,S.trackPts[i].lat);
  return d; }
function updateRecUI(){
  const t=document.querySelector('.tab[data-tab="track"]');
  if(!t) return;
  t.classList.toggle('on',S.recording);
  t.querySelector('span:last-child').textContent=S.recording?'Henti':'Rakam';
}

/* ---------- TAB ---------- */
document.querySelectorAll('.tab').forEach(tab=>{
  tab.onclick=()=>{
    const k=tab.dataset.tab;
    if(k==='locate'){ locate(); return; }
    if(k==='track'){
      if(S.recording) stopRec();
      else if(S.trackPts.length && !S.recording && tab.classList.contains('on')){
        startRec();
      } else startRec();
      return;
    }
    if(k==='more'){ sheetMore(); return; }
    setMode(k);
  };
});

/* ---------- BUTANG ---------- */
function fitAll(){
  S.follow=false; updateFollowUI();
  S.scale=Math.min(S.vw/META.width,S.vh/META.height)*.9;
  S.cx=META.width/2; S.cy=META.height/2; render();
  toast('Seluruh peta',1800);
}
function updateFollowUI(){
  const b=$('#fb-locate');
  if(b) b.classList.toggle('on',S.follow);
  const c=$('#gpschip');
  if(!c) return;
  if(S.gps){ c.className='on'; c.textContent='GPS ±'+(S.acc?Math.round(S.acc)+'m':'aktif'); }
  else c.className='';
}
$('#fb-locate').onclick=locate;
$('#fb-zin').onclick=()=>setScale(S.scale*1.5);
$('#fb-zout').onclick=()=>setScale(S.scale/1.5);
$('#tb-menu').onclick=sheetStatus;
$('#tb-download').onclick=()=>window.open('kerilla.map.png','_blank');

/* ---------- GPS ---------- */
function locate(){
  if(!navigator.geolocation){ toast('Peranti tidak sokong GPS',3200,'err'); return; }
  toast('Mencari lokasi anda...',5000);
  navigator.geolocation.getCurrentPosition(pos=>{
    applyFix(pos,true);
    toast('Dijumpai — ketepatan ±'+Math.round(pos.coords.accuracy)+' m',3200,'ok');
  },err=>{
    const m={1:'Kebenaran lokasi ditolak. Buka tetapan laman.',2:'GPS tidak tersedia. Hidupkan Location.',
             3:'Timeout. Cuba di tempat terbuka.'}[err.code]||err.message;
    toast(m,7000,'err');
  },{enableHighAccuracy:true,timeout:60000,maximumAge:0});
  if(S.watchId==null){
    S.watchId=navigator.geolocation.watchPosition(p=>applyFix(p,false),()=>{},
      {enableHighAccuracy:true,timeout:60000,maximumAge:0});
  }
}
function applyFix(pos,center){
  const c=pos.coords;
  S.gps={lon:c.longitude,lat:c.latitude}; S.acc=c.accuracy;
  if(c.heading!=null&&!isNaN(c.heading)) $('#nd').style.transform='rotate('+c.heading+'deg)';
  if(S.recording){
    const last=S.trackPts[S.trackPts.length-1];
    if(!last || hav(last.lon,last.lat,c.longitude,c.latitude)>=2){
      S.trackPts.push({lon:c.longitude,lat:c.latitude,t:Date.now()});
    }
  }
  if(center){ S.follow=true; S.scale=Math.max(S.scale,.42); }
  updateFollowUI();
  if($('#sheet').classList.contains('on') && $('#stitle').textContent==='Status') sheetStatus();
  render();
}

/* ---------- MULA ---------- */
async function boot(withGps){
  META=await(await fetch('map-meta.json')).json();
  $('#sub').textContent=META.gsdMeters.toFixed(2)+' m/px · Kelantan';
  S.cx=META.width/2; S.cy=META.height/2;
  S.scale=Math.min(map.clientWidth/META.width,map.clientHeight/META.height)*.9;
  $('#intro').remove();
  render();
  addEventListener('resize',()=>render());
  addEventListener('orientationchange',()=>setTimeout(render,300));
  updateFollowUI();
  if(withGps) locate();
  else toast('Seret untuk pan · pinch untuk zoom',3600);
}
setIcons();
$('#btn-go').onclick=()=>boot(true);
$('#btn-map').onclick=()=>boot(false);
</script>
</body>
</html>`;

fs.writeFileSync(path.join(WEB,'index.html'), html);
fs.writeFileSync(path.join(WEB,'app.html'), html);
fs.writeFileSync(path.join(WEB,'map.html'), html);
console.log('App gaya Avenza dibina:', (fs.statSync(path.join(WEB,'index.html')).size/1024).toFixed(1)+' KB');
