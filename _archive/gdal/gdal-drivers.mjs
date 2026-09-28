import gdal from "gdal-async";
// senarai driver yang tersedia
const drivers = gdal.drivers;
const names = [];
for(let i=0;i<drivers.count();i++){
  const d = drivers.get(i);
  names.push(d.description);
}
console.log("Jumlah driver:", names.length);
console.log("");
console.log("Driver berkaitan PDF/geospatial:");
const relevant = names.filter(n => /PDF|GTiff|GeoTIFF|JPEG|PNG|VRT|MEM/i.test(n));
console.log(relevant.join(", "));
console.log("");
console.log("Semua driver (dipangkas):");
console.log(names.join(", ").substring(0, 2000));
