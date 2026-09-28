import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");
const NL = String.fromCharCode(10);
let n=0;

// ===== KEY STORAN .v2 =====
const pairs = [
  ['localStorage.setItem("kerilla.pins"', 'localStorage.setItem("kerilla.pins.v2"'],
  ['localStorage.setItem("kerilla.measure"', 'localStorage.setItem("kerilla.measure.v2"'],
  ['localStorage.setItem("kerilla.geo"', 'localStorage.setItem("kerilla.geo.v2"'],
  ['localStorage.getItem("kerilla.pins"', 'localStorage.getItem("kerilla.pins.v2"'],
  ['localStorage.getItem("kerilla.measure"', 'localStorage.getItem("kerilla.measure.v2"'],
  ['localStorage.getItem("kerilla.geo"', 'localStorage.getItem("kerilla.geo.v2"'],
];
for(const [a,b] of pairs){
  const cnt = s.split(a).length-1;
  s = s.split(a).join(b);
  if(cnt) n += cnt;
}
console.log("1. key storan .v2:", n, "penggantian");

fs.writeFileSync("app-core.js", s);
console.log("done");
