import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");
const NL = String.fromCharCode(10);

// 1. Tambah flag SHOW_LABELS selepas DEBUG_DUAL_GPS
const anchorFlag = "const DEBUG_DUAL_GPS = false;       // true=papar 2 dot GPS serentak (merah=lama, hijau=baru)";
const addFlag = anchorFlag + NL +
  "const SHOW_LABELS = false;         // false=matikan overlay label lama (untuk semakan peta tulen)";
if(!s.includes(anchorFlag)){ console.log("GAGAL: anchor flag tidak jumpa"); process.exit(1); }
s = s.replace(anchorFlag, addFlag);

// 2. Matikan label overlay guna flag
const anchorLbl = "  // ===== LABEL NOMBER (sentiasa nampak + de-clutter) =====\n  if(LBL && LBL.length){";
const addLbl = "  // ===== LABEL NOMBER (sentiasa nampak + de-clutter) =====\n  if(SHOW_LABELS && LBL && LBL.length){";
if(!s.includes("  if(LBL && LBL.length){")){ console.log("GAGAL: label block tidak jumpa"); process.exit(1); }
s = s.replace("  if(LBL && LBL.length){", "  if(SHOW_LABELS && LBL && LBL.length){");

// 3. Tambah fungsi goToCoord selepas fitCover
const anchorFit = "function fitCover(){\n  const vw=S.vw||map.clientWidth||window.innerWidth||360;\n  const vh=S.vh||map.clientHeight||window.innerHeight||640;\n  S.scale = Math.max(vw / META.width, vh / META.height);\n  S.cx = META.width/2;\n  S.cy = S.gps ? ll2px(S.gps.lon,S.gps.lat).row : META.height/2;\n}";
const addFit = anchorFit + NL +
  "function goToCoord(lat, lon, sc){\n" +
  "  if(!META) return;\n" +
  "  S.follow=false;\n" +
  "  const f=ll2px(lon, lat);\n" +
  "  S.cx=f.col; S.cy=f.row;\n" +
  "  if(sc) S.scale=Math.max(minScale(), Math.min(12, sc));\n" +
  "  render();\n" +
  "  const pin=document.createElement(\"div\");\n" +
  "  pin.className=\"pin-i\";\n" +
  "  const q=P(f.col,f.row);\n" +
  "  pin.style.left=q.x+\"px\"; pin.style.top=q.y+\"px\";\n" +
  "  pin.innerHTML='<svg viewBox=\"0 0 24 24\" fill=\"#e8823c\" stroke=\"#fff\" stroke-width=\"1.3\"><path d=\"M12 21s7-6.5 7-11a7 7 0 10-14 0c0 4.5 7 11 7 11z\"/><circle cx=\"12\" cy=\"10\" r=\"2.4\" fill=\"#fff\" stroke=\"none\"/></svg>';\n" +
  "  pin.style.transform=\"translate(-50%,-100%)\";\n" +
  "  ov.appendChild(pin);\n" +
  "  setTimeout(()=>pin.remove(), 5000);\n" +
  "  toast(\"Pergi ke \"+lat.toFixed(5)+\", \"+lon.toFixed(5), 2000);\n" +
  "}";

if(!s.includes("function fitCover(){")){ console.log("GAGAL: fitCover tidak jumpa"); process.exit(1); }
// ganti fitCover dengan versi + goToCoord
s = s.replace(anchorFit, addFit);

fs.writeFileSync("app-core.js", s);
console.log("OK: SHOW_LABELS flag + goToCoord ditambah");
