import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");
const NL = String.fromCharCode(10);

// ===== TOLAK KOORDINAT LUAR GPTS =====
const anchor = "function goToCoord(lat, lon, sc){";
if(s.includes(anchor)){
  const replacement = "function goToCoord(lat, lon, sc){" + NL +
    "  const LATMIN=5.6712386219-0.005, LATMAX=5.7305629358+0.005;" + NL +
    "  const LONMIN=102.0576569392-0.005, LONMAX=102.1411774321+0.005;" + NL +
    "  if(lat<LATMIN||lat>LATMAX||lon<LONMIN||lon>LONMAX){" + NL +
    "    toast('Koordinat di luar liputan peta (GPTS)', 3500, 'err');" + NL +
    "    return;" + NL +
    "  }";
  s = s.replace(anchor, replacement);
  console.log("1. semakan julat GPTS ditambah");
}

fs.writeFileSync("app-core.js", s);
