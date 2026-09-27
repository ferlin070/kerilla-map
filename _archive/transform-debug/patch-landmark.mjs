import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");
const NL = String.fromCharCode(10);

// Tambah label lat/lon pada setiap pin (untuk semak georeferencing)
const anchor = "  for(const p of S.pins){ const f=ll2px(p.lon,p.lat), q=P(f.col,f.row);" + NL +
  "    const e=document.createElement(\"div\"); e.className=\"pin-i\";" + NL +
  "    e.innerHTML=PINSVG; e.style.left=q.x+\"px\"; e.style.top=q.y+\"px\"; ov.appendChild(e); }";

const add = "  for(const p of S.pins){ const f=ll2px(p.lon,p.lat), q=P(f.col,f.row);" + NL +
  "    const e=document.createElement(\"div\"); e.className=\"pin-i\";" + NL +
  "    e.innerHTML=PINSVG; e.style.left=q.x+\"px\"; e.style.top=q.y+\"px\"; ov.appendChild(e);" + NL +
  "    const lbl=document.createElement(\"div\"); lbl.className=\"pin-coord\";" + NL +
  "    lbl.textContent=p.lat.toFixed(6)+\", \"+p.lon.toFixed(6);" + NL +
  "    lbl.style.left=q.x+\"px\"; lbl.style.top=(q.y-20)+\"px\"; ov.appendChild(lbl); }";

if(!s.includes(anchor)){ console.log("GAGAL: pin render tidak jumpa"); process.exit(1); }
s = s.replace(anchor, add);
fs.writeFileSync("app-core.js", s);
console.log("OK: label lat/lon pada placemark ditambah");
