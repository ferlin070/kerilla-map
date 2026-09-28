import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");

// Buang seluruh render label block: dari "// ===== LABEL NOMBER" hingga penutup sebelum "let drag"
const startMarker = "  // ===== LABEL NOMBER (sentiasa nampak + de-clutter) =====\n";
const endMarker = "\nlet drag=null;";

const si = s.indexOf(startMarker);
const ei = s.indexOf(endMarker);

if(si>=0 && ei>si){
  s = s.slice(0, si) + s.slice(ei);
  console.log("OK: render label block dibuang sepenuhnya (dari index " + si + " ke " + ei + ")");
} else {
  console.log("WARN: si="+si+" ei="+ei);
}

fs.writeFileSync("app-core.js", s);

// sahkan
const remaining = (s.match(/LBL|labels\.png|SHOW_LABELS/g)||[]).length;
console.log("baki rujukan LBL/labels.png/SHOW_LABELS: " + remaining);
