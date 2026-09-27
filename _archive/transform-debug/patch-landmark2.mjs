import fs from "node:fs";
let s = fs.readFileSync("web-kerilla/skin.html", "utf8");
const NL = String.fromCharCode(10);

const anchor = ".pin-i{position:absolute;z-index:11;pointer-events:none;transform:translate(-50%,-100%);";
const add = ".pin-coord{position:absolute;z-index:11;pointer-events:none;transform:translate(-50%,-100%);" + NL +
  "  font:600 10px/1.2 ui-monospace,monospace;color:#0b3d2e;background:rgba(255,255,255,.92);" + NL +
  "  padding:2px 5px;border-radius:4px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.25)}" + NL +
  ".pin-i{position:absolute;z-index:11;pointer-events:none;transform:translate(-50%,-100%);";

if(!s.includes(anchor)){ console.log("GAGAL: anchor pin-i tidak jumpa"); process.exit(1); }
s = s.replace(anchor, add);
fs.writeFileSync("web-kerilla/skin.html", s);
console.log("OK: CSS pin-coord ditambah");
