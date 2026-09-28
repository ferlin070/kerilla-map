import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const WEB = "web-600dpi";

// Copy statik dari web-kerilla (skin, css, dsb) tapi BUKAN raster/tile lama
const skin = fs.readFileSync("web-kerilla/skin.html", "utf8");
let core = fs.readFileSync("app-core.js", "utf8");

// Untuk preview 600dpi: guna transform baru (bukan legacy), dual GPS on
core = core.replace("const USE_LEGACY_TRANSFORM = true;", "const USE_LEGACY_TRANSFORM = false;");
core = core.replace("const DEBUG_DUAL_GPS = false;", "const DEBUG_DUAL_GPS = true;");

const VER = crypto.createHash("sha1").update(skin + core).digest("hex").slice(0, 8);
let out = skin.replaceAll("[[VER]]", VER).replaceAll("[[CORE]]", core);

fs.writeFileSync(path.join(WEB, "index.html"), out);
fs.writeFileSync(path.join(WEB, "app.html"), out);
fs.writeFileSync(path.join(WEB, "map.html"), out);
fs.writeFileSync(path.join(WEB, "version.json"), JSON.stringify({ v: VER, at: new Date().toISOString() }) + String.fromCharCode(10));

// Copy labels.png (renderer sedia ada guna labels.png untuk nombor task)
// Buat placeholder kosong dulu (labels akan dibuang selepas tile disahkan)
fs.copyFileSync("web-kerilla/labels.png", path.join(WEB, "labels.png"));
fs.copyFileSync("web-kerilla/labels.json", path.join(WEB, "labels.json"));

console.log("build 600dpi: " + (Buffer.byteLength(out)/1024).toFixed(1) + " KB, versi " + VER);
console.log("web-600dpi sedia (tiles + map-meta + labels + html)");
