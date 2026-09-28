import fs from "node:fs";

// Analisa: saiz label task dalam pixel pada resolusi berbeza
const labels = JSON.parse(fs.readFileSync("web-kerilla/labels.json","utf8"));
const scale = 7017/3408; // 600dpi / live

console.log("=== SAIZ LABEL TASK (nombor 1-39) pada resolusi berbeza ===");
console.log("");
console.log("Label task kecil: h 9-32px pada peta live (3408px)");
console.log("Pada 600dpi (7017px): h = " + (9*scale).toFixed(0) + "-" + (32*scale).toFixed(0) + "px");
console.log("");
console.log("gsd: live 2.645 m/px, 600dpi 1.318 m/px");
console.log("Saiz fizikal label task (h min 9px):");
console.log("  live: 9px * 2.645 = " + (9*2.645).toFixed(1) + " m tinggi");
console.log("  600dpi: 18px * 1.318 = " + (18*1.318).toFixed(1) + " m tinggi (sama fizikal)");
console.log("");
console.log("Pada skrin (tile zoom penuh):");
console.log("  live z4 (gsd 2.645): label 9px -> 9px skrin (kecil, susah baca)");
console.log("  600dpi z5 (gsd 1.318): label 18px -> 18px skrin (2x lebih besar, lebih jelas)");
console.log("");
console.log("=== KESIMPULAN ===");
console.log("Tile 600 DPI memberi 2x resolusi -> nombor task 1-39 2x lebih jelas.");
console.log("Ini matlamat asal app tercapai dengan 600 DPI.");
