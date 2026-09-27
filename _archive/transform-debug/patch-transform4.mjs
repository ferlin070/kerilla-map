import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");
const NL = String.fromCharCode(10);

// Cari blok render GPS utama
const anchor = "  if(S.gps){ const f=ll2px(S.gps.lon,S.gps.lat), q=P(f.col,f.row);" + NL +
  "    const e=document.createElement(\"div\"); e.className=\"gps\";" + NL +
  "    e.style.left=q.x+\"px\"; e.style.top=q.y+\"px\";" + NL +
  "    e.innerHTML='<div class=\"h\"></div><div class=\"d\"></div>'; ov.appendChild(e); }";

const add = anchor + NL +
  "  /* ===== DEBUG DUAL GPS: papar dot kedua guna transform lain ===== */" + NL +
  "  if(DEBUG_DUAL_GPS && S.gps && META.transformNew && META.transformLegacy){" + NL +
  "    const otherT = USE_LEGACY_TRANSFORM ? META.transformNew : META.transformLegacy;" + NL +
  "    const f2 = ll2pxT(S.gps.lon, S.gps.lat, otherT), q2 = P(f2.col, f2.row);" + NL +
  "    const e2 = document.createElement(\"div\");" + NL +
  "    e2.className = USE_LEGACY_TRANSFORM ? \"gps-debug-new\" : \"gps-debug-legacy\";" + NL +
  "    e2.style.left = q2.x + \"px\"; e2.style.top = q2.y + \"px\";" + NL +
  "    e2.innerHTML = '<div class=\"h\"></div><div class=\"d\"></div>';" + NL +
  "    ov.appendChild(e2);" + NL +
  "  }";

if(!s.includes(anchor)){ console.log("GAGAL: blok GPS tidak jumpa"); process.exit(1); }
s = s.replace(anchor, add);
fs.writeFileSync("app-core.js", s);
console.log("OK: debug dual GPS dot ditambah");
