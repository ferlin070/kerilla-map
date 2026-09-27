import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");
const NL = String.fromCharCode(10);

const anchor = "const TILE = 256;" + NL + "let META = null;";
const flag = "const TILE = 256;" + NL + "let META = null;" + NL +
  "/* ===== FLAG TOGOL TRANSFORM (untuk test fizikal lapangan) ===== */" + NL +
  "const USE_LEGACY_TRANSFORM = true;  // true=lama(live), false=baru(300dpi GPTS betul)" + NL +
  "const DEBUG_DUAL_GPS = false;       // true=papar 2 dot GPS serentak (merah=lama, hijau=baru)";

if(!s.includes(anchor)){ console.log("GAGAL: anchor flag tidak jumpa"); process.exit(1); }
s = s.replace(anchor, flag);

const ll2pxDef = "const ll2px = (lon,lat) => { const t=META.transform;" + NL +
  "  const d=t.A*t.E-t.B*t.D, dx=lon-t.C, dy=lat-t.F;" + NL +
  "  return { col:(t.E*dx-t.B*dy)/d, row:(-t.D*dx+t.A*dy)/d }; };";
const add = ll2pxDef + NL +
  "function applyTransform(){" + NL +
  "  if(!META) return;" + NL +
  "  META.transform = USE_LEGACY_TRANSFORM ? (META.transformLegacy || META.transform) : (META.transformNew || META.transform);" + NL +
  "}" + NL +
  "const ll2pxT = (lon,lat,t) => { const d=t.A*t.E-t.B*t.D, dx=lon-t.C, dy=lat-t.F;" + NL +
  "  return { col:(t.E*dx-t.B*dy)/d, row:(-t.D*dx+t.A*dy)/d }; };";

if(!s.includes(ll2pxDef)){ console.log("GAGAL: ll2px def tidak jumpa"); process.exit(1); }
s = s.replace(ll2pxDef, add);

fs.writeFileSync("app-core.js", s);
console.log("OK: flag + applyTransform + ll2pxT ditambah");
