import fs from "node:fs";
let s = fs.readFileSync("web-kerilla/skin.html", "utf8");
const NL = String.fromCharCode(10);

// Tambah CSS debug dot selepas .gps .d rule
const anchor = "@keyframes pulse{0%{transform:scale(.55);opacity:.9}70%{transform:scale(1.4);opacity:0}100%{opacity:0}}";
const add = anchor + NL +
  "/* ===== DEBUG DUAL GPS (merah=lama, hijau=baru) ===== */" + NL +
  ".gps-debug-new{position:absolute;z-index:13;pointer-events:none}" + NL +
  ".gps-debug-new .h{position:absolute;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;" + NL +
  "  background:rgba(34,197,94,.20);border:2px solid rgba(34,197,94,.75);animation:pulse 2.4s ease-out infinite}" + NL +
  ".gps-debug-new .d{position:absolute;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;" + NL +
  "  background:#22c55e;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.4)}" + NL +
  ".gps-debug-legacy{position:absolute;z-index:13;pointer-events:none}" + NL +
  ".gps-debug-legacy .h{position:absolute;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;" + NL +
  "  background:rgba(239,68,68,.20);border:2px solid rgba(239,68,68,.75);animation:pulse 2.4s ease-out infinite}" + NL +
  ".gps-debug-legacy .d{position:absolute;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;" + NL +
  "  background:#ef4444;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.4)}";

if(!s.includes(anchor)){ console.log("GAGAL: anchor CSS tidak jumpa"); process.exit(1); }
s = s.replace(anchor, add);
fs.writeFileSync("web-kerilla/skin.html", s);
console.log("OK: CSS debug dot ditambah (merah=lama, hijau=baru)");
