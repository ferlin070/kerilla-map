import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");
const NL = String.fromCharCode(10);

// ===== NOTIS SEKALI SAHAJA (geoChangeNotice) =====
const anchor = "const ll2pxT = (lon,lat,t) =>";
const notice = "/* Notis sekali sahaja: perubahan georeferencing */" + NL +
  "function geoChangeNotice(){" + NL +
  "  const K='kerilla.geochange.notice.v2';" + NL +
  "  if(localStorage.getItem(K)) return;" + NL +
  "  localStorage.setItem(K, '1');" + NL +
  "  const legacy=localStorage.getItem('kerilla.pins')||localStorage.getItem('kerilla.measure')||localStorage.getItem('kerilla.geo');" + NL +
  "  if(legacy){" + NL +
  "    toast('Georeferencing peta telah diperbetulkan. Data lama (Placemark/Measure/Geofence) tidak dipaparkan di lokasi lama. Guna menu Lagi > Backup storan untuk eksport data lama.', 7000);" + NL +
  "  } else {" + NL +
  "    toast('Peta kini guna georeferencing yang diperbetulkan (600 DPI).', 4000);" + NL +
  "  }" + NL +
  "}" + NL +
  "const ll2pxT = (lon,lat,t) =>";
if(s.includes(anchor)){
  s = s.replace(anchor, notice);
  console.log("1. geoChangeNotice ditambah");
}

// Panggil dalam boot selepas restoreAll
const ba = "restoreAll();";
if(s.includes(ba)){
  s = s.replace(ba, "restoreAll(); geoChangeNotice();");
  console.log("2. geoChangeNotice dipanggil");
}

fs.writeFileSync("app-core.js", s);
