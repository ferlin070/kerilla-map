import fs from "node:fs";
let s = fs.readFileSync("app-core.js", "utf8");

// Kira brace seimbang
let depth=0, minDepth=0, maxDepth=0;
let line=1, col=0;
let lastOpenLine=0;
for(let i=0;i<s.length;i++){
  const c=s[i];
  if(c==="\n"){line++;col=0;}
  else col++;
  if(c==="{"){depth++; if(depth>maxDepth){maxDepth=depth;lastOpenLine=line;}}
  else if(c==="}"){depth--; if(depth<minDepth)minDepth=depth;}
}
console.log("final depth:", depth);
console.log("min depth:", minDepth);
console.log("max depth:", maxDepth);
console.log("last open brace line:", lastOpenLine);
console.log("total lines:", line);
