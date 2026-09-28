import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");
const NL = String.fromCharCode(10);
let changes = 0;

// ===== KEY STORAN .v2 (supaya data legacy tak muncul di lokasi salah) =====
// Tukar key "kerilla.pins/measure/geo" -> "kerilla.pins.v2" dsb
s = s.replace(/localStorage\.setItem\("kerilla\.pins"/g, 'localStorage.setItem("kerilla.pins.v2"');
s = s.replace(/localStorage\.setItem\("kerilla\.measure"/g, 'localStorage.setItem("kerilla.measure.v2"');
s = s.replace(/localStorage\.setItem\("kerilla\.geo"/g, 'localStorage.setItem("kerilla.geo.v2"');
s = s.replace(/localStorage\.getItem\("kerilla\.pins"/g, 'localStorage.getItem("kerilla.pins.v2"');
s = s.replace(/localStorage\.getItem\("kerilla\.measure"/g, 'localStorage.getItem("kerilla.measure.v2"');
s = s.replace(/localStorage\.getItem\("kerilla\.geo"/g, 'localStorage.getItem("kerilla.geo.v2"');
changes++;
console.log("1. key storan .v2 (pins/measure/geo)");

// ===== NOTIS SEKALI SAHAJA (georeferencing berubah) =====
// Tambah selepas backupIfTransformSwitched
const anchor = "const ll2pxT = (lon,lat,t) =>";
const notice = "/* Notis sekali sahaja: perubahan georeferencing (data legacy tak dimuat) */" + NL +
  "function geoChangeNotice(){" + NL +
  "  const K='kerilla.geochange.notice.v2';" + NL +
  "  if(localStorage.getItem(K)) return;" + NL +
  "  localStorage.setItem(K, '1');" + NL +
  "  const legacy=localStorage.getItem('kerilla.pins')||localStorage.getItem('kerilla.measure')||localStorage.getItem('kerilla.geo');" + NL +
  "  if(legacy){" + NL +
  "    toast('Georeferencing peta telah diperbetulkan. Data lama (Placemark/Measure/Geofence) di lokasi lama tidak dipaparkan. Guna menu Lagi > Backup storan untuk eksport data lama.', 7000);" + NL +
  "  } else {" + NL +
  "    toast('Peta kini guna georeferencing yang diperbetulkan (600 DPI).', 4000);" + NL +
  "  }" + NL +
  "}" + NL +
  "const ll2pxT = (lon,lat,t) =>";
if(s.includes(anchor)){
  s = s.replace(anchor, notice);
  changes++;
  console.log("2. notis geochange ditambah");
}

// Panggil geoChangeNotice dalam boot (selepas restoreAll)
const bootAnchor = "restoreAll();";
if(s.includes(bootAnchor)){
  s = s.replace(bootAnchor, "restoreAll(); geoChangeNotice();");
  changes++;
  console.log("3. geoChangeNotice dipanggil dalam boot");
} else {
  console.log("WARN: bootAnchor restoreAll tidak jumpa");
}

fs.writeFileSync("app-core.js", s);
console.log("");
console.log("Selesai patch storan .v2 + notis: " + changes + " perubahan");
