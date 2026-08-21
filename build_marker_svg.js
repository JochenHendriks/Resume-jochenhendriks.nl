const fs = require('fs');
const content = fs.readFileSync('extracted_graphic.svg', 'utf8');

// Parse all path d attributes and polygon points
const pathMatches = [...content.matchAll(/<path\s+d="([^"]+)"/g)].map(m => m[1]);
const polyMatches = [...content.matchAll(/<polygon\s+points="([^"]+)"/g)].map(m => m[1]);

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

for (const d of pathMatches) {
  const nums = d.match(/-?[\d.]+/g).map(Number);
  for (let i = 0; i < nums.length; i += 2) {
    const x = nums[i];
    const y = nums[i + 1];
    if (!isNaN(x)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
    if (!isNaN(y)) {
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

for (const p of polyMatches) {
  const nums = p.trim().split(/\s+/).map(Number);
  for (let i = 0; i < nums.length; i += 2) {
    const x = nums[i];
    const y = nums[i + 1];
    if (!isNaN(x)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
    if (!isNaN(y)) {
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

console.log(`EXACT Graphic_Element Box: minX=${minX}, minY=${minY}, maxX=${maxX}, maxY=${maxY}`);
const width = maxX - minX;
const height = maxY - minY;
console.log(`Width=${width}, Height=${height}`);

// Add slight padding: 10px
const pad = 10;
const vbX = Math.floor(minX - pad);
const vbY = Math.floor(minY - pad);
const vbW = Math.ceil(width + pad * 2);
const vbH = Math.ceil(height + pad * 2);

// Generate crisp clean SVG with currentColor / #dc2626
let pathsHtml = content
  .replace(/<g id="Graphic_Element">/g, '')
  .replace(/<\/g>\s*<\/g>/g, '')
  .replace(/<path/g, '<path fill="#dc2626"')
  .replace(/<polygon/g, '<polygon fill="#dc2626"');

const finalSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="100%" height="100%">
  <g fill="#dc2626">
    ${pathsHtml}
  </g>
</svg>
`;

fs.writeFileSync('marker-circle-red.svg', finalSvg);
console.log('Successfully wrote marker-circle-red.svg with viewBox:', `${vbX} ${vbY} ${vbW} ${vbH}`);
