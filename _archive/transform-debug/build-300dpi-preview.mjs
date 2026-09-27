import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const WEB = "web-300dpi";
const skin = fs.readFileSync("web-kerilla/skin.html", "utf8");
const core = fs.readFileSync("app-core-preview.mjs", "utf8");
const VER = crypto.createHash("sha1").update(skin + core).digest("hex").slice(0, 8);
const NL = String.fromCharCode(10);

let out = skin.replaceAll("[[VER]]", VER).replaceAll("[[CORE]]", core);
fs.writeFileSync(path.join(WEB, "index.html"), out);
fs.writeFileSync(path.join(WEB, "app.html"), out);
fs.writeFileSync(path.join(WEB, "map.html"), out);
fs.writeFileSync(path.join(WEB, "version.json"), JSON.stringify({ v: VER, at: new Date().toISOString() }) + NL);
console.log("build 300dpi preview (legacy=false, dual=true): " + (Buffer.byteLength(out)/1024).toFixed(1) + " KB, versi " + VER);
