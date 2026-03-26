// Generate simple SVG-based PWA icons
// Run: node scripts/generate-icons.mjs

import { writeFileSync } from "fs";

function createSVG(size, padding = 0) {
  const bg = "#2563eb";
  const innerSize = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const houseSize = innerSize * 0.4;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${bg}" rx="${size * 0.15}"/>
  <g transform="translate(${cx}, ${cy})">
    <path d="M0,${-houseSize * 0.5} L${houseSize * 0.55},${houseSize * 0.1} L${houseSize * 0.35},${houseSize * 0.1} L${houseSize * 0.35},${houseSize * 0.5} L${-houseSize * 0.35},${houseSize * 0.5} L${-houseSize * 0.35},${houseSize * 0.1} L${-houseSize * 0.55},${houseSize * 0.1} Z" fill="white"/>
    <rect x="${-houseSize * 0.1}" y="${houseSize * 0.15}" width="${houseSize * 0.2}" height="${houseSize * 0.35}" fill="${bg}"/>
  </g>
  <text x="${cx}" y="${size * 0.88}" text-anchor="middle" font-family="sans-serif" font-size="${size * 0.09}" font-weight="700" fill="white" opacity="0.9">DiraTrak</text>
</svg>`;
}

// We'll create SVGs and convert them to data-URI PNGs via a simple approach
// For actual PNG generation, use sharp or canvas. For now, SVGs work for development.
const sizes = [
  { name: "icon-192.png", size: 192, padding: 0 },
  { name: "icon-512.png", size: 512, padding: 0 },
  { name: "icon-maskable-512.png", size: 512, padding: 80 },
  { name: "apple-touch-icon.png", size: 180, padding: 0 },
];

for (const { name, size, padding } of sizes) {
  const svgName = name.replace(".png", ".svg");
  const svg = createSVG(size, padding);
  writeFileSync(`public/icons/${svgName}`, svg);
  console.log(`Created public/icons/${svgName}`);
}

console.log("\nNote: SVG icons created. For production, convert to PNG.");
console.log("The manifest and layout reference .png files.");
console.log("Update manifest.ts icon entries to use .svg for now, or convert with sharp.");
