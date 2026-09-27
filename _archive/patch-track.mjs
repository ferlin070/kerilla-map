import fs from 'node:fs';
const P = 'web-kerilla/index.html';
let s = fs.readFileSync(P, 'utf8');

const start = s.indexOf("    if (t === 'track') {");
const endM = '      return;\n    }';
const end = s.indexOf(endM, start);
if (start < 0 || end < 0) throw new Error('blok track tidak dijumpai');
const oldBlock = s.slice(start, end + endM.length);
console.log('blok track lama:', oldBlock.split('\n').length, 'baris');

const NB = [
  "    if (t === 'track') {",
  "      if (state.recording) stopRecording(); else startRecording();",
  '      return;',
  '    }',
].join('\n');
s = s.replace(oldBlock, NB);

const TREQ = String.fromCharCode(34) + 'tool[data-t=' + String.fromCharCode(92,39) + 'track' + String.fromCharCode(92,39) + ']' + String.fromCharCode(34);
const ICON_STOP = '<span class=' + String.fromCharCode(34) + 'ico' + String.fromCharCode(34) + '>\u23F9</span>Henti';
const ICON_REC  = '<span class=' + String.fromCharCode(34) + 'ico' + String.fromCharCode(34) + '>\u23FA</span>Rakam';

const FNS = [
  'function startRecording() {',
  "  if (!state.gps) { toast('Tekan \u25CE Cari Lokasi dahulu', 3400, 'err'); return; }",
  '  state.recording = true;',
  '  state.trackPts = [{ lon: state.gps.lon, lat: state.gps.lat, t: Date.now(), acc: state.acc }];',
  '  state.follow = true; updateFollowBtn(); updateTrackBtn();',
  "  document.querySelector('#s-dist').textContent = '0.0 m';",
  "  toast('\u23FA Merakam laluan anda \u2014 mula berjalan', 3400, 'ok');",
  '}',
  'function stopRecording() {',
  '  state.recording = false;',
  '  updateTrackBtn();',
  '  const n = state.trackPts.length, d = trackDistance();',
  "  if (n < 2) { toast('\u23F9 Berhenti \u2014 terlalu sedikit titik', 3600, 'err'); return; }",
  "  toast('\u23F9 Berhenti: ' + n + ' titik \u00B7 ' + fmtD(d) + speedSuffix(), 6000, 'ok');",
  '}',
  'function trackDistance() {',
  '  let d = 0;',
  '  for (let i = 1; i < state.trackPts.length; i++)',
  '    d += haversine(state.trackPts[i-1].lon, state.trackPts[i-1].lat,',
  '                   state.trackPts[i].lon, state.trackPts[i].lat);',
  '  return d;',
  '}',
  'function speedSuffix() {',
  '  if (state.trackPts.length < 2) return "";',
  '  const sec = (state.trackPts[state.trackPts.length-1].t - state.trackPts[0].t) / 1000;',
  '  if (sec < 3) return "";',
  '  return " \u00B7 " + ((trackDistance()/sec)*3.6).toFixed(1) + " km/j";',
  '}',
  'function updateTrackBtn() {',
  '  const el = document.querySelector(' + JSON.stringify(TREQ) + ');',
  '  if (!el) return;',
  '  el.classList.toggle("on", !!state.recording);',
  '  el.innerHTML = state.recording ? ' + JSON.stringify(ICON_STOP) + ' : ' + JSON.stringify(ICON_REC) + ';',
  '}',
  'function updateTools() {',
].join('\n');
const fm = 'function updateTools() {';
if (!s.includes(fm)) throw new Error('updateTools tidak dijumpai');
s = s.replace(fm, FNS);

// applyFix: rakam titik GPS sebenar
const fxOld = '  if (center) {\n    state.follow = true; updateFollowBtn();';
const fxA = [
  '  // Rakam titik GPS SEBENAR semasa merakam',
  '  if (state.recording) {',
  '    const last = state.trackPts[state.trackPts.length-1];',
  '    const moved = !last || haversine(last.lon, last.lat, c.longitude, c.latitude) >= 2;',
  '    if (moved) {',
  '      state.trackPts.push({ lon: c.longitude, lat: c.latitude, t: Date.now(), acc: c.accuracy });',
  '      const dd = trackDistance();',
  "      document.querySelector('#s-dist').textContent = fmtD(dd);",
  "      document.querySelector('#sub').textContent = '\u23FA ' + state.trackPts.length + ' titik \u00B7 ' + fmtD(dd);",
  '    }',
  '  }',
  '  if (center) {',
  '    state.follow = true; updateFollowBtn();',
].join('\n');
if (!s.includes(fxOld)) throw new Error('applyFix marker tidak dijumpai');
s = s.replace(fxOld, fxA);

s = s.replace('state.geofences = []; state.trackPts = [];',
  'state.geofences = []; state.trackPts = []; state.recording = false; updateTrackBtn();');
s = s.replace('      if (state.track) {', '      if (false) {');

fs.writeFileSync(P, s);
fs.writeFileSync('web-kerilla/app.html', s);
fs.writeFileSync('web-kerilla/map.html', s);
console.log('OK: track ditukar kepada rakaman GPS sebenar');