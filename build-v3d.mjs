import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const WEB = 'web-kerilla';

// ---------- ikon untuk markup HTML ----------
const P = {
  menu:"M4 6h16M4 12h16M4 18h16",
  share:"M12 3v12m0 0l-4-4m4 4l4-4M5 21h14",
  pin:"M12 21s7-6.5 7-11a7 7 0 10-14 0c0 4.5 7 11 7 11z",
  measure:"M4 15l6-6 3 3 7-7M20 5v5h-5",
  plus:"M12 5v14M5 12h14",
  minus:"M5 12h14",
  layers:"M12 3 3 8l9 5 9-5M3 13l9 5 9-5M3 17.5 12 22l9-4.5",
  close:"M6 6l12 12M18 6L6 18",
  chev:"m9 6 6 6-6 6",
};
const Q = String.fromCharCode(34);
const sv = (inner, w) => '<svg viewBox=' + Q + '0 0 24 24' + Q + ' fill=' + Q + 'none' + Q +
  ' stroke=' + Q + 'currentColor' + Q + ' stroke-width=' + Q + (w || 2) + Q +
  ' stroke-linecap=' + Q + 'round' + Q + ' stroke-linejoin=' + Q + 'round' + Q + '>' + inner + '</svg>';
const path1 = n => '<path d=' + Q + P[n] + Q + '/>';
const G = '<circle cx=' + Q + '12' + Q + ' cy=' + Q + '12' + Q + ' r=' + Q + '8' + Q + '/>' +
  '<path d=' + Q + 'M12 4v2m0 12v2m8-8h-2M6 12H4' + Q + '/>' +
  '<circle cx=' + Q + '12' + Q + ' cy=' + Q + '12' + Q + ' r=' + Q + '2.4' + Q + ' fill=' + Q + 'currentColor' + Q +
  ' stroke=' + Q + 'none' + Q + '/>';
const RC = '<rect x=' + Q + '4' + Q + ' y=' + Q + '7' + Q + ' width=' + Q + '16' + Q + ' height=' + Q + '12' +
  Q + ' rx=' + Q + '2' + Q + '/><circle cx=' + Q + '12' + Q + ' cy=' + Q + '13' + Q + ' r=' + Q + '3.2' + Q + '/>' +
  '<path d=' + Q + 'M9 7l1.5-2h3L15 7' + Q + '/>';
const MORESVG = '<svg viewBox=' + Q + '0 0 24 24' + Q + ' fill=' + Q + 'currentColor' + Q + '>' +
  '<circle cx=' + Q + '5' + Q + ' cy=' + Q + '12' + Q + ' r=' + Q + '1.5' + Q + '/>' +
  '<circle cx=' + Q + '12' + Q + ' cy=' + Q + '12' + Q + ' r=' + Q + '1.5' + Q + '/>' +
  '<circle cx=' + Q + '19' + Q + ' cy=' + Q + '12' + Q + ' r=' + Q + '1.5' + Q + '/></svg>';

const skin = fs.readFileSync(path.join(WEB, 'skin.html'), 'utf8');
const core = fs.readFileSync('app-core.js', 'utf8');

// Versi = hash kandungan (auto cache-bust setiap perubahan)
const VER = crypto.createHash('sha1').update(skin + core).digest('hex').slice(0, 8);

let out = skin
  .replaceAll('[[MENU]]', sv(path1('menu')))
  .replaceAll('[[SHARE]]', sv(path1('share')))
  .replaceAll('[[GPS]]', sv(G, '1.9'))
  .replaceAll('[[PLUS]]', sv(path1('plus')))
  .replaceAll('[[MINUS]]', sv(path1('minus')))
  .replaceAll('[[PIN]]', sv(path1('pin') + '<circle cx=' + Q + '12' + Q + ' cy=' + Q + '10' + Q + ' r=' + Q + '2.4' + Q + '/>', '1.9'))
  .replaceAll('[[MEASURE]]', sv(path1('measure')))
  .replaceAll('[[REC]]', sv(RC, '1.9'))
  .replaceAll('[[MORE]]', MORESVG)
  .replaceAll('[[CLOSE]]', sv(path1('close')))
  .replaceAll('[[CHEV]]', sv(path1('chev'), '2.2'))
  .replaceAll('[[LAYERS]]', sv(path1('layers'), '1.7'))
  .replaceAll('[[VER]]', VER)
  .replaceAll('[[CORE]]', core);

fs.writeFileSync(path.join(WEB, 'index.html'), out);
fs.writeFileSync(path.join(WEB, 'app.html'), out);
fs.writeFileSync(path.join(WEB, 'map.html'), out);

// version.json untuk checkVersion()
fs.writeFileSync(path.join(WEB, 'version.json'), JSON.stringify({ v: VER, at: new Date().toISOString() }) + String.fromCharCode(10));

console.log('dibina:', (Buffer.byteLength(out)/1024).toFixed(1), 'KB   versi:', VER);
console.log('placeholder tertinggal:', (out.match(/\[\[/g) || []).length);
