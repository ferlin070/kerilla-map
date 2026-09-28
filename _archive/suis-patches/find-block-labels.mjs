import fs from "node:fs";

const labels = JSON.parse(fs.readFileSync("web-kerilla/labels.json","utf8"));
const scale = 7017/3408;

// label besar (h>=30) = mungkin label blok task "2 PM2002A"
console.log("=== LABEL BESAR (h>=30) - mungkin blok task ===");
console.log("");
const big = labels.filter(l=>l.h>=30);
for(const l of big){
  console.log("label @("+l.x+","+l.y+") saiz "+l.w+"x"+l.h+" -> 600dpi ("+(l.x*scale).toFixed(0)+","+(l.y*scale).toFixed(0)+")");
}
console.log("");
console.log("=== semua label dengan w>=50 (teks panjang, mungkin blok) ===");
const wide = labels.filter(l=>l.w>=50);
for(const l of wide.slice(0,20)){
  console.log("label @("+l.x+","+l.y+") saiz "+l.w+"x"+l.h+" -> 600dpi ("+(l.x*scale).toFixed(0)+","+(l.y*scale).toFixed(0)+")");
}
