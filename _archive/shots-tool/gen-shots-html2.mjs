import fs from "node:fs";

let html = fs.readFileSync("web-600dpi/shots.html","utf8");
// tambah bahagian task labels sebelum penutup
const anchor = '<div class="note" style="margin-top:24px">Transform:';
const taskSection = '<h2 style="margin-top:28px">Label Nombor Task (zoom tinggi, resolusi penuh 600 DPI)</h2>' +
'<div class="note">Crop 300x300px sekitar 6 label task kecil tersebar. Nombor task 1-39 sepatutnya lebih jelas (2x resolusi berbanding live z4). Silang = pusat label (dari labels.json, peta lama x2.059).</div>' +
'<div class="grid">' +
[0,1,2,3,4,5].map(i=>'<div class="card"><img src="shots/task-labels/label-'+i+'.png" style="width:300px"></div>').join('') +
'</div>' + anchor;

html = html.replace(anchor, taskSection);
fs.writeFileSync("web-600dpi/shots.html", html);
console.log("shots.html dikemaskini dengan task labels");
