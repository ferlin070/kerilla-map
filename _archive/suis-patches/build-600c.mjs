import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const WEB = "web-600dpi";
const skin = fs.readFileSync("web-kerilla/skin.html", "utf8");
let core = fs.readFileSync("app-core.js", "utf8");

// Preview 600dpi: transform baru (bukan legacy)
core = core.replace("const USE_LEGACY_TRANSFORM = true;", "const USE_LEGACY_TRANSFORM = false;");

const VER = crypto.createHash("sha1").update(skin + core).digest("hex").slice(0, 8);
let out = skin.replaceAll("[[VER]]", VER).replaceAll("[[CORE]]", core);
fs.writeFileSync(path.join(WEB, "index.html"), out);
fs.writeFileSync(path.join(WEB, "app.html"), out);
fs.writeFileSync(path.join(WEB, "map.html"), out);
fs.writeFileSync(path.join(WEB, "version.json"), JSON.stringify({ v: VER, at: new Date().toISOString() }) + String.fromCharCode(10));
console.log("build preview 600dpi (suis-ready): " + (Buffer.byteLength(out)/1024).toFixed(1) + " KB, versi " + VER);
