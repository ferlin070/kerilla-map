import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");
const NL = String.fromCharCode(10);

// ===== 1. Buang loadLabels block =====
const lblStart = "/* ===== LAPISAN LABEL NOMBER TASK ===== */";
const lblEnd = "loadLabels();";
const lsi = s.indexOf(lblStart);
const lei = s.indexOf(lblEnd) + lblEnd.length;
if(lsi>=0 && lei>lsi){
  s = s.slice(0, lsi) + s.slice(lei);
  console.log("1. loadLabels block dibuang");
}

// ===== 2. Buang render label if-block (seimbang brace) =====
// Cari "if(SHOW_LABELS" dan padankan { } untuk cari penutup if
const anchor = "if(SHOW_LABELS && LBL && LBL.length){";
const ai = s.indexOf(anchor);
if(ai>=0){
  // cari { selepas anchor
  const braceStart = s.indexOf("{", ai);
  // padankan brace
  let depth=0, end=-1;
  for(let i=braceStart; i<s.length; i++){
    if(s[i]==="{") depth++;
    else if(s[i]==="}"){ depth--; if(depth===0){ end=i; break; } }
  }
  if(end>=0){
    // potong dari awal anchor hingga selepas penutup if (termasuk newline)
    // cari hujung baris selepas end
    let lineEnd = s.indexOf(NL, end);
    if(lineEnd<0) lineEnd = end+1;
    s = s.slice(0, ai) + s.slice(lineEnd+1);
    console.log("2. render label if-block dibuang (brace seimbang)");
  } else {
    console.log("ERROR: brace tidak seimbang");
  }
}

// ===== 3. Buang SHOW_LABELS flag =====
const fi = s.indexOf("const SHOW_LABELS");
if(fi>=0){
  const fe = s.indexOf(NL, fi);
  s = s.slice(0, fi) + s.slice(fe+1);
  console.log("3. SHOW_LABELS flag dibuang");
}

fs.writeFileSync("app-core.js", s);
console.log("done");
