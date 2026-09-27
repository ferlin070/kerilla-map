import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");

// 1. Tambah flag selepas "let META = null;"
const anchor = "const TILE = 256;
let META = null;";
const flag = "const TILE = 256;
let META = null;
/* ===== FLAG TOGOL TRANSFORM (untuk test fizikal lapangan) =====
   USE_LEGACY_TRANSFORM = true  -> guna transform LAMA (live sekarang, offset ~630m)
   USE_LEGACY_TRANSFORM = false -> guna transform BARU (300dpi, GPTS/LPTS betul)
   DEBUG_DUAL_GPS = true -> papar DUA dot GPS serentak (merah=lama, hijau=baru) */
const USE_LEGACY_TRANSFORM = true;
const DEBUG_DUAL_GPS = false;";
if(!s.includes(anchor)){ console.log("GAGAL anchor flag"); process.exit(1); }
s = s.replace(anchor, flag);

// 2. Tambah fungsi applyTransform selepas ll2px definition
const ll2pxDef = "const ll2px = (lon,lat) => { const t=META.transform;
  const d=t.A*t.E-t.B*t.D, dx=lon-t.C, dy=lat-t.F;
  return { col:(t.E*dx-t.B*dy)/d, row:(-t.D*dx+t.A*dy)/d }; };";
const applyT = ll2pxDef + "
/* Pilih transform aktif berdasarkan flag. Panggil sekali selepas META load. */
function applyTransform(){
  if(!META) return;
  META.transform = USE_LEGACY_TRANSFORM ? (META.transformLegacy || META.transform) : (META.transformNew || META.transform);
}
/* ll2px/px2ll untuk transform TERTENTU (bukan META.transform aktif) — untuk debug dual */
const ll2pxT = (lon,lat,t) => { const d=t.A*t.E-t.B*t.D, dx=lon-t.C, dy=lat-t.F;
  return { col:(t.E*dx-t.B*dy)/d, row:(-t.D*dx+t.A*dy)/d }; };";
if(!s.includes(ll2pxDef)){ console.log("GAGAL ll2px def"); process.exit(1); }
s = s.replace(ll2pxDef, applyT);

fs.writeFileSync("app-core.js", s);
console.log("OK: flag + applyTransform + ll2pxT ditambah");
