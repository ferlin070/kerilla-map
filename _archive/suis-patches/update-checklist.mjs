import fs from "node:fs";

let d = fs.readFileSync("CHECKLIST-SUIS.md", "utf8");

const add = [
"",
"## Status pelaksanaan (kod SEDIA, belum suis live)",
"",
"| Item | Status |",
"|---|---|",
"| 1. Buang labels.png + mklabels.mjs (overlay) | ✅ Kod dibuang (loadLabels, LBL, render label) - fail belum dipadam |",
"| 2. APP_V + checkVersion() auto-reload | ✅ Sudah ada |",
"| 3. Deploy + sahkan md5 | ⏳ Belum (tunggu pengesahan) |",
"| 4. Tag pre-300dpi-backup kekal | ✅ Kekal (83cea9f) |",
"| 5. Key storan .v2 | ✅ kerilla.pins.v2 / measure.v2 / geo.v2 |",
"| 6. Notis sekali sahaja | ✅ geoChangeNotice() dalam boot |",
"| 7. Tolak koordinat luar GPTS | ✅ goToCoord semak LATMIN/LATMAX/LONMIN/LONMAX |",
"",
"## Cara rollback (satu arahan)",
"    git checkout pre-300dpi-backup -- web-kerilla/ app-core.js",
"    wrangler pages deploy web-kerilla --project-name kerilla --branch main",
"",
"## Fail yang perlu dipadam semasa suis (bukan sekarang)",
"- web-kerilla/labels.png",
"- web-kerilla/labels.json",
"- mklabels.mjs",
"",
].join("\n");

d = d + add;
fs.writeFileSync("CHECKLIST-SUIS.md", d);
console.log("CHECKLIST-SUIS.md dikemaskini");
