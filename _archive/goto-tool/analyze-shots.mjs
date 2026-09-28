import { PNG } from "pngjs";
import fs from "node:fs";

// Analisa warna/struktur sekitar setiap titik untuk kenal pasti ciri
for(const name of ["kuil","padang","pejabat"]){
  const img = PNG.sync.read(fs.readFileSync("shot-"+name+".png"));
  const S = img.width;
  const c = S/2; // center (pin)
  
  // kira purata warna dalam radius kecil sekitar center (ciri di mana pin jatuh)
  console.log("=== " + name + " (pin di center) ===");
  
  // sample warna pada beberapa offset sekitar center (N/S/E/W + center)
  const offsets = [[0,0],[0,-30],[0,30],[-30,0],[30,0],[-60,0],[60,0],[0,-60],[0,60]];
  for(const [dx,dy] of offsets){
    const x = Math.round(c+dx), y = Math.round(c+dy);
    if(x<0||y<0||x>=S||y>=S) continue;
    const i=(y*S+x)*4;
    console.log("  ("+dx+","+dy+") RGB("+img.data[i]+","+img.data[i+1]+","+img.data[i+2]+")");
  }
  console.log("");
}
