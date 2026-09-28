import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");
const NL = String.fromCharCode(10);

// ===== TOLAK KOORDINAT LUAR GPTS dalam goToCoord =====
// GPTS julat: lat 5.671238-5.730563, lon 102.057657-102.141177
// Tambah semakan dalam goToCoord
const anchor = "function goToCoord(lat, lon, sc){\n  if(!META) return;";
const add = "function goToCoord(lat, lon, sc){\n" +
  "  if(!META) return;" + NL +
  "  // Tolak koordinat di luar julat GPTS (dengan margin 0.005 deg ~ 500m)\n" +
  "  const LATMIN=5.6712386219-0.005, LATMAX=5.7305629358+0.005;" + NL +
  "  const LONMIN=102.0576569392-0.005, LONMAX=102.1411774321+0.005;" + NL +
  "  if(lat<LATMIN||lat>LATMAX||lon<LONMIN||lon>LONMAX){" + NL +
  "    toast('Koordinat di luar liputan peta (GPTS)', 3500, 'err');" + NL +
  "    return;" + NL +
  "  }";

if(s.includes(anchor)){
  s = s.replace(anchor, add);
  console.log("OK: semakan julat GPTS ditambah dalam goToCoord");
} else {
  console.log("WARN: anchor goToCoord tidak jumpa");
  // fallback: cari goToCoord
  const idx = s.indexOf("function goToCoord(lat, lon, sc){");
  console.log("goToCoord index:", idx);
}

fs.writeFileSync("app-core.js", s);
