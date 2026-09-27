import fs from 'node:fs';
let s = fs.readFileSync('src/tile-pyramid.mjs','utf8');
const NL = String.fromCharCode(10);

const old = [
'        for (let py = 0; py < TILE; py++) {',
'          for (let px = 0; px < TILE; px++) {',
'            // piksel dalam koordinat level',
'            const lx = tx * TILE + px;',
'            const ly = ty * TILE + py;',
'            if (lx >= levelW || ly >= levelH) continue;',
'            // map ke piksel sumber',
'            const sx = Math.min(width - 1, Math.floor(lx * scale));',
'            const sy = Math.min(height - 1, Math.floor(ly * scale));',
'            const si = (sy * width + sx) * 4;',
'            const di = (py * TILE + px) * 4;',
'            out.data[di] = src.data[si];',
'            out.data[di + 1] = src.data[si + 1];',
'            out.data[di + 2] = src.data[si + 2];',
'            out.data[di + 3] = 255;',
'          }',
].join(NL);

const nw = [
'        for (let py = 0; py < TILE; py++) {',
'          for (let px = 0; px < TILE; px++) {',
'            // piksel dalam koordinat level',
'            const lx = tx * TILE + px;',
'            const ly = ty * TILE + py;',
'            if (lx >= levelW || ly >= levelH) continue;',
'            // map ke piksel sumber — BILINEAR interpolation (bukan nearest),',
'            // supaya garisan nipis kekal halus pada level rendah.',
'            const fx = lx * scale, fy = ly * scale;',
'            const x0 = Math.floor(fx), y0 = Math.floor(fy);',
'            const x1 = Math.min(width - 1, x0 + 1), y1 = Math.min(height - 1, y0 + 1);',
'            const wx = fx - x0, wy = fy - y0;',
'            const i00 = (y0 * width + x0) * 4, i10 = (y0 * width + x1) * 4;',
'            const i01 = (y1 * width + x0) * 4, i11 = (y1 * width + x1) * 4;',
'            const di = (py * TILE + px) * 4;',
'            for (let c = 0; c < 3; c++) {',
'              const v = (src.data[i00 + c] * (1 - wx) + src.data[i10 + c] * wx) * (1 - wy) +',
'                        (src.data[i01 + c] * (1 - wx) + src.data[i11 + c] * wx) * wy;',
'              out.data[di + c] = Math.round(v);',
'            }',
'            out.data[di + 3] = 255;',
'          }',
].join(NL);

if(!s.includes(old)){ console.log('GAGAL: loop tidak jumpa'); }
else { s=s.replace(old,nw); fs.writeFileSync('src/tile-pyramid.mjs',s); console.log('OK: bilinear interpolation'); }
