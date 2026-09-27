/**
 * extract-pdf-images.mjs — Ekstrak imej terbenam dari PDF GeoPDF.
 *
 * GeoPDF dari QGIS biasanya mengandungi:
 *   - Lapisan peta sebagai imej besar (DCTDecode = JPEG, atau FlateDecode = PNG-like)
 *   - Objek /Image dalam struktur PDF
 *
 * Untuk POC ini kita ekstrak imej terbesar (peta utama) tanpa perlu PDF
 * renderer penuh (yang tiada dalam sandbox ini).
 *
 * PRODUKSI: guna PDFium/Poppler untuk render PENUH halaman (termasuk vektor,
 * label, legenda). Ekstrak imej sahaja = lapisan raster sahaja.
 */
import fs from 'node:fs';
import zlib from 'node:zlib';

const pdfPath = process.argv[2] || 'data/user/kerilla.pdf';
const outDir = process.argv[3] || 'data/user/extracted';
fs.mkdirSync(outDir, { recursive: true });

const buf = fs.readFileSync(pdfPath);
const txt = buf.toString('latin1');

console.log('Memindai objek /Image dalam PDF...');
const found = [];

// Cari semua "N 0 obj ... /Subtype /Image ... stream ... endstream"
const objRe = /(\d+)\s+0\s+obj([\s\S]*?)stream\r?\n/g;
let m;
while ((m = objRe.exec(txt)) !== null) {
  const dict = m[2];
  if (!/\/Subtype\s*\/Image/.test(dict)) continue;
  const w = +( /\/Width\s+(\d+)/.exec(dict)?.[1] || 0);
  const h = +( /\/Height\s+(\d+)/.exec(dict)?.[1] || 0);
  const filter = /\/Filter\s*\/(\w+)/.exec(dict)?.[1] || '';
  const bpc = +( /\/BitsPerComponent\s+(\d+)/.exec(dict)?.[1] || 8);
  const cs = /\/ColorSpace\s*\/([\w]+)/.exec(dict)?.[1] ||
             (/\/ColorSpace\s*\[\s*\/(\w+)/.exec(dict)?.[1]) || '';
  const streamStart = m.index + m[0].length;

  found.push({ objNum: m[1], width: w, height: h, filter, bpc, colorSpace: cs,
               streamStart, dictLen: dict.length });
}

console.log('Dijumpai ' + found.length + ' objek /Image:');
console.log('');
console.log('  #  obj   saiz        penapis        bpc  warna     saiz data');
console.log('  ' + '-'.repeat(68));

for (let i = 0; i < found.length; i++) {
  const f = found[i];
  // Cari 'endstream' seterusnya
  const endIdx = buf.indexOf('endstream', f.streamStart, 'latin1');
  f.dataStart = f.streamStart;
  f.dataEnd = endIdx;
  f.dataLen = endIdx - f.streamStart;
  console.log('  ' + String(i).padEnd(3) +
    String(f.objNum).padEnd(6) +
    (f.width + 'x' + f.height).padEnd(12) +
    f.filter.padEnd(15) +
    String(f.bpc).padEnd(5) +
    f.colorSpace.padEnd(10) +
    (f.dataLen / 1024).toFixed(0) + ' KB');
}

// Ekstrak setiap imej
console.log('');
console.log('Mengekstrak...');
for (let i = 0; i < found.length; i++) {
  const f = found[i];
  const raw = buf.subarray(f.dataStart, f.dataEnd);
  let out, ext;
  try {
    if (f.filter === 'DCTDecode') {
      out = raw; ext = 'jpg';
    } else if (f.filter === 'FlateDecode') {
      const inf = zlib.inflateSync(raw);
      // Cuba bina PNG mentah
      out = inf; ext = 'raw';
    } else {
      out = raw; ext = 'bin';
    }
    const name = outDir + '/img' + i + '_' + f.width + 'x' + f.height + '.' + ext;
    fs.writeFileSync(name, out);
    console.log('  img' + i + ' -> ' + name + ' (' + (out.length / 1024).toFixed(0) + ' KB)');
  } catch (e) {
    console.log('  img' + i + ' GAGAL: ' + e.message);
  }
}
