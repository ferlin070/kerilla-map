import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");
const NL = String.fromCharCode(10);
const errors = [];

// 1. Buang blok loadLabels
const lblStart = "/* ===== LAPISAN LABEL NOMBER TASK ===== */";
const lblEnd = "loadLabels();";
const lsi = s.indexOf(lblStart);
const lei = s.indexOf(lblEnd) + lblEnd.length;
if(lsi>=0 && lei>lsi){
  s = s.slice(0, lsi) + s.slice(lei);
  console.log("1a. loadLabels block dibuang");
} else errors.push("loadLabels block tidak jumpa");

// 2. Buang render label block
const rStart = "  // ===== LABEL NOMBER";
const rEnd = "let drag=null;";
const rsi = s.indexOf(rStart);
const rei = s.indexOf(rEnd);
if(rsi>=0 && rei>rsi){
  s = s.slice(0, rsi) + s.slice(rei);
  console.log("2a. render label block dibuang");
} else errors.push("render label block tidak jumpa");

// 3. Buang SHOW_LABELS flag
const flagIdx = s.indexOf("const SHOW_LABELS");
if(flagIdx>=0){
  const lineEnd = s.indexOf(NL, flagIdx);
  s = s.slice(0, flagIdx) + s.slice(lineEnd+1);
  console.log("3a. SHOW_LABELS flag dibuang");
} else errors.push("SHOW_LABELS flag tidak jumpa");

fs.writeFileSync("app-core.js", s);
console.log("");
if(errors.length) console.log("ERRORS:", errors.join("; "));
else console.log("Patch label selesai");
