/**
 * build-kerilla-app.mjs — Jana app web untuk peta KERILLA sebenar.
 *
 * Perbezaan dari app POC pertama:
 *   - CRS = EPSG:4326 (lon/lat terus), jadi TIADA transformasi UTM
 *   - Transform peta: piksel -> lon/lat adalah affine mudah
 *   - Ini memudahkan app (no proj4 needed)
 */
import fs from 'node:fs';
import path from 'node:path';

const WEB = 'web-kerilla';
fs.mkdirSync(WEB, { recursive: true });
fs.mkdirSync(path.join(WEB, 'tiles'), { recursive: true });

// salin tile
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else if (e.name.endsWith('.png') || e.name === 'metadata.json') fs.copyFileSync(s, d);
  }
}
copyDir('tiles-kerilla', path.join(WEB, 'tiles'));
const meta = JSON.parse(fs.readFileSync('tiles-kerilla/metadata.json','utf8'));

// Salin peta penuh untuk muat turun
fs.copyFileSync('data/user/kerilla-map.png', path.join(WEB, 'kerilla-map.png'));

const html = `<!DOCTYPE html>
<html lang="ms">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#0b1220">
<title>073 Kerilla Aug26 Task Map — Peta Offline</title>
<style>
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { margin:0; height:100%; overflow:hidden; background:#0b1220; color:#e8eefc;
    font: 14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  #map { position:absolute; inset:0; overflow:hidden; touch-action:none; cursor:grab; background:#1a2333; }
  #map.dragging { cursor:grabbing; }
  #world { position:absolute; transform-origin:0 0; will-change:transform; }
  #world img { position:absolute; pointer-events:none; user-select:none; -webkit-user-drag:none; }
  .overlay { position:absolute; inset:0; pointer-events:none; }
  #top { position:absolute; top:0; left:0; right:0; z-index:20; padding:10px 12px;
    padding-top:max(10px, env(safe-area-inset-top)); display:flex; gap:8px; align-items:center;
    background:linear-gradient(#0b1220ee, #0b122000); }
  #title { flex:1; min-width:0; }
  #title b { display:block; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  #title span { font-size:11px; color:#8fa3c8; }
  #qchip { background:#16233c; border:1px solid #26375a; color:#cfe0ff; padding:6px 10px;
    border-radius:999px; font-size:11px; white-space:nowrap; }
  #status { position:absolute; left:12px; bottom:calc(84px + env(safe-area-inset-bottom)); z-index:15;
    background:#101b30e6; backdrop-filter:blur(8px); border:1px solid #24354f; border-radius:12px;
    padding:10px 12px; min-width:210px; }
  #status .row { display:flex; justify-content:space-between; gap:12px; font-size:12px; padding:2px 0; }
  #status .row span:first-child { color:#8fa3c8; }
  #status .row span:last-child { font-variant-numeric:tabular-nums; }
  #right { position:absolute; right:12px; bottom:calc(84px + env(safe-area-inset-bottom)); z-index:15;
    display:flex; flex-direction:column; gap:8px; }
  #right button { width:46px; height:46px; border-radius:12px; border:1px solid #2a3d5c;
    background:#16233ce6; color:#e8eefc; font-size:20px; cursor:pointer;
    display:flex; align-items:center; justify-content:center; }
  #right button:active { transform:scale(.94); }
  #tools { position:absolute; left:0; right:0; bottom:0; z-index:20;
    padding:10px 12px calc(10px + env(safe-area-inset-bottom)); display:flex; gap:8px;
    overflow-x:auto; scrollbar-width:none; background:linear-gradient(#0b122000, #0b1220ee 30%); }
  #tools::-webkit-scrollbar { display:none; }
  .tool { flex:0 0 auto; background:#16233c; border:1px solid #26375a; color:#cfe0ff;
    padding:10px 14px; border-radius:12px; font-size:12px; cursor:pointer; white-space:nowrap;
    display:flex; flex-direction:column; align-items:center; gap:3px; min-width:66px; }
  .tool .ico { font-size:17px; line-height:1; }
  .tool.on { background:#007aff; border-color:#3d9bff; color:#fff; }
  #toast { position:absolute; left:50%; top:62px; transform:translateX(-50%); z-index:40;
    background:#007aff; color:#fff; padding:9px 16px; border-radius:10px; font-size:13px;
    opacity:0; transition:opacity .25s, transform .25s; pointer-events:none; max-width:90vw; text-align:center; }
  #toast.show { opacity:1; transform:translateX(-50%) translateY(4px); }
  .gps { position:absolute; z-index:12; pointer-events:none; }
  .gps .halo { position:absolute; width:46px; height:46px; margin:-23px 0 0 -23px; border-radius:50%;
    background:#007aff26; border:1px solid #007aff55; animation:pulse 2.2s ease-out infinite; }
  .gps .dot { position:absolute; width:16px; height:16px; margin:-8px 0 0 -8px; border-radius:50%;
    background:#007aff; border:3px solid #fff; box-shadow:0 1px 6px #0009; }
  @keyframes pulse { 0%{transform:scale(.6);opacity:.9} 70%{transform:scale(1.35);opacity:0} 100%{opacity:0} }
  .pin { position:absolute; z-index:11; pointer-events:none; transform:translate(-50%,-100%);
    font-size:26px; filter:drop-shadow(0 2px 3px #0007); }
  .measureline { position:absolute; z-index:10; height:3px; background:#ff9500;
    transform-origin:0 50%; pointer-events:none; border-radius:2px; }
  #measurelabel { position:absolute; z-index:13; background:#ff9500; color:#1a1206; font-weight:700;
    font-size:12px; padding:3px 8px; border-radius:7px; pointer-events:none;
    transform:translate(-50%,-160%); white-space:nowrap; }
  #onboard { position:absolute; inset:0; z-index:50; background:#0b1220f2; display:flex;
    flex-direction:column; align-items:center; justify-content:center; padding:28px; text-align:center; gap:14px; }
  #onboard h1 { font-size:20px; margin:0; }
  #onboard p { color:#9db0d0; margin:0; max-width:400px; font-size:13px; line-height:1.6; }
  #onboard button { background:#007aff; color:#fff; border:0; padding:13px 26px; border-radius:12px;
    font-size:15px; font-weight:600; cursor:pointer; }
  #onboard button.ghost { background:#1b2a44; color:#cfe0ff; }
  .kbd { background:#16233c; border:1px solid #2a3d5c; border-radius:5px; padding:1px 5px; font-size:11px; }
</style>
</head>
<body>
<div id="map"><div id="world"></div><div class="overlay" id="ov"></div></div>

<div id="top">
  <div id="title"><b>073 Kerilla Aug26 Task Map</b><span id="sub">memuatkan...</span></div>
  <div id="qchip">Tekan <b>Q</b></div>
</div>

<div id="status">
  <div class="row"><span>Latitude</span><span id="s-lat">—</span></div>
  <div class="row"><span>Longitude</span><span id="s-lon">—</span></div>
  <div class="row"><span>Sumber</span><span id="s-src">—</span></div>
  <div class="row"><span>Zoom / GSD</span><span id="s-zoom">—</span></div>
  <div class="row"><span>Tile</span><span id="s-tiles">0</span></div>
  <div class="row"><span>Jarak</span><span id="s-dist">—</span></div>
</div>

<div id="right">
  <button id="btn-locate" title="Lokasi saya">◎</button>
  <button id="btn-zoom-in">+</button>
  <button id="btn-zoom-out">−</button>
</div>

<div id="tools">
  <div class="tool" data-tool="locate"><span class="ico">◎</span>Lokasi</div>
  <div class="tool" data-tool="pin"><span class="ico">📍</span>Placemark</div>
  <div class="tool" data-tool="measure"><span class="ico">📏</span>Ukur</div>
  <div class="tool" data-tool="geofence"><span class="ico">⬡</span>Geofence</div>
  <div class="tool" data-tool="track"><span class="ico">⏺</span>Track</div>
  <div class="tool" data-tool="clearlast"><span class="ico">↩</span>Buang</div>
  <div class="tool" data-tool="reset"><span class="ico">⤢</span>Reset</div>
  <div class="tool" data-tool="download"><span class="ico">⬇</span>Peta</div>
</div>

<div id="toast"></div>

<div id="onboard">
  <h1>🗺️ 073 Kerilla Aug26 Task Map</h1>
  <p>Peta <b>GeoPDF sebenar</b> (QGIS) dari Kelantan — 9.0 × 6.5 km.
     Georeferencing dibaca terus dari fail PDF anda.</p>
  <p style="color:#6f86ab;font-size:12px">Seret untuk pan · scroll/pinch zoom · <span class="kbd">Q</span> zoom pantas</p>
  <button id="btn-start">Mula</button>
  <button id="btn-start-gps" class="ghost">Mula + GPS saya</button>
</div>

<script>
const TILE = 256;
const state = {
  meta:null, scale:0.5, cx:0, cy:0, tiles:new Map(),
  gps:null, watchId:null, tool:null, pins:[], measure:[], geofences:[],
  track:null, trackPoints:[], vw:0, vh:0,
};
const $ = (s)=>document.querySelector(s);
const map=$('#map'), world=$('#world'), ov=$('#ov');

// ===== CRS: peta ini EPSG:4326 -> affine terus (piksel -> lon/lat) =====
function fullPixelToLonLat(col,row){
  const t=state.meta.transform;
  return { lon: t.A*col + t.B*row + t.C, lat: t.D*col + t.E*row + t.F };
}
function lonLatToFullPixel(lon,lat){
  const t=state.meta.transform;
  const det=t.A*t.E-t.B*t.D;
  const dx=lon-t.C, dy=lat-t.F;
  return { col:(t.E*dx-t.B*dy)/det, row:(-t.D*dx+t.A*dy)/det };
}

function resize(){ state.vw=map.clientWidth; state.vh=map.clientHeight; render(); }
function clampPan(){
  const W=state.meta.width,H=state.meta.height;
  const hw=state.vw/2/state.scale, hh=state.vh/2/state.scale;
  state.cx=Math.max(hw,Math.min(W-hw,state.cx));
  state.cy=Math.max(hh,Math.min(H-hh,state.cy));
}
function level(){
  const lvls=state.meta.levels;
  const targetMpp = (1/state.scale) * state.meta.gsdMeters;
  let best=lvls[lvls.length-1], bd=Infinity;
  for(const l of lvls){ const d=Math.abs(l.metersPerPixel-targetMpp); if(d<bd){bd=d;best=l;} }
  return best;
}
function render(){
  if(!state.meta) return;
  clampPan();
  const lv=level(), s=lv.scale, k=state.scale*s;
  world.style.transform='translate('+(-(state.cx/s)*k+state.vw/2)+'px,'+
    (-(state.cy/s)*k+state.vh/2)+'px) scale('+k+')';
  const need=new Map();
  const lx=state.cx/s, ly=state.cy/s;
  const hw=state.vw/2/k, hh=state.vh/2/k;
  const tx0=Math.floor((lx-hw)/TILE), tx1=Math.floor((lx+hw)/TILE);
  const ty0=Math.floor((ly-hh)/TILE), ty1=Math.floor((ly+hh)/TILE);
  for(let tx=tx0;tx<=tx1;tx++) for(let ty=ty0;ty<=ty1;ty++){
    if(tx<0||ty<0||tx>=lv.tilesX||ty>=lv.tilesY) continue;
    need.set(lv.z+'_'+tx+'_'+ty,{z:lv.z,x:tx,y:ty});
  }
  for(const [key,el] of state.tiles) if(!need.has(key)){ el.remove(); state.tiles.delete(key); }
  for(const [key,t] of need){
    if(state.tiles.has(key)) continue;
    const img=document.createElement('img');
    img.src='tiles/'+t.z+'/'+t.x+'_'+t.y+'.png';
    img.style.left=(t.x*TILE)+'px'; img.style.top=(t.y*TILE)+'px';
    img.width=TILE; img.height=TILE;
    img.onload=()=>{ $('#s-tiles').textContent=state.tiles.size; };
    world.appendChild(img); state.tiles.set(key,img);
  }
  $('#s-tiles').textContent=state.tiles.size;
  $('#s-zoom').textContent='z'+lv.z+' / '+lv.metersPerPixel.toFixed(2)+'m';
  drawOverlays(s,k);
}
function drawOverlays(s,k){
  ov.innerHTML='';
  const toScr=(col,row)=>({
    x:(col/s-state.cx/s)*k+state.vw/2,
    y:(row/s-state.cy/s)*k+state.vh/2,
  });
  for(const p of state.pins){
    const fp=lonLatToFullPixel(p.lon,p.lat), q=toScr(fp.col,fp.row);
    const el=document.createElement('div'); el.className='pin'; el.textContent='📍';
    el.style.left=q.x+'px'; el.style.top=q.y+'px'; ov.appendChild(el);
  }
  for(const g of state.geofences){
    const c=lonLatToFullPixel(g.lon,g.lat), q=toScr(c.col,c.row);
    const rpx=(g.radiusM/state.meta.gsdMeters)/s*k;
    const el=document.createElement('div');
    el.style.position='absolute'; el.style.left=(q.x-rpx)+'px'; el.style.top=(q.y-rpx)+'px';
    el.style.width=rpx*2+'px'; el.style.height=rpx*2+'px'; el.style.borderRadius='50%';
    el.style.border='2px dashed #6fe08a'; el.style.background='#6fe08a1a'; el.style.pointerEvents='none';
    ov.appendChild(el);
  }
  if(state.trackPoints.length>1){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('style','position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:9');
    let d='';
    state.trackPoints.forEach((p,i)=>{
      const fp=lonLatToFullPixel(p.lon,p.lat), q=toScr(fp.col,fp.row);
      d+=(i?' L ':'M ')+q.x+' '+q.y;
    });
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',d); path.setAttribute('fill','none');
    path.setAttribute('stroke','#ff3b30'); path.setAttribute('stroke-width','3');
    path.setAttribute('stroke-linejoin','round'); svg.appendChild(path); ov.appendChild(svg);
  }
  if(state.measure.length){
    let total=0;
    for(let i=0;i<state.measure.length;i++){
      const fp=lonLatToFullPixel(state.measure[i].lon,state.measure[i].lat), q=toScr(fp.col,fp.row);
      const dot=document.createElement('div'); dot.className='pin'; dot.textContent='•';
      dot.style.color='#ff9500'; dot.style.fontSize='30px';
      dot.style.left=q.x+'px'; dot.style.top=q.y+'px'; ov.appendChild(dot);
      if(i>0){
        const prev=state.measure[i-1];
        total+=haversine(prev.lon,prev.lat,state.measure[i].lon,state.measure[i].lat);
        const fp0=lonLatToFullPixel(prev.lon,prev.lat), q0=toScr(fp0.col,fp0.row);
        const len=Math.hypot(q.x-q0.x,q.y-q0.y);
        const ang=Math.atan2(q.y-q0.y,q.x-q0.x)*180/Math.PI;
        const ln=document.createElement('div'); ln.className='measureline';
        ln.style.left=q0.x+'px'; ln.style.top=q0.y+'px'; ln.style.width=len+'px';
        ln.style.transform='rotate('+ang+'deg)'; ov.appendChild(ln);
      }
    }
    const last=state.measure[state.measure.length-1];
    const fp=lonLatToFullPixel(last.lon,last.lat), q=toScr(fp.col,fp.row);
    const lab=document.createElement('div'); lab.id='measurelabel'; lab.textContent=fmtDist(total);
    lab.style.left=q.x+'px'; lab.style.top=q.y+'px'; ov.appendChild(lab);
    $('#s-dist').textContent=fmtDist(total);
  }
  if(state.gps){
    const fp=lonLatToFullPixel(state.gps.lon,state.gps.lat), q=toScr(fp.col,fp.row);
    const el=document.createElement('div'); el.className='gps';
    el.style.left=q.x+'px'; el.style.top=q.y+'px';
    el.innerHTML='<div class="halo"></div><div class="dot"></div>'; ov.appendChild(el);
    $('#s-lat').textContent=state.gps.lat.toFixed(6);
    $('#s-lon').textContent=state.gps.lon.toFixed(6);
  }
}
function haversine(lon1,lat1,lon2,lat2){
  const R=6371008.8,rad=(d)=>d*Math.PI/180;
  const dLat=rad(lat2-lat1),dLon=rad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(a)));
}
function fmtDist(m){ return m==null?'—':(m<1000?m.toFixed(1)+' m':(m/1000).toFixed(2)+' km'); }
function toast(msg,ms=2400){
  const t=$('#toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),ms);
}

let drag=null;
map.addEventListener('pointerdown',(e)=>{
  if(e.target.closest('button')||e.target.closest('.tool')) return;
  if(state.tool) return;
  drag={x:e.clientX,y:e.clientY,cx:state.cx,cy:state.cy};
  map.classList.add('dragging'); map.setPointerCapture(e.pointerId);
});
map.addEventListener('pointermove',(e)=>{
  if(!drag) return;
  state.cx=drag.cx-(e.clientX-drag.x)/state.scale;
  state.cy=drag.cy-(e.clientY-drag.y)/state.scale;
  render();
});
map.addEventListener('pointerup',()=>{ drag=null; map.classList.remove('dragging'); });
map.addEventListener('pointercancel',()=>{ drag=null; map.classList.remove('dragging'); });

let pinch=null;
map.addEventListener('touchstart',(e)=>{
  if(e.touches.length===2){
    const[a,b]=e.touches;
    pinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),s:state.scale};
  }
},{passive:true});
map.addEventListener('touchmove',(e)=>{
  if(e.touches.length===2&&pinch){
    const[a,b]=e.touches;
    setScale(pinch.s*(Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)/pinch.d));
    e.preventDefault();
  }
},{passive:false});
map.addEventListener('touchend',()=>{ pinch=null; });
function setScale(s){ state.scale=Math.max(0.15,Math.min(12,s)); render(); }
map.addEventListener('wheel',(e)=>{ e.preventDefault(); setScale(state.scale*(e.deltaY<0?1.18:1/1.18)); },{passive:false});

map.addEventListener('click',(e)=>{
  if(!state.tool) return;
  const r=map.getBoundingClientRect();
  const px=state.cx+(e.clientX-r.left-state.vw/2)/state.scale;
  const py=state.cy+(e.clientY-r.top-state.vh/2)/state.scale;
  const ll=fullPixelToLonLat(px,py);
  if(state.tool==='pin'){ state.pins.push(ll); toast('Placemark diletak'); }
  else if(state.tool==='measure'){ state.measure.push(ll); toast(state.measure.length===1?'Titik mula set':'Titik ditambah'); }
  else if(state.tool==='geofence'){ state.geofences.push({...ll,radiusM:150}); toast('Geofence 150 m dicipta'); }
  render();
});

addEventListener('keydown',(e)=>{
  if(e.key==='q'||e.key==='Q'){
    if(state.gps){ centerOn(state.gps.lon,state.gps.lat); setScale(4); toast('Zoom ke GPS'); }
    else toast('Tiada GPS — tekan Lokasi dahulu');
  }
  if(e.key==='+'||e.key==='=') setScale(state.scale*1.3);
  if(e.key==='-'||e.key==='_') setScale(state.scale/1.3);
  if(e.key==='Escape'){ state.tool=null; updateTools(); }
});
function centerOn(lon,lat){ const fp=lonLatToFullPixel(lon,lat); state.cx=fp.col; state.cy=fp.row; render(); }
function updateTools(){ document.querySelectorAll('.tool').forEach(t=>t.classList.toggle('on',t.dataset.tool===state.tool)); }

document.querySelectorAll('.tool').forEach(el=>{
  el.addEventListener('click',()=>{
    const t=el.dataset.tool;
    if(t==='locate') return locate();
    if(t==='download'){ window.open('kerilla-map.png','_blank'); return; }
    if(t==='clearlast'){ if(state.tool==='measure') state.measure.pop(); else state.pins.pop(); render(); return; }
    if(t==='reset'){
      state.pins=[];state.measure=[];state.geofences=[];state.trackPoints=[];
      state.tool=null; updateTools(); state.scale=0.5;
      state.cx=state.meta.width/2; state.cy=state.meta.height/2;
      $('#s-dist').textContent='—'; render(); toast('Direset'); return;
    }
    if(t==='track'){
      if(state.track){ clearInterval(state.track); state.track=null;
        toast('Track dihentikan — '+state.trackPoints.length+' titik'); }
      else {
        const start=fullPixelToLonLat(state.meta.width/2,state.meta.height/2);
        let cur={...start}, heading=70;
        state.track=setInterval(()=>{
          heading+=(Math.random()-0.5)*14;
          const rad=heading*Math.PI/180, d=25;
          cur={ lat:cur.lat+(d*Math.cos(rad))/111320,
                lon:cur.lon+(d*Math.sin(rad))/(111320*Math.cos(cur.lat*Math.PI/180)) };
          state.trackPoints.push({...cur});
          state.gps={...cur,src:'Simulasi'};
          $('#s-src').textContent='Simulasi track';
          if(state.trackPoints.length===1) centerOn(cur.lon,cur.lat);
          render();
        },700);
        toast('Merakam track (simulasi)...');
      }
      return;
    }
    state.tool=state.tool===t?null:t; updateTools();
    if(state.tool) toast('Klik pada peta untuk letak '+state.tool);
  });
});

function locate(){
  if(!navigator.geolocation){ toast('Peranti tidak sokong GPS'); return; }
  toast('Mendapatkan lokasi...');
  navigator.geolocation.getCurrentPosition((pos)=>{
    state.gps={lon:pos.coords.longitude,lat:pos.coords.latitude,src:'GPS'};
    $('#s-src').textContent='GPS ±'+Math.round(pos.coords.accuracy)+'m';
    centerOn(state.gps.lon,state.gps.lat); setScale(3);
    const fp=lonLatToFullPixel(state.gps.lon,state.gps.lat);
    const inMap=fp.col>=0&&fp.row>=0&&fp.col<state.meta.width&&fp.row<state.meta.height;
    $('#sub').textContent=inMap?'Anda DI DALAM kawasan peta':'Anda di luar peta ini';
    toast(inMap?'📍 Anda berada dalam kawasan peta':'Anda di luar kawasan peta Kerilla');
    render();
  },(err)=>{ toast('GPS gagal: '+err.message); },
  {enableHighAccuracy:true,timeout:12000,maximumAge:0});
  if(state.watchId==null){
    state.watchId=navigator.geolocation.watchPosition((pos)=>{
      state.gps={lon:pos.coords.longitude,lat:pos.coords.latitude,src:'GPS'};
      $('#s-src').textContent='GPS ±'+Math.round(pos.coords.accuracy)+'m';
      render();
    },()=>{},{enableHighAccuracy:true});
  }
}
$('#btn-locate').onclick=locate;
$('#btn-zoom-in').onclick=()=>setScale(state.scale*1.4);
$('#btn-zoom-out').onclick=()=>setScale(state.scale/1.4);

async function boot(withGps){
  state.meta=await(await fetch('map-meta.json')).json();
  state.cx=state.meta.width/2; state.cy=state.meta.height/2; state.scale=0.5;
  const b=state.meta.bbox;
  $('#sub').textContent=state.meta.width+'×'+state.meta.height+' px · '+
    state.meta.gsdMeters.toFixed(2)+' m/px · Kelantan ('+
    b.minLat.toFixed(4)+'..'+b.maxLat.toFixed(4)+'°N)';
  $('#onboard').remove();
  resize(); addEventListener('resize',resize);
  if(withGps) locate();
  toast('Sedia. Seret untuk pan, scroll untuk zoom.');
}
$('#btn-start').onclick=()=>boot(false);
$('#btn-start-gps').onclick=()=>boot(true);
</script>
</body>
</html>`;

fs.writeFileSync(path.join(WEB,'index.html'), html);
console.log('App Kerilla dibina di:', WEB);
console.log('  index.html   ', (fs.statSync(path.join(WEB,'index.html')).size/1024).toFixed(0)+' KB');
console.log('  map-meta.json', (fs.statSync(path.join(WEB,'map-meta.json')).size/1024).toFixed(1)+' KB');
console.log('  tiles/       ', meta.totalTiles+' tile, '+(meta.totalBytes/1048576).toFixed(1)+' MB');
console.log('  peta penuh   ', (fs.statSync(path.join(WEB,'kerilla-map.png')).size/1048576).toFixed(1)+' MB');
