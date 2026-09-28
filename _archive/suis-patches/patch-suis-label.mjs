import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");
const NL = String.fromCharCode(10);
let changes = 0;

// ===== 1. BUANG LAPISAN LABEL (loadLabels, LBL, labels.png) =====
// Buang blok "LAPISAN LABEL NOMBER TASK" (loadLabels + panggilan)
const labelBlock = "/* ===== LAPISAN LABEL NOMBER TASK ===== */" + NL +
  "let LBL=null;" + NL +
  "async function loadLabels(){" + NL +
  "  try{" + NL +
  "    const r=await fetch(\"labels.json\",{cache:\"no-store\"});" + NL +
  "    LBL=await r.json();" + NL +
  "    const im=document.createElement(\"img\");" + NL +
  "    im.src=\"labels.png?v=\"+APP_V; im.id=\"lblatlas\";" + NL +
  "    im.style.display=\"none\";" + NL +
  "    document.body.appendChild(im);" + NL +
  "    if(META) render();" + NL +
  "  }catch(e){ console.warn(\"label gagal\",e); }" + NL +
  "}" + NL +
  "loadLabels();" + NL;

if(s.includes(labelBlock)){
  s = s.replace(labelBlock, "");
  changes++;
  console.log("1. label layer block dibuang");
} else {
  console.log("WARN: label block tidak dijumpai tepat - cuba cara lain");
}

// Buang render label block (SHOW_LABELS) - ganti dengan kosong
const renderLabel = "  // ===== LABEL NOMBER (sentiasa nampak + de-clutter) =====\n  if(SHOW_LABELS && LBL && LBL.length){";
if(s.includes("if(SHOW_LABELS && LBL && LBL.length){")){
  s = s.replace("if(SHOW_LABELS && LBL && LBL.length){", "if(false && LBL && LBL.length){ // label layer dibuang (tile 600dpi tunjuk nombor task asal)");
  changes++;
  console.log("2. render label disabled");
}

// Buang rujukan labels.png dalam draw (backgroundImage)
s = s.replace(/e.style.backgroundImage="url\(labels.png\?v="+APP_V\)";/g, "");
changes++;
console.log("3. labels.png background ref dibuang");

// Buang SHOW_LABELS flag (tak perlu lagi)
s = s.replace(/const SHOW_LABELS = false;.*?\n/, "");
changes++;
console.log("4. SHOW_LABELS flag dibuang");

fs.writeFileSync("app-core.js", s);
console.log("");
console.log("Selesai patch label: " + changes + " perubahan");
