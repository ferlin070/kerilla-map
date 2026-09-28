import gdal from "gdal-async";
import fs from "node:fs";
import { PNG } from "pngjs";

// Tile pyramid dari GeoTIFF 600dpi
const TILE = 256;
const ds = gdal.open("kerilla-600dpi.tif");
const W = ds.rasterSize.x, H = ds.rasterSize.y;
const gt = ds.geoTransform;

// Baca semua band data ke buffer RGBA
const band1 = ds.bands.get(1);
const band2 = ds.bands.get(2);
const band3 = ds.bands.get(3);
const data1 = band1.pixels.read(0, 0, W, H);
const data2 = band2.pixels.read(0, 0, W, H);
const data3 = band3.pixels.read(0, 0, W, H);

console.log("Sumber: " + W + "x" + H + " (3 band)");

function sample(x, y, c){
  // bilinear
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const x1 = Math.min(W-1, x0+1), y1 = Math.min(H-1, y0+1);
  const wx = x-x0, wy = y-y0;
  if(c===0){
    return (data1[y0*W+x0]*(1-wx)+data1[y0*W+x1]*wx)*(1-wy)+(data1[y1*W+x0]*(1-wx)+data1[y1*W+x1]*wx)*wy;
  } else if(c===1){
    return (data2[y0*W+x0]*(1-wx)+data2[y0*W+x1]*wx)*(1-wy)+(data2[y1*W+x0]*(1-wx)+data2[y1*W+x1]*wx)*wy;
  } else {
    return (data3[y0*W+x0]*(1-wx)+data3[y0*W+x1]*wx)*(1-wy)+(data3[y1*W+x0]*(1-wx)+data3[y1*W+x1]*wx)*wy;
  }
}

const zMax = Math.ceil(Math.log2(Math.max(W,H)/TILE));
const OUT = "web-600dpi/tiles";
fs.rmSync(OUT, { recursive: true, force: true });

let total=0, totalBytes=0;
for(let z=zMax; z>=0; z--){
  const scale = Math.pow(2, zMax-z);
  const levelW = Math.ceil(W/scale);
  const levelH = Math.ceil(H/scale);
  const tilesX = Math.ceil(levelW/TILE);
  const tilesY = Math.ceil(levelH/TILE);
  const zDir = OUT + "/" + z;
  fs.mkdirSync(zDir, { recursive: true });
  for(let tx=0; tx<tilesX; tx++){
    for(let ty=0; ty<tilesY; ty++){
      const png = new PNG({width:TILE, height:TILE});
      // transparent background
      for(let i=0;i<TILE*TILE;i++){ png.data[i*4]=255; png.data[i*4+1]=255; png.data[i*4+2]=255; png.data[i*4+3]=0; }
      for(let py=0; py<TILE; py++){
        for(let px=0; px<TILE; px++){
          const lx = tx*TILE+px, ly = ty*TILE+py;
          if(lx >= levelW || ly >= levelH) continue;
          const fx = lx*scale, fy = ly*scale;
          const di = (py*TILE+px)*4;
          png.data[di] = Math.round(sample(fx, fy, 0));
          png.data[di+1] = Math.round(sample(fx, fy, 1));
          png.data[di+2] = Math.round(sample(fx, fy, 2));
          png.data[di+3] = 255;
        }
      }
      const buf = PNG.sync.write(png, {colorType:6, deflateLevel:6});
      fs.writeFileSync(zDir+"/"+tx+"_"+ty+".png", buf);
      totalBytes += buf.length; total++;
    }
  }
  console.log("  z"+z+": "+(tilesX*tilesY)+" tile ("+tilesX+"x"+tilesY+")");
}
console.log("SELESAI: "+total+" tile, "+(totalBytes/1048576).toFixed(1)+" MB");
