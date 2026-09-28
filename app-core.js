const TILE = 256;
let META = null;
/* ===== FLAG TOGOL TRANSFORM (untuk test fizikal lapangan) ===== */
const USE_LEGACY_TRANSFORM = true;  // true=lama(live), false=baru(300dpi GPTS betul)
const DEBUG_DUAL_GPS = false;       // true=papar 2 dot GPS serentak (merah=lama, hijau=baru)
const S = {
  scale:.5, cx:0, cy:0, vw:0, vh:0, tiles:new Map(),
  gps:null, acc:null, watch:null, follow:true,
  mode:null, pins:[], measure:[], geofences:[],
  pts:[], rec:false, heading:null,
};
const $ = s => document.querySelector(s);
const map = $("#map"), world = $("#world"), ov = $("#ov");

/* ---------- ikon SVG (gaya garis, seragam) ---------- */
const IPATH = {
  menu:"M4 6h16M4 12h16M4 18h16",
  share:"M12 3v12m0 0l-4-4m4 4l4-4M5 21h14",
  pin:"M12 21s7-6.5 7-11a7 7 0 10-14 0c0 4.5 7 11 7 11z",
  measure:"M4 15l6-6 3 3 7-7M20 5v5h-5",
  plus:"M12 5v14M5 12h14",
  minus:"M5 12h14",
  layers:"M12 3 3 8l9 5 9-5M3 13l9 5 9-5M3 17.5 12 22l9-4.5",
  close:"M6 6l12 12M18 6L6 18",
  chev:"m9 6 6 6-6 6",
  hex:"M12 2.6 20.5 7.6v9.8L12 22l-8.5-4.6V7.6z",
  undo:"M4 9h11a5 5 0 0 1 0 10H8m4-14-4 4 4 4",
  dl:"M12 3v12m0 0l-4-4m4 4 4-4M4 20h16",
};
const O = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="';
const OE = '</svg>';
const G = '<circle cx="12" cy="12" r="8"/>' +
  '<path d="M12 4v2m0 12v2m8-8h-2M6 12H4"/>' +
  '<circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/>';
const RC = '<rect x="4" y="7" width="16" height="12" rx="2"/>' +
  '<circle cx="12" cy="13" r="3.2"/><path d="M9 7l1.5-2h3L15 7"/>';
const IC = {
  gps: O + '1.9">' + G + OE,
  rec: O + '1.9">' + RC + OE,
  menu: O + '2">' + '<path d="' + IPATH.menu + '"/>' + OE,
  share: O + '2">' + '<path d="' + IPATH.share + '"/>' + OE,
  pin: O + '1.9">' + '<path d="' + IPATH.pin + '"/><circle cx="12" cy="10" r="2.4"/>' + OE,
  measure: O + '2">' + '<path d="' + IPATH.measure + '"/>' + OE,
  plus: O + '2">' + '<path d="' + IPATH.plus + '"/>' + OE,
  minus: O + '2">' + '<path d="' + IPATH.minus + '"/>' + OE,
  layers: O + '1.9">' + '<path d="' + IPATH.layers + '"/>' + OE,
  close: O + '2">' + '<path d="' + IPATH.close + '"/>' + OE,
  chev: O + '2.2">' + '<path d="' + IPATH.chev + '"/>' + OE,
  hex: O + '1.9">' + '<path d="' + IPATH.hex + '"/><circle cx="12" cy="12" r="3"/>' + OE,
  undo: O + '2">' + '<path d="' + IPATH.undo + '"/>' + OE,
  dl: O + '2">' + '<path d="' + IPATH.dl + '"/>' + OE,
  more: '<svg viewBox="0 0 24 24" fill="currentColor">' +
    '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/>' +
    '<circle cx="19" cy="12" r="1.5"/>' + OE,
};

const px2ll = (c,r) => { const t=META.transform;
  return { lon:t.A*c+t.B*r+t.C, lat:t.D*c+t.E*r+t.F }; };
const ll2px = (lon,lat) => { const t=META.transform;
  const d=t.A*t.E-t.B*t.D, dx=lon-t.C, dy=lat-t.F;
  return { col:(t.E*dx-t.B*dy)/d, row:(-t.D*dx+t.A*dy)/d }; };
function applyTransform(){
  if(!META) return;
  META.transform = USE_LEGACY_TRANSFORM ? (META.transformLegacy || META.transform) : (META.transformNew || META.transform);
}
/* Auto-backup storan legacy bila suis transform (sekali sahaja) */
let _transformBackedUp=false;
function backupIfTransformSwitched(){
  if(_transformBackedUp) return;
  if(!USE_LEGACY_TRANSFORM && S.pins.length+ S.measure.length+ S.geofences.length > 0){
    backupStorageLegacy();
    _transformBackedUp=true;
    toast('Storan legacy di-backup (kerilla.backup.legacy)', 2500);
  }
}
const ll2pxT = (lon,lat,t) => { const d=t.A*t.E-t.B*t.D, dx=lon-t.C, dy=lat-t.F;
  return { col:(t.E*dx-t.B*dy)/d, row:(-t.D*dx+t.A*dy)/d }; };
/* ===== LAPISAN LABEL NOMBER TASK ===== */
let LBL=null;
async function loadLabels(){
  try{
    const r=await fetch("labels.json",{cache:"no-store"});
    LBL=await r.json();
    const im=document.createElement("img");
    im.src="labels.png?v="+APP_V; im.id="lblatlas";
    im.style.display="none";
    document.body.appendChild(im);
    if(META) render();
  }catch(e){ console.warn("label gagal",e); }
}
loadLabels();
/* ===== JARAK GEODESIK =====
   hav(lon1,lat1,lon2,lat2) — susunan parameter WAJIB (lon, lat, lon, lat).
   Guna formula VINCENTY (ellipsoid WGS84) — ketepatan < 1 mm,
   jauh lebih tepat dari haversine bola (yang boleh tersasar 0.55%).
   Fallback ke haversine jika vincenty gagal kumpul (titik hampir sama). */
const _WGS84_A = 6378137, _WGS84_F = 1/298.257223563;
const _WGS84_B = (1-_WGS84_F)*_WGS84_A;
const _RAD = x => x*Math.PI/180;

function havSphere(lon1,lat1,lon2,lat2){
  const R=6371008.8;
  const dLat=_RAD(lat2-lat1), dLon=_RAD(lon2-lon1);
  const h=Math.sin(dLat/2)**2 +
          Math.cos(_RAD(lat1))*Math.cos(_RAD(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
}

function hav(lon1,lat1,lon2,lat2){
  if(lon1===lon2 && lat1===lat2) return 0;
  const L=_RAD(lon2-lon1);
  const U1=Math.atan((1-_WGS84_F)*Math.tan(_RAD(lat1)));
  const U2=Math.atan((1-_WGS84_F)*Math.tan(_RAD(lat2)));
  const sU1=Math.sin(U1), cU1=Math.cos(U1);
  const sU2=Math.sin(U2), cU2=Math.cos(U2);
  let lam=L, lamP, iter=0, sSig, cSig, sig, sAl, c2Al, C, cos2SigM;
  do{
    const sLam=Math.sin(lam), cLam=Math.cos(lam);
    const s2=(cU2*sLam)**2 + (cU1*sU2 - sU1*cU2*cLam)**2;
    if(s2===0) return 0;
    sSig=Math.sqrt(s2);
    cSig=sU1*sU2 + cU1*cU2*cLam;
    sig=Math.atan2(sSig,cSig);
    sAl=cU1*cU2*sLam/sSig;
    c2Al=1-sAl*sAl;
    cos2SigM = c2Al===0 ? 0 : cSig - 2*sU1*sU2/c2Al;
    C=_WGS84_F/16*c2Al*(4+_WGS84_F*(4-3*c2Al));
    lamP=lam;
    lam=L+(1-C)*_WGS84_F*sAl*(sig+C*sSig*(cos2SigM+C*cSig*(-1+2*cos2SigM*cos2SigM)));
  } while(Math.abs(lam-lamP)>1e-12 && ++iter<64);
  if(iter>=64) return havSphere(lon1,lat1,lon2,lat2);   // fallback
  const u2=c2Al*((_WGS84_A*_WGS84_A-_WGS84_B*_WGS84_B)/(_WGS84_B*_WGS84_B));
  const A=1+u2/16384*(4096+u2*(-768+u2*(320-175*u2)));
  const B=u2/1024*(256+u2*(-128+u2*(74-47*u2)));
  const dSig=B*sSig*(cos2SigM+B/4*(cSig*(-1+2*cos2SigM*cos2SigM)-
    B/6*cos2SigM*(-3+4*sSig*sSig)*(-3+4*cos2SigM*cos2SigM)));
  return _WGS84_B*A*(sig-dSig);
}
const fmtD = m => m==null?"—":(m<1000?m.toFixed(1)+" m":(m/1000).toFixed(3)+" km");
function toast(msg,ms,k){ const t=$("#toast"); t.textContent=msg;
  t.className="on "+(k||""); clearTimeout(t._t);
  t._t=setTimeout(()=>t.className="",ms||2600); }
function lvl(sc){ const tg=(1/sc)*META.gsdMeters; let b=META.levels[META.levels.length-1], bd=1e9;
  for(const l of META.levels){ const d=Math.abs(l.metersPerPixel-tg); if(d<bd){bd=d;b=l;} } return b; }

/* PETA FULL SCREEN — fit COVER: zoom masuk supaya peta menutup SELURUH skrin.
   Ini membuang SEMUA ruang kosong (cream) di atas/bawah peta.
   Peta menjadi lebih lebar dari skrin -> boleh pan kiri/kanan, tetapi TIADA gap. */
function fitCover(){
  const vw=S.vw||map.clientWidth||window.innerWidth||360;
  const vh=S.vh||map.clientHeight||window.innerHeight||640;
  S.scale = Math.max(vw / META.width, vh / META.height);
  S.cx = META.width/2;
  S.cy = S.gps ? ll2px(S.gps.lon,S.gps.lat).row : META.height/2;
}
function render(){
  if(!META) return;
  const cw=map.clientWidth||window.innerWidth||360;
  const ch=map.clientHeight||window.innerHeight||640;
  S.vw = cw; S.vh = ch;
  if(S.follow && S.gps){ const f=ll2px(S.gps.lon,S.gps.lat); S.cx=f.col; S.cy=f.row; }
  const L=lvl(S.scale), sc=L.scale, k=S.scale*sc;
  if(!S.follow){
    const hw=S.vw/2/S.scale, hh=S.vh/2/S.scale;
    // Kunci supaya TIADA gap: had TEPAT (tiada margin) bila peta lebih besar
    S.cx = (META.width>2*hw)?Math.min(META.width-hw,Math.max(hw,S.cx)):META.width/2;
    S.cy = (META.height>2*hh)?Math.min(META.height-hh,Math.max(hh,S.cy)):META.height/2;
  }
  world.style.transform="translate("+(-(S.cx/sc)*k+S.vw/2)+"px,"+(-(S.cy/sc)*k+S.vh/2)+"px) scale("+k+")";
  const need=new Map(), lx=S.cx/sc, ly=S.cy/sc, hw=S.vw/2/k, hh=S.vh/2/k;
  for(let tx=Math.floor((lx-hw)/TILE);tx<=Math.floor((lx+hw)/TILE);tx++)
    for(let ty=Math.floor((ly-hh)/TILE);ty<=Math.floor((ly+hh)/TILE);ty++){
      if(tx<0||ty<0||tx>=L.tilesX||ty>=L.tilesY) continue;
      need.set(L.z+"_"+tx+"_"+ty,{z:L.z,x:tx,y:ty});
    }
  for(const [kk,el] of S.tiles) if(!need.has(kk)){ el.remove(); S.tiles.delete(kk); }
  for(const [kk,t] of need){
    if(S.tiles.has(kk)) continue;
    const im=document.createElement("img");
    im.src="tiles/"+t.z+"/"+t.x+"_"+t.y+".png?v="+APP_V;
    im.style.left=(t.x*TILE)+"px"; im.style.top=(t.y*TILE)+"px";
    im.width=TILE; im.height=TILE; world.appendChild(im); S.tiles.set(kk,im);
  }
  draw(sc,k);
  upScaleBar();
}

function draw(sc,k){
  ov.innerHTML="";
  const P=(c,r)=>({x:(c/sc-S.cx/sc)*k+S.vw/2, y:(r/sc-S.cy/sc)*k+S.vh/2});
  for(const g of S.geofences){ const c=ll2px(g.lon,g.lat), q=P(c.col,c.row);
    const rd=(g.r/META.gsdMeters)/sc*k;
    const e=document.createElement("div"); e.className="gf";
    e.style.left=(q.x-rd)+"px"; e.style.top=(q.y-rd)+"px";
    e.style.width=(rd*2)+"px"; e.style.height=(rd*2)+"px"; ov.appendChild(e); }
  if(S.pts.length>1){
    const NS="http://www.w3.org/2000/svg";
    const sv=document.createElementNS(NS,"svg");
    sv.setAttribute("style","position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:8");
    let d="";
    S.pts.forEach((p,i)=>{ const f=ll2px(p.lon,p.lat), q=P(f.col,f.row); d+=(i?" L ":"M ")+q.x+" "+q.y; });
    const pa=document.createElementNS(NS,"path");
    pa.setAttribute("d",d); pa.setAttribute("fill","none");
    pa.setAttribute("stroke","#e8823c"); pa.setAttribute("stroke-width","5");
    pa.setAttribute("stroke-linejoin","round"); pa.setAttribute("stroke-linecap","round");
    sv.appendChild(pa); ov.appendChild(sv);
    [S.pts[0], S.pts[S.pts.length-1]].forEach(p=>{
      const f=ll2px(p.lon,p.lat), q=P(f.col,f.row);
      const dot=document.createElement("div"); dot.className="vtx";
      dot.style.left=q.x+"px"; dot.style.top=q.y+"px"; ov.appendChild(dot);
    });
  }
  if(S.measure.length){ let tot=0;
    S.measure.forEach((m,i)=>{ const f=ll2px(m.lon,m.lat), q=P(f.col,f.row);
      if(i>0){ const pv=S.measure[i-1]; tot+=hav(pv.lon,pv.lat,m.lon,m.lat);
        const f0=ll2px(pv.lon,pv.lat), q0=P(f0.col,f0.row);
        const ln=Math.hypot(q.x-q0.x,q.y-q0.y), an=Math.atan2(q.y-q0.y,q.x-q0.x)*180/Math.PI;
        const el=document.createElement("div"); el.className="ml";
        el.style.left=q0.x+"px"; el.style.top=q0.y+"px";
        el.style.width=ln+"px"; el.style.transform="rotate("+an+"deg)"; ov.appendChild(el); }
      const v=document.createElement("div"); v.className="vtx";
      v.style.left=q.x+"px"; v.style.top=q.y+"px"; ov.appendChild(v); });
    const lm=S.measure[S.measure.length-1];
    const f=ll2px(lm.lon,lm.lat), q=P(f.col,f.row);
    const la=document.createElement("div"); la.id="mlabel"; la.textContent=fmtD(tot);
    la.style.left=q.x+"px"; la.style.top=q.y+"px"; ov.appendChild(la);
  }
  const PINSVG='<svg viewBox="0 0 24 24" fill="#e8823c" stroke="#fff" stroke-width="1.3">' +
    '<path d="M12 21s7-6.5 7-11a7 7 0 10-14 0c0 4.5 7 11 7 11z"/>' +
    '<circle cx="12" cy="10" r="2.4" fill="#fff" stroke="none"/></svg>';
  for(const p of S.pins){ const f=ll2px(p.lon,p.lat), q=P(f.col,f.row);
    const e=document.createElement("div"); e.className="pin-i";
    e.innerHTML=PINSVG; e.style.left=q.x+"px"; e.style.top=q.y+"px"; ov.appendChild(e);
    const lbl=document.createElement("div"); lbl.className="pin-coord";
    lbl.textContent=p.lat.toFixed(6)+", "+p.lon.toFixed(6);
    lbl.style.left=q.x+"px"; lbl.style.top=(q.y-20)+"px"; ov.appendChild(lbl); }
  if(S.gps){ const f=ll2px(S.gps.lon,S.gps.lat), q=P(f.col,f.row);
    const e=document.createElement("div"); e.className="gps";
    e.style.left=q.x+"px"; e.style.top=q.y+"px";
    e.innerHTML='<div class="h"></div><div class="d"></div>'; ov.appendChild(e); }
  /* ===== DEBUG DUAL GPS: papar dot kedua guna transform lain ===== */
  if(DEBUG_DUAL_GPS && S.gps && META.transformNew && META.transformLegacy){
    const otherT = USE_LEGACY_TRANSFORM ? META.transformNew : META.transformLegacy;
    const f2 = ll2pxT(S.gps.lon, S.gps.lat, otherT), q2 = P(f2.col, f2.row);
    const e2 = document.createElement("div");
    e2.className = USE_LEGACY_TRANSFORM ? "gps-debug-new" : "gps-debug-legacy";
    e2.style.left = q2.x + "px"; e2.style.top = q2.y + "px";
    e2.innerHTML = '<div class="h"></div><div class="d"></div>';
    ov.appendChild(e2);
  }
  // ===== LABEL NOMBER (sentiasa nampak + de-clutter) =====
  if(LBL && LBL.length){
    const minh=14;            // saiz min skrin untuk label (boleh baca)
    const maxh=300;           // saiz max (zoom dalam: label crop lebih tajam dari tile blur)
    const placed=[];          // kotak label yang sudah diletak (untuk elak tindih)
    for(const lb of LBL){
      const q=P(lb.x, lb.y);
      if(q.x<-60||q.y<-60||q.x>S.vw+60||q.y>S.vh+60) continue;
      const fsc=k/sc;         // skala dunia -> skrin
      let w=lb.sw*fsc, h=lb.sh*fsc;
      let scale=1;
      if(h<minh){ scale=minh/h; w*=scale; h=minh; }
      if(h>maxh) continue;    // zoom sangat dalam - peta asal sudah tunjuk
      const L=q.x-w/2, T=q.y-h/2;
      // de-clutter: skip hanya jika bertindih TERUK (>35% luas label)
      let overlap=false;
      for(const p of placed){
        const ox=Math.min(L+w,p.x+p.w)-Math.max(L,p.x);
        const oy=Math.min(T+h,p.y+p.h)-Math.max(T,p.y);
        if(ox>0&&oy>0){
          const a=ox*oy;
          if(a>0.35*w*h||a>0.35*p.w*p.h){overlap=true;break;}
        }
      }
      if(overlap) continue;
      placed.push({x:L, y:T, w:w, h:h});
      const e=document.createElement("div"); e.className="lblnum";
      e.style.left=L+"px"; e.style.top=T+"px";
      e.style.width=w+"px"; e.style.height=h+"px";
      e.style.backgroundImage="url(labels.png?v="+APP_V+")";
      e.style.backgroundPosition=(-lb.sx*scale)+"px "+(-lb.sy*scale)+"px";
      e.style.backgroundSize=(1024*scale)+"px "+(1024*scale)+"px";
      ov.appendChild(e);
    }
  }
}

let drag=null;
map.addEventListener("pointerdown",e=>{
  if(e.target.closest("button")) return;
  if(S.mode) return;
  S.follow=false; upUI();
  drag={x:e.clientX,y:e.clientY,cx:S.cx,cy:S.cy};
  map.classList.add("dragging"); try{ map.setPointerCapture(e.pointerId); }catch(e2){}
});
map.addEventListener("pointermove",e=>{ if(!drag) return;
  S.cx=drag.cx-(e.clientX-drag.x)/S.scale;
  S.cy=drag.cy-(e.clientY-drag.y)/S.scale; render(); });
const stopD=()=>{ drag=null; map.classList.remove("dragging"); };
map.addEventListener("pointerup",stopD); map.addEventListener("pointercancel",stopD);
let pinch=null;
map.addEventListener("touchstart",e=>{ if(e.touches.length===2){
  const a=e.touches[0],b=e.touches[1];
  pinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),s:S.scale};
  S.follow=false; upUI(); }},{passive:true});
map.addEventListener("touchmove",e=>{ if(e.touches.length===2&&pinch){
  const a=e.touches[0],b=e.touches[1];
  setScale(pinch.s*(Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)/pinch.d));
  e.preventDefault(); }},{passive:false});
map.addEventListener("touchend",()=>{ pinch=null; });
function minScale(){
  const vw=S.vw||map.clientWidth||window.innerWidth||360;
  const vh=S.vh||map.clientHeight||window.innerHeight||640;
  const fit=Math.max(vw/META.width, vh/META.height);
  // Benarkan zoom-out sehingga 40% fitCover (peta boleh lebih kecil dari skrin)
  return fit*0.4;
}
function setScale(v){
  // skala bar dikemas kini melalui render -> upScaleBar
  const mn=minScale();
  S.scale=Math.max(mn,Math.min(12,v));
  render();
}
map.addEventListener("wheel",e=>{ e.preventDefault(); setScale(S.scale*(e.deltaY<0?1.16:1/1.16)); },{passive:false});
map.addEventListener("click",e=>{
  if(!S.mode) return;
  const r=map.getBoundingClientRect();
  const px=S.cx+(e.clientX-r.left-S.vw/2)/S.scale;
  const py=S.cy+(e.clientY-r.top-S.vh/2)/S.scale;
  const ll=px2ll(px,py);
  if(S.mode==="pin"){ S.pins.push(ll); persistAll(); toast("Placemark ditambah",1700,"ok"); }
  else if(S.mode==="measure"){ S.measure.push(ll);
    toast(S.measure.length===1?"Titik mula ditetapkan":"Titik ditambah",1500,"ok"); }
  else if(S.mode==="geofence"){ S.geofences.push({lon:ll.lon,lat:ll.lat,r:150}); toast("Geofence 150 m",1700,"ok"); }
  render();
});

function sheet(title,body){ $("#sht").textContent=title; $("#shb").innerHTML=body;
  $("#scrim").classList.add("on"); $("#sheet").classList.add("on"); }
function closeS(){ $("#scrim").classList.remove("on"); $("#sheet").classList.remove("on"); }
$("#scrim").onclick=closeS; $("#shx").onclick=closeS;

function stSheet(){
  const g=S.gps, L=lvl(S.scale);
  let h="";
  h+='<div class="kv"><span class="k">Latitude</span><span class="v mono">'+(g?g.lat.toFixed(6):"—")+'</span></div>';
  h+='<div class="kv"><span class="k">Longitude</span><span class="v mono">'+(g?g.lon.toFixed(6):"—")+'</span></div>';
  h+='<div class="kv"><span class="k">Ketepatan GPS</span><span class="v">'+(S.acc?"±"+Math.round(S.acc)+" m":"—")+'</span></div>';
  h+='<div class="kv"><span class="k">Skala peta</span><span class="v">'+L.metersPerPixel.toFixed(2)+' m/piksel</span></div>';
  h+='<div class="kv"><span class="k">Arah</span><span class="v">'+(S.heading!=null?Math.round(S.heading)+"°":"—")+'</span></div>';
  h+='<div class="kv"><span class="k">Titik track</span><span class="v">'+S.pts.length+'</span></div>';
  h+='<div class="kv"><span class="k">Placemark</span><span class="v">'+S.pins.length+'</span></div>';
  h+='<div class="hint">Tindakan</div>';
  h+='<button class="bbtn" id="b-loc">'+IC.gps+'<span>Kemas kini lokasi</span></button>';
  h+='<button class="bbtn g" id="b-fit">'+IC.layers+'<span>Papar seluruh peta</span></button>';
  sheet("Status",h);
  $("#b-loc").onclick=()=>{ closeS(); locate(); };
  $("#b-fit").onclick=()=>{ closeS(); fitAll(); };
}
function moreSheet(){
  const items=[
    ["hist","layers","Sejarah & GPX","Trek tersimpan · eksport"],
    ["geofence","hex","Geofence","Tanda kawasan bersaiz 150 m"],
    ["layers","layers","Lapisan","Tunjuk atau sorok pada peta"],
    ["dl","dl","Muat turun peta","Simpan salinan resolusi penuh"],
    ["export","dl","Backup storan","Eksport Placemark/Measure/Geofence/Trek"],
    ["clear","undo","Kosongkan semua","Buang semua tanda pada peta"],
  ];
  let h='<div class="hint">Alat lain</div>';
  for(const it of items){
    h+='<button class="opt" data-o="'+it[0]+'"><span class="oi">'+IC[it[1]]+'</span>'+
       '<span class="ot"><b>'+it[2]+'</b><em>'+it[3]+'</em></span>'+
       '<span class="ch">'+IC.chev+'</span></button>';
  }
  h+='<div class="hint">Maklumat peta</div>';
  h+='<div class="kv"><span class="k">Sumber</span><span class="v">GeoPDF (QGIS)</span></div>';
  h+='<div class="kv"><span class="k">Saiz</span><span class="v">3408 × 2452 px</span></div>';
  h+='<div class="kv"><span class="k">Liputan</span><span class="v">8.99 × 6.53 km</span></div>';
  h+='<div class="kv"><span class="k">Zoom</span><span class="v">z0 – z4</span></div>';
  sheet("Lagi",h);
  $("#shb").querySelectorAll("[data-o]").forEach(el=>{
    el.onclick=()=>{ const o=el.dataset.o;
      if(o==="hist"){ histSheet(); }
      else if(o==="geofence"){ closeS(); setMode("geofence"); }
      else if(o==="dl"){ window.open("kerilla-map.png","_blank"); }
      else if(o==="export"){ exportStorage(); }
      else if(o==="clear"){ S.pins=[]; S.measure=[]; S.geofences=[]; S.pts=[]; persistAll(); localStorage.removeItem("kerilla.hist"); render(); closeS(); toast("Semua dibuang",1600); }
      else if(o==="layers"){ toast("Track: "+S.pts.length+" · Placemark: "+S.pins.length,2200); }
    };
  });
}
function persistAll(){
  try{
    localStorage.setItem("kerilla.pins", JSON.stringify(S.pins));
    localStorage.setItem("kerilla.measure", JSON.stringify(S.measure));
    localStorage.setItem("kerilla.geo", JSON.stringify(S.geofences));
  }catch(e){}
}
function restoreAll(){
  try{
    const p=JSON.parse(localStorage.getItem("kerilla.pins")||"null");
    if(Array.isArray(p)) S.pins=p;
    const m=JSON.parse(localStorage.getItem("kerilla.measure")||"null");
    if(Array.isArray(m)) S.measure=m;
    const g=JSON.parse(localStorage.getItem("kerilla.geo")||"null");
    if(Array.isArray(g)) S.geofences=g;
  }catch(e){}
}
/* ===== EXPORT & VERSI STORAN (sebelum suis transform) ===== */
function exportStorage(){
  try{
    const data={
      ver: 1,
      at: new Date().toISOString(),
      transform: META ? META.transform : null,
      transformNote: 'legacy (sebelum suis 300dpi)',
      pins: S.pins,
      measure: S.measure,
      geofences: S.geofences,
      hist: histLoad(),
    };
    const json=JSON.stringify(data, null, 2);
    const blob=new Blob([json], {type:'application/json'});
    const u=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=u; a.download='kerilla-backup-'+Date.now()+'.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(u);
    toast('Backup storan dieksport', 2200, 'ok');
  }catch(e){ toast('Gagal export: '+e.message, 3000, 'err'); }
}
function backupStorageLegacy(){
  try{
    const bk={at:new Date().toISOString(), pins:S.pins, measure:S.measure, geofences:S.geofences};
    const prev=JSON.parse(localStorage.getItem('kerilla.backup.legacy')||'[]');
    prev.unshift(bk); while(prev.length>5) prev.pop();
    localStorage.setItem('kerilla.backup.legacy', JSON.stringify(prev));
    return true;
  }catch(e){ return false; }
}
function histSheet(){
  const h0=histLoad();
  let h='<div class="hint">Sejarah Trek ('+h0.length+')</div>';
  if(!h0.length){
    h+='<div class="kv"><span class="k">Tiada rekod</span><span class="v">Rakam trek dulu</span></div>';
  } else {
    h+='<div id="hlist">';
    for(const r of h0){
      const dt=new Date(r.id);
      h+='<div class="hrow" data-id="'+r.id+'">';
      h+='<div class="hi"><b>'+esc2(r.name)+"</b><em>"+r.n+" titik · "+fmtD(r.d)+(r.spd?" · "+r.spd+" km/j":"")+"</em></div>";
      h+='<div class="hb">';
      h+='<button class="hbtn2" data-act="load" title="Muat semula">'+IC.layers+"</button>";
      h+='<button class="hbtn2" data-act="gpx" title="Eksport GPX">'+IC.dl+"</button>";
      h+='<button class="hbtn2 del" data-act="del" title="Buang">'+IC.close+"</button>";
      h+="</div></div>";
    }
    h+="</div>";
  }
  h+='<div class="hint">Tindakan</div>';
  h+='<button class="bbtn" id="h-exp">'+IC.dl+"<span>Eksport SEMUA trek (satu GPX)</span></button>";
  h+='<button class="bbtn del" id="h-clr">'+IC.undo+"<span>Kosongkan sejarah</span></button>";
  sheet("Sejarah",h);
  const list=$("#shb");
  list.querySelectorAll(".hrow").forEach(row=>{
    row.querySelectorAll(".hbtn2").forEach(b=>{
      b.onclick=()=>{
        const id=+row.dataset.id, act=b.dataset.act;
        const rec=histLoad().find(r=>r.id===id);
        if(!rec) return;
        if(act==="load"){
          S.pts=rec.pts; S.rec=false; upNav(); render(); closeS();
          toast("Trek dimuat: "+fmtD(rec.d),2600,"ok");
        } else if(act==="gpx"){ dlGPX(rec); toast("GPX dimuat turun",2000,"ok"); }
        else if(act==="del"){ histDel(id); histSheet(); }
      };
    });
  });
  const ex=$("#h-exp");
  if(ex) ex.onclick=()=>{
    const all=histLoad();
    if(!all.length){ toast("Tiada trek",1800,"err"); return; }
    const H=['<?xml version="1.0" encoding="UTF-8"?>','<gpx version="1.1" creator="Kerilla" xmlns="http://www.topografix.com/GPX/1/1">'];
    for(const r of all){
      H.push('  <trk><name>'+r.name+'</name><trkseg>');
      for(const p of r.pts) H.push('    <trkpt lat="'+p.lat+'" lon="'+p.lon+'"><time>'+new Date(p.t).toISOString()+'</time></trkpt>');
      H.push('  </trkseg></trk>');
    }
    H.push("</gpx>");
    const b=new Blob([H.join(String.fromCharCode(10))],{type:"application/gpx+xml"});
    const u=URL.createObjectURL(b);
    const a=document.createElement("a");
    a.href=u; a.download="kerilla-semua-trek.gpx";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(u),900);
  };
  const cl=$("#h-clr");
  if(cl) cl.onclick=()=>{ histClear(); histSheet(); toast("Sejarah dikosongkan",1800); };
}
function esc2(x){ return String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
function setMode(m){
  S.mode=(S.mode===m)?null:m;
  document.querySelectorAll(".nv").forEach(n=>n.classList.toggle("on", n.dataset.nv===S.mode));
  if(S.mode){ const n={pin:"Placemark",measure:"Ukur",geofence:"Geofence"};
    toast("Ketik pada peta untuk letak "+n[S.mode],2400); }
}

function startRec(){
  if(!S.gps){ toast("Tekan Lokasi dahulu",3000,"err"); return; }
  S.rec=true; S.pts=[{lon:S.gps.lon,lat:S.gps.lat,t:Date.now()}];
  S.follow=true; upUI(); upNav();
  toast("Merakam — mula berjalan",3000,"ok");
}
function stopRec(){
  S.rec=false; upNav();
  const n=S.pts.length, d=dist();
  if(n<2){ toast("Berhenti — kurang titik",3000,"err"); S.pts=[]; render(); return; }
  const s=(S.pts[n-1].t-S.pts[0].t)/1000;
  const dt=new Date();
  const nm="Trek "+dt.toLocaleDateString("ms-MY",{day:"numeric",month:"short"})+" "+dt.toLocaleTimeString("ms-MY",{hour:"2-digit",minute:"2-digit"});
  histSave({type:"track",name:nm,pts:S.pts,n:n,d:Math.round(d*10)/10,s:Math.round(s),spd:(s>3)?Math.round((d/s)*3.6*10)/10:0});
  toast("Trek disimpan ✓ "+fmtD(d),3600,"ok");
}
const LSK="kerilla.hist";
function histLoad(){
  try{ return JSON.parse(localStorage.getItem(LSK)||"[]"); }catch(e){ return []; }
}
function histSave(rec){
  try{
    const h=histLoad();
    rec.id=Date.now();
    h.unshift(rec);
    while(h.length>30) h.pop();
    localStorage.setItem(LSK, JSON.stringify(h));
    return rec.id;
  }catch(e){ return 0; }
}
function histDel(id){
  try{ localStorage.setItem(LSK, JSON.stringify(histLoad().filter(r=>r.id!==id))); }catch(e){}
}
function histClear(){
  try{ localStorage.removeItem(LSK); }catch(e){}
}
function gpxOf(rec){
  const NLC=String.fromCharCode(10);
  const H=['<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="Kerilla" xmlns="http://www.topografix.com/GPX/1/1">',
    '  <trk><name>'+rec.name+'</name><trkseg>'];
  for(const p of rec.pts){
    H.push('    <trkpt lat="'+p.lat+'" lon="'+p.lon+'"><time>'+new Date(p.t).toISOString()+'</time></trkpt>');
  }
  H.push('  </trkseg></trk>','</gpx>');
  return H.join(NLC);
}
function dlGPX(rec){
  const b=new Blob([gpxOf(rec)],{type:'application/gpx+xml'});
  const u=URL.createObjectURL(b);
  const a=document.createElement('a');
  a.href=u; a.download=rec.name.replace(/[^a-z0-9-]/gi,'_')+'.gpx';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),900);
}

function dist(){ let d=0;
  for(let i=1;i<S.pts.length;i++) d+=hav(S.pts[i-1].lon,S.pts[i-1].lat,S.pts[i].lon,S.pts[i].lat);
  return d; }
function upNav(){
  const t=document.querySelector('.nv[data-nv="rec"]');
  if(!t) return;
  t.classList.toggle("on",S.rec);
  const s=t.querySelector("span"); if(s) s.textContent=S.rec?"Henti":"Rakam";
}

document.querySelectorAll(".nv").forEach(n=>{
  n.onclick=()=>{ const k=n.dataset.nv;
    if(k==="loc"){ locate(); return; }
    if(k==="rec"){ if(S.rec) stopRec(); else startRec(); return; }
    if(k==="more"){ moreSheet(); return; }
    setMode(k);
  };
});

function fitAll(){ S.follow=false; upUI();
  S.scale=Math.min(S.vw/META.width,S.vh/META.height)*.94;
  S.cx=META.width/2; S.cy=META.height/2; render(); toast("Seluruh peta",1500); }
function upUI(){
  const b=$("#f-loc"); if(b) b.classList.toggle("on",S.follow);
  const c=$("#chip"); if(!c) return;
  if(S.gps){ c.classList.add("on");
    $("#chipt").textContent="GPS "+(S.acc?Math.round(S.acc)+"m":"aktif"); }
  else c.classList.remove("on");
}
$("#f-loc").onclick=locate;
$("#f-in").onclick=()=>setScale(S.scale*1.5);
$("#f-out").onclick=()=>setScale(S.scale/1.5);
$("#h-menu").onclick=stSheet;
$("#h-share").onclick=()=>window.open("kerilla-map.png","_blank");
/* Legenda: ketik = buka/tutup, TEKAN LAMA = pin (kekal buka) */
let lgPin=false, lgT=null, lgLong=false;
const lghd=$("#lghd"), lgel=$("#legend");
function lgOpen(){ lgel.classList.remove("min"); }
function lgClose(){ if(!lgPin) lgel.classList.add("min"); }
function setPin(){
  lgPin=!lgPin;
  lgel.classList.toggle("pinned", lgPin);
  if(lgPin){ lgOpen(); toast("Legenda dipin — kekal terbuka",2600,"ok"); }
  else toast("Pin legenda dibuang",1900);
}
lghd.addEventListener("pointerdown",()=>{
  lgLong=false;
  lgT=setTimeout(()=>{ lgLong=true; setPin(); }, 550);
});
lghd.addEventListener("pointerup",()=>{ clearTimeout(lgT); });
lghd.addEventListener("pointercancel",()=>{ clearTimeout(lgT); });
lghd.addEventListener("pointerleave",()=>{ clearTimeout(lgT); });
lghd.addEventListener("click",()=>{
  if(lgLong){ lgLong=false; return; }
  if(lgPin){ toast("Legenda dipin — tekan lama untuk lepas",2200); return; }
  lgel.classList.toggle("min");
});

function locate(){
  if(!navigator.geolocation){ toast("Peranti tidak sokong GPS",3000,"err"); return; }
  toast("Mencari lokasi…",4500);
  navigator.geolocation.getCurrentPosition(p=>{
    fix(p,true); toast("Dijumpai — ±"+Math.round(p.coords.accuracy)+" m",3000,"ok");
  },e=>{ const m={1:"Kebenaran lokasi ditolak. Buka tetapan laman.",
    2:"GPS tidak tersedia. Hidupkan Location telefon.",3:"Timeout. Cuba di tempat terbuka."}[e.code]||e.message;
    toast(m,6500,"err"); },{enableHighAccuracy:true,timeout:60000,maximumAge:0});
  if(S.watch==null){ S.watch=navigator.geolocation.watchPosition(p=>fix(p,false),()=>{},
    {enableHighAccuracy:true,timeout:60000,maximumAge:0}); }
}
function fix(pos,center){
  const c=pos.coords;
  S.gps={lon:c.longitude,lat:c.latitude}; S.acc=c.accuracy;
  if(c.heading!=null&&!isNaN(c.heading)){ S.heading=c.heading;
    const n=$("#nd"); if(n) n.style.transform="rotate("+c.heading+"deg)"; }
  if(S.rec){ const last=S.pts[S.pts.length-1];
    if(!last||hav(last.lon,last.lat,c.longitude,c.latitude)>=2){
      S.pts.push({lon:c.longitude,lat:c.latitude,t:Date.now()}); } }
  if(center){
    S.follow=true;
    // Zoom ke tahap GUNA: papar ~900 m melintang -> nombor task jelas segera.
    // 900m/2.645mpp = 340px peta pada skrin 360px => digit 21px => ~45px skrin.
    const skalaGuna = S.vw / (900/META.gsdMeters);
    S.scale = Math.max(S.scale, Math.min(skalaGuna, 3));
  }
  upUI();
  if($("#sheet").classList.contains("on")&&$("#sht").textContent==="Status") stSheet();
  render();
}

/* ===== SCALE BAR — kira panjang sebenar ikut zoom ===== */
function niceLen(m){
  const pow=Math.pow(10,Math.floor(Math.log10(m)));
  const n=m/pow;
  const mult = n>=5?5 : n>=2?2 : 1;
  return mult*pow;
}
function upScaleBar(){
  const el=$("#sb-txt"), ln=$("#sb-line"), sc=$("#sb-scale");
  if(!el||!META) return;
  // Pelindung: viewport/scale tak sah (tab tersembunyi, display:none, dsb)
  if(!(S.vw>0)||!(S.scale>0)) {
    if(ln) ln.style.width="0px";
    el.textContent="— m";
    if(sc) sc.textContent="— m/px";
    return;
  }
  const mpp = META.gsdMeters / S.scale;                // meter per piksel skrin
  const target = 110;                                   // sasaran lebar px
  const len = niceLen(target*mpp);                      // panjang bulat
  const px = len/mpp;                                   // lebar sebenar px
  ln.style.width = px.toFixed(1)+"px";
  ln.style.flex = "0 0 auto";
  el.textContent = len>=1000 ? (len/1000)+" km" : len+" m";
  if(sc) sc.textContent = mpp.toFixed(2)+" m/px";
}

function legend(){
  const items=[
    ["#b9a7d9","Padang Kerajaan"],
    ["#e3776b","Kawasan Terusaha"],
    ["#f4d94a","Kawasan Terpilih"],
    ["#3a6b58","Sempadan"],
    ["#5b93a6","Sungai / Air"],
    ["#e8823c","Laluan / Jalan"],
  ];
  $("#lgbd").innerHTML=items.map(it=>'<div class="lgr"><span class="sw" style="background:'+it[0]+'"></span>'+it[1]+'</div>').join("");
}

async function boot(withGps){
  restoreAll();
  await checkVersion();
  META=await(await fetch("map-meta.json?v="+APP_V,{cache:"no-cache"})).json();
  applyTransform();
  backupIfTransformSwitched();
  $("#hsub").textContent=META.gsdMeters.toFixed(2)+" m/px · Kelantan";
  S.vw=map.clientWidth; S.vh=map.clientHeight;
  fitCover();
  const intro=$("#intro"); if(intro) intro.remove();
  legend(); render();
  const onResize = () => {
    const wasFull = S.scale <= minScale() * 1.002;
    S.vw = map.clientWidth; S.vh = map.clientHeight;
    if (wasFull) fitCover();
    render();
  };
  addEventListener("resize", onResize);
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(map);
  if (window.visualViewport) visualViewport.addEventListener("resize", onResize);
  addEventListener("orientationchange",()=>setTimeout(onResize,300));
  upUI(); upNav();
  if(withGps) locate();
  else toast("Seret · pinch zoom · ◎ untuk GPS",3600);
}
/* ===== CACHE-BUSTING =====
   Cloudflare tidak cache index.html (DYNAMIC), tetapi browser boleh
   simpan CSS/JS ikut heuristik. Kita:
     1. tambah ?v=APP_V pada fetch metadata & tile
     2. semak version.json setiap boot; jika berubah -> reload sekali
   Ini memastikan pengguna tidak terlepas pembetulan penting. */
async function checkVersion(){
  try{
    const r=await fetch("version.json?t="+Date.now(),{cache:"no-store"});
    const j=await r.json();
    if(j.v && j.v!==APP_V){
      const seen=sessionStorage.getItem("appv");
      if(seen!==j.v){
        sessionStorage.setItem("appv", j.v);
        toast("Versi baharu — memuat semula…",2500,"ok");
        setTimeout(()=>location.reload(true), 1200);
      }
    }
  }catch(e){ /* offline atau tiada fail — abaikan */ }
}

$("#b-gps").onclick=()=>boot(true);
$("#b-map").onclick=()=>boot(false);


// ═══ PELINDUNG ZOOM ═══
// Halang browser zoom-out (user pinch) yang membuatkan UI kecil.
let _lastScale=1, _zoomFixes=0;
function zoomGuard(){
  try{
    const vv=window.visualViewport;
    if(vv && vv.scale>0 && Math.abs(vv.scale-_lastScale)>0.02){
      _lastScale=vv.scale;
      if(vv.scale<0.95 && _zoomFixes<8){
        _zoomFixes++;
        document.documentElement.style.setProperty("--zr", vv.scale);
        vv.scale=1;
      }
    }
  }catch(e){}
}
try{
  if(window.visualViewport){
    visualViewport.addEventListener("resize", zoomGuard);
    visualViewport.addEventListener("scroll", zoomGuard);
    setInterval(zoomGuard, 1500);
  }
}catch(e){}
