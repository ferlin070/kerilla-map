import fs from "node:fs";

let html = fs.readFileSync("web-600dpi/shots.html","utf8");
const anchor = '<div class="note" style="margin-top:24px">Transform:';
const section = '<h2 style="margin-top:28px">Label Blok Task (mungkin "2 PM2002A / 2 PM2001B")</h2>' +
'<div class="note">12 crop 400x400px pada label blok besar (saiz >=70px lebar / >=30px tinggi). Silang merah = pusat label. Untuk sahkan nombor task 1-39, zoom pada kawasan ini.</div>' +
'<div class="note">Overview penuh dengan kotak merah = semua 33 label blok besar:</div>' +
'<img src="shots/overview-blocks.png" style="max-width:100%">' +
'<div class="grid">' +
Array.from({length:12},(_,i)=>'<div class="card"><img src="shots/block-labels/block-'+i+'.png" style="width:400px"></div>').join('') +
'</div>' + anchor;

html = html.replace(anchor, section);
fs.writeFileSync("web-600dpi/shots.html", html);
console.log("shots.html dikemaskini dengan block labels");
