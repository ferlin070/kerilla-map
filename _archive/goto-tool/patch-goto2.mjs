import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");
const NL = String.fromCharCode(10);

// Tambah butang "Pergi ke koordinat" dalam menu Lagi (lebihSheet items)
const anchor = "    [\"export\",\"dl\",\"Backup storan\",\"Eksport Placemark/Measure/Geofence/Trek\"],";
const add = anchor + NL +
  "    [\"goto\",\"pin\",\"Pergi ke koordinat\",\"Masukkan lat, lon untuk pusat peta\"],";

if(!s.includes(anchor)){ console.log("GAGAL: anchor export tidak jumpa"); process.exit(1); }
s = s.replace(anchor, add);

// Tambah handler goto dalam onclick
const anchor2 = "      else if(o===\"export\"){ exportStorage(); }";
const add2 = anchor2 + NL +
  "      else if(o===\"goto\"){ gotoCoordPrompt(); }";

if(!s.includes(anchor2)){ console.log("GAGAL: anchor export handler tidak jumpa"); process.exit(1); }
s = s.replace(anchor2, add2);

// Tambah fungsi gotoCoordPrompt (selepas goToCoord)
const anchor3 = "function goToCoord(lat, lon, sc){";
const gotoPrompt = "function gotoCoordPrompt(){" + NL +
  "  const v=prompt('Pergi ke koordinat (lat, lon):', '5.68476, 102.10515');" + NL +
  "  if(!v) return;" + NL +
  "  const parts=v.split(',').map(x=>parseFloat(x.trim()));" + NL +
  "  if(parts.length<2 || isNaN(parts[0]) || isNaN(parts[1])){ toast('Format: lat, lon', 2500, 'err'); return; }" + NL +
  "  goToCoord(parts[0], parts[1], 6);" + NL +
  "}" + NL +
  "function goToCoord(lat, lon, sc){";

if(!s.includes(anchor3)){ console.log("GAGAL: goToCoord tidak jumpa"); process.exit(1); }
s = s.replace(anchor3, gotoPrompt);

fs.writeFileSync("app-core.js", s);
console.log("OK: butang 'Pergi ke koordinat' + gotoCoordPrompt ditambah");
