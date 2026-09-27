import fs from 'node:fs';
const P = 'web-kerilla/skin.html';
let s = fs.readFileSync(P, 'utf8');
const NL = String.fromCharCode(10);
const log = [];
const sub = (find, repl, label) => {
  if (!s.includes(find)) { log.push('GAGAL: ' + label); return; }
  s = s.replace(find, repl); log.push('OK: ' + label);
};

// tap-zone tersembunyi untuk FAB (inset -4px = 56px tappable)
sub(
'.fab:active{transform:scale(.88);box-shadow:0 1px 4px rgba(18,49,40,.2)}',
'.fab::after{content:"";position:absolute;inset:-4px;border-radius:inherit}' + NL +
'.fab:active{transform:scale(.88);opacity:.85;box-shadow:0 1px 4px rgba(18,49,40,.2)}',
'fab tap-zone 56px + opacity');

// opacity pada kompas juga
sub('#cmp:active{transform:scale(.88)}', '#cmp:active{transform:scale(.88);opacity:.85}', 'kompas opacity');

// ── SCALE BAR BARU: tunjuk skala sebenar ikut zoom ──
sub(
'#lgbd{padding:9px 12px 10px;',
[ '/* ===== SCALE BAR sebenar (auto-update ikut zoom) ===== */',
  '#sbar{position:fixed;left:calc(12px + var(--sal));',
  '  bottom:calc(var(--nav) + var(--sab) + 14px);z-index:36;',
  '  background:rgba(251,250,246,.94);backdrop-filter:blur(10px);',
  '  border:1px solid var(--line);border-radius:10px;',
  '  padding:7px 11px 8px;box-shadow:var(--sh);',
  '  display:flex;flex-direction:column;gap:4px;min-width:92px;',
  '  pointer-events:none;user-select:none}',
  '#sbar .sbl{display:flex;align-items:flex-end;gap:0;height:9px}',
  '#sbar .sbl i{flex:1;height:6px;border-left:2.5px solid var(--ink);',
  '  border-bottom:2.5px solid var(--ink);border-right:2.5px solid var(--ink);',
  '  border-radius:1px;box-sizing:border-box}',
  '#sbar .sbt{font-size:10.5px;font-weight:700;color:var(--ink);',
  '  letter-spacing:.2px;font-variant-numeric:tabular-nums;',
  '  text-shadow:0 0 3px rgba(251,250,246,.9)}',
  '#sbar .sbs{font-size:9px;font-weight:600;color:var(--mute);',
  '  letter-spacing:.2px;font-variant-numeric:tabular-nums}',
  '#lgbd{padding:9px 12px 10px;',
].join(NL),
'scale bar CSS');

// ── Markup scale bar (letak sebelum #fab) ──
sub(
'<div id="fab">',
[ '<div id="sbar">',
  '  <div class="sbl"><i id="sb-line"></i></div>',
  '  <span class="sbt" id="sb-txt">— m</span>',
  '  <span class="sbs" id="sb-scale">— m/px</span>',
  '</div>',
  '',
  '<div id="fab">',
].join(NL),
'markup scale bar');

fs.writeFileSync(P, s);
console.log(log.join(NL));
