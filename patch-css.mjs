import fs from 'node:fs';
const P = 'web-kerilla/index.html';
let s = fs.readFileSync(P, 'utf8');
const before = s;

// 1. BUTANG KANAN LEBIH BESAR
s = s.replace('width:48px;height:48px;border-radius:14px;border:1px solid var(--line);',
              'width:62px;height:62px;border-radius:19px;border:1px solid var(--line);');
s = s.replace('background:var(--panel);backdrop-filter:blur(12px);color:var(--ink);font-size:21px;',
              'background:var(--panel);backdrop-filter:blur(12px);color:var(--ink);font-size:29px;');
s = s.replace('z-index:25;display:flex;flex-direction:column;gap:9px}',
              'z-index:25;display:flex;flex-direction:column;gap:12px}');
s = s.replace('bottom:calc(150px + var(--sab));\n    z-index:25;display:flex;flex-direction:column',
              'bottom:calc(200px + var(--sab));\n    z-index:25;display:flex;flex-direction:column');

// 2. KOMPAS LEBIH BESAR
s = s.replace('#compass{width:48px;height:48px;', '#compass{width:62px;height:62px;');
s = s.replace('#compass .needle{color:var(--red);font-size:15px;line-height:1}',
              '#compass .needle{color:var(--red);font-size:20px;line-height:1}');

// 3. ALAT DOCK LEBIH BESAR
s = s.replace('padding:9px 13px;font-size:11px;font-weight:600;', 'padding:13px 16px;font-size:13px;font-weight:700;');
s = s.replace('gap:4px;min-width:62px;', 'gap:6px;min-width:84px;');
s = s.replace('.tool .ico{font-size:18px;line-height:1}', '.tool .ico{font-size:26px;line-height:1}');
s = s.replace('border-radius:14px;\n    padding:13px 16px', 'border-radius:17px;\n    padding:13px 16px');

// 4. PANEL STATUS NAIK
s = s.replace('bottom:calc(150px + var(--sab));z-index:25;width:min(232px, 62vw);',
              'bottom:calc(200px + var(--sab));z-index:25;width:min(250px, 66vw);');
s = s.replace('#panel.min #pbody{display:none}', '#panel.min #pbody{display:none}');

// 5. STATE: recording
s = s.replace('pins: [], measure: [], geofences: [], track: null, trackPts: [],',
              'pins: [], measure: [], geofences: [], trackPts: [], recording: false,');

// 6. Label alat
s = s.replace('<div class="tool" data-t="track"><span class="ico">⏺</span>Track</div>',
              '<div class="tool" data-t="track"><span class="ico">⏺</span>Rakam</div>');

fs.writeFileSync('/tmp/p1.mjs', 'ready');
console.log('perubahan CSS:', before !== s);
fs.writeFileSync(P, s);
console.log('fasa 1 selesai');