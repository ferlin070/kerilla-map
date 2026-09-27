import fs from 'node:fs';
const P = 'web-kerilla/skin.html';
let s = fs.readFileSync(P, 'utf8');
const NL = String.fromCharCode(10);
const log = [];
const sub = (find, repl, label) => {
  if (!s.includes(find)) { log.push('GAGAL: ' + label); return; }
  s = s.replace(find, repl); log.push('OK: ' + label);
};

// ── 1. BUTANG HEADER 36 -> 44px (tap-zone) ──
sub(
'.hbtn{width:36px;height:36px;flex:0 0 auto;border-radius:var(--r);border:0;',
'.hbtn{width:44px;height:44px;flex:0 0 auto;border-radius:var(--r);border:0;',
'butang header 36->44px');
sub('.hbtn svg{width:19px;height:19px}', '.hbtn svg{width:20px;height:20px}',
'ikon header 19->20px');

// ── 2. LEGEND TOGGLE — tinggi min 44px ──
sub(
'#lghd{padding:9px 12px;display:flex;align-items:center;gap:8px;cursor:pointer;',
'#lghd{padding:0 14px;min-height:44px;display:flex;align-items:center;gap:8px;cursor:pointer;',
'toggle legenda min-height 44px');
// perlu-tahu (touch-action) dan elak hilang tekan
sub(
'  border-bottom:1px solid var(--line);transition:border-color .2s}',
'  border-bottom:1px solid var(--line);transition:border-color .2s,background .15s;' + NL +
'  touch-action:manipulation}' + NL +
'#lghd:active{background:var(--sand)}',
'legenda active feedback');

// ── 3. GPS CHIP — max-width, tidak terpotong ──
sub(
'  box-shadow:var(--sh);pointer-events:none;' + NL +
'  opacity:0;transform:translateY(-6px);transition:opacity .25s,transform .25s;white-space:nowrap}',
'  box-shadow:var(--sh);pointer-events:none;' + NL +
'  max-width:calc(100vw - ' + 20 + 'px - var(--sal) - var(--sar));' + NL +
'  overflow:hidden;text-overflow:ellipsis;' + NL +
'  opacity:0;transform:translateY(-6px);transition:opacity .25s,transform .25s;white-space:nowrap}',
'chip max-width + ellipsis');
sub(
'#chip i{width:7px;height:7px;border-radius:50%;background:#7fe07f;',
'#chip i{flex:0 0 auto;width:7px;height:7px;border-radius:50%;background:#7fe07f;',
'chip dot flex-shrink 0');

// ── 4. FAB — tambah touch-action + tap-zone tersembunyi ──
sub(
'.fab{width:44px;height:44px;border-radius:var(--r-lg);border:1px solid var(--line);',
'.fab{width:48px;height:48px;border-radius:var(--r-lg);border:1px solid var(--line);' + NL +
'  touch-action:manipulation;position:relative;',
'fab 44->48px + touch-action');
// tap-zone tersembunyi 56px (lebih besar dari visual 48px)
sub(
'.fab:active{transform:scale(.88);box-shadow:0 1px 4px rgba(18,49,40,.2)}.fab svg{width:20px;height:20px}',
'.fab::after{content:"";position:absolute;inset:-4px;border-radius:inherit}' + NL +
'.fab:active{transform:scale(.88);box-shadow:0 1px 4px rgba(18,49,40,.2)}' + NL +
'.fab svg{width:21px;height:21px;pointer-events:none}',
'fab tap-zone tersembunyi 56px');

// ── 5. KOMPAS 44 -> 48px ──
sub(
'#cmp{width:44px;height:44px;border-radius:50%;border:1px solid var(--line);',
'#cmp{width:48px;height:48px;border-radius:50%;border:1px solid var(--line);' + NL +
'  touch-action:manipulation;position:relative;',
'kompas 44->48px');
sub(
'#cmp:active{transform:scale(.88)}',
'#cmp::after{content:"";position:absolute;inset:-4px;border-radius:inherit}' + NL +
'#cmp:active{transform:scale(.88)}',
'kompas tap-zone');

// ── 6. FAB STACK — gap 10 -> 12px ──
sub('#fab{position:fixed;right:calc(12px + var(--sar));',
    '#fab{position:fixed;right:calc(12px + var(--sar));', 'fab anchor (semak)');
sub('  display:flex;flex-direction:column;gap:10px}',
    '  display:flex;flex-direction:column;gap:12px}', 'gap fab 10->12px');

// ── 7. BOTTOM NAV — pastikan min 44px tinggi tappable ──
sub(
'.nv{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;',
'.nv{flex:1;min-height:52px;display:flex;flex-direction:column;align-items:center;justify-content:center;' + NL +
'  touch-action:manipulation;',
'nav min-height 52px + touch-action');

// ── 8. FEEDBACK TEKAN — opacity + scale ──
sub(
'.nv:active svg{transform:scale(.86)}',
'.nv:active{background:rgba(31,77,63,.07)}' + NL +
'.nv:active svg{transform:scale(.86)}' + NL +
'.nv:active span{opacity:.85}',
'nav active feedback');
sub(
'.hbtn:active{background:rgba(255,255,255,.22);transform:scale(.93)}',
'.hbtn:active{background:rgba(255,255,255,.24);transform:scale(.94);opacity:.85}',
'header active opacity');

fs.writeFileSync(P, s);
console.log(log.join(NL));
