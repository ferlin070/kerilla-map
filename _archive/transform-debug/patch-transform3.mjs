import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");
const NL = String.fromCharCode(10);

// Panggil applyTransform() selepas META load
const anchor = 'META=await(await fetch("map-meta.json?v="+APP_V,{cache:"no-cache"})).json();';
if(!s.includes(anchor)){ console.log("GAGAL: META load tidak jumpa"); process.exit(1); }
s = s.replace(anchor, anchor + NL + "  applyTransform();");

fs.writeFileSync("app-core.js", s);
console.log("OK: applyTransform() dipanggil selepas META load");
