import fs from "node:fs";

const pts = [
  {name:"latex-e", lat:5.687814, lon:102.082667, px:2091, py:3574, desc:"Latex Station E"},
  {name:"rubber-f1", lat:5.680182, lon:102.093841, px:3029, py:4221, desc:"Rubber Factory Comp 1"},
  {name:"kuil", lat:5.68916, lon:102.10571, px:4034, py:3470, desc:"Hindu Temple 1"},
  {name:"padang", lat:5.68792, lon:102.10445, px:3927, py:3574, desc:"Football Field 1 / Nursery 1"},
  {name:"pejabat", lat:5.68476, lon:102.10515, px:3985, py:3841, desc:"Office / Staff House Comp"},
];

let html = '<!doctype html><html><head><meta charset="utf-8"><title>Screenshot Peta 600 DPI</title>';
html += '<style>body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#1a1a1a;color:#eee}h1{font-size:18px}h2{font-size:14px;margin:24px 0 8px}img{max-width:100%;border:1px solid #555;display:block}.coord{font-size:12px;color:#9cf;margin-bottom:6px}.px{font-size:12px;color:#fa8;margin-bottom:8px}.note{font-size:11px;color:#999;margin-top:8px;max-width:800px}</style></head><body>';
html += '<h1>Tangkapan Skrin Peta 600 DPI (transform GDAL, silang merah = koordinat)</h1>';
html += '<div class="note">Kiri = peta 600 DPI dengan silang merah; kanan = crop PDF asal (tanpa silang). Silang = 1 pixel, ditanda ±18px untuk keterlihatan.</div>';

for(const p of pts){
  html += '<h2>' + p.desc + '</h2>';
  html += '<div class="coord">Koordinat: ' + p.lat + ', ' + p.lon + '</div>';
  html += '<div class="px">Pixel 600 DPI: (' + p.px + ', ' + p.py + ')</div>';
  html += '<img src="shots/' + p.name + '.png" alt="' + p.desc + '">';
}

html += '<div class="note" style="margin-top:24px">Transform: gt=[102.0576569392, 1.185980947698e-5, 6.053837467281e-8, 5.7301411583, 5.948616217760e-8, -1.187790611010e-5] (EPSG:4326, gsd 1.318 m/px).</div>';
html += '</body></html>';

fs.writeFileSync("web-600dpi/shots.html", html);
console.log("shots.html ditulis, " + html.length + " bytes");
