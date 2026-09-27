import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('web-kerilla/index.html', 'utf8');
const meta = JSON.parse(fs.readFileSync('web-kerilla/map-meta.json', 'utf8'));
const errors = [];

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://kerilla.nakhodacloud.top/',
  beforeParse(window) {
    window.fetch = async () => ({ json: async () => meta });
    window.navigator.geolocation = {
      getCurrentPosition(succ) {
        succ({ coords: { latitude: 5.679337, longitude: 102.093383, accuracy: 6, heading: 45 } });
      },
      watchPosition(succ) {
        succ({ coords: { latitude: 5.679337, longitude: 102.093383, accuracy: 6, heading: 45 } });
        return 1;
      },
      clearWatch() {},
    };
    window.addEventListener('error', e => errors.push(e.message));
  },
});

const { window } = dom;
await new Promise(r => setTimeout(r, 700));
const doc = window.document;
const $ = s => doc.querySelector(s);
const click = el => el && el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

console.log('=== UJIAN SETIAP BUTANG (jsdom) ===');
console.log('');

click($('#btn-go-map'));
await new Promise(r => setTimeout(r, 400));
console.log('Onboarding dibuang:', $('#intro') ? 'TIDAK' : 'YA');
console.log('');

let pass = 0, fail = 0;
const check = (name, cond, note = '') => {
  console.log('   ' + name.padEnd(15) + (cond ? 'OK BERFUNGSI' : 'GAGAL') + (note ? '   ' + note : ''));
  cond ? pass++ : fail++;
};

console.log('--- BUTANG KANAN ---');
let s0 = window.state.scale;
click($('#btn-zin'));
await new Promise(r => setTimeout(r, 80));
check('btn-zin', window.state.scale > s0, 'scale ' + s0.toFixed(2) + ' ke ' + window.state.scale.toFixed(2));
s0 = window.state.scale;
click($('#btn-zout'));
await new Promise(r => setTimeout(r, 80));
check('btn-zout', window.state.scale < s0, 'scale ke ' + window.state.scale.toFixed(2));
click($('#btn-follow'));
await new Promise(r => setTimeout(r, 80));
check('btn-follow', typeof window.state.follow === 'boolean', 'follow=' + window.state.follow);
click($('#btn-locate'));
await new Promise(r => setTimeout(r, 200));
check('btn-locate', !!window.state.gps, window.state.gps ? 'gps=' + window.state.gps.lat.toFixed(4) : 'tiada gps');

console.log('');
console.log('--- ALAT DOCK ---');
const tools = ['pin', 'measure', 'geofence', 'undo', 'reset', 'fit', 'track', 'locate'];
for (const t of tools) {
  const el = doc.querySelector('.tool[data-t="' + t + '"]');
  if (!el) { check(t, false, 'tiada di DOM'); continue; }
  click(el);
  await new Promise(r => setTimeout(r, 100));
  const st = window.state;
  let ok = true, note = '';
  if (t === 'pin' || t === 'measure' || t === 'geofence') { ok = st.tool === t; note = 'tool=' + st.tool; }
  if (t === 'track') { ok = typeof st.recording === 'boolean'; note = 'recording=' + st.recording; }
  if (t === 'undo') { ok = Array.isArray(st.pins); note = 'pins=' + st.pins.length; }
  if (t === 'reset') { ok = st.pins.length === 0; note = 'pins=' + st.pins.length; }
  if (t === 'fit') { note = 'scale=' + st.scale.toFixed(3); }
  if (t === 'locate') { ok = !!st.gps; note = 'gps=' + (st.gps ? 'ada' : 'tiada'); }
  check(t, ok, note);
}

console.log('');
console.log('--- RAKAMAN TRACK ---');
click($('#btn-locate'));
await new Promise(r => setTimeout(r, 150));
const trackEl = doc.querySelector('.tool[data-t="track"]');
click(trackEl);
await new Promise(r => setTimeout(r, 150));
check('track mula', window.state.recording === true, 'recording=' + window.state.recording);
console.log('        label butang: ' + trackEl.textContent.trim());
check('label Henti', trackEl.textContent.includes('Henti'), trackEl.textContent.trim());
click(trackEl);
await new Promise(r => setTimeout(r, 150));
check('track henti', window.state.recording === false, 'recording=' + window.state.recording);

console.log('');
console.log('--- RALAT JS ---');
check('tiada ralat', errors.length === 0, errors.length ? errors.slice(0,5).join(' | ') : '');
console.log('');
console.log('KEPUTUSAN: ' + pass + ' lulus, ' + fail + ' gagal');
