// scripts/link_raw_images.js
const fs = require('fs');
const path = require('path');

const rawDir = path.resolve(__dirname, '../backend/raw-images');
const imagesDir = path.resolve(__dirname, '../frontend/public/images');
const menuPath = path.resolve(__dirname, '../frontend/src/assets/menu.json');

const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));

function getAllRawFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      results = results.concat(getAllRawFiles(p));
    } else if (/\.(webp|png|jpg|jpeg|jfif)$/i.test(f)) {
      results.push({ fullPath: p, file: f });
    }
  });
  return results;
}

const rawFiles = getAllRawFiles(rawDir);
console.log(`Loaded ${rawFiles.length} raw image files from backend/raw-images.`);

let skuMatches = 0;
let nameMatches = 0;
let emptyCount = 0;

menuData.forEach(item => {
  const sku = (item.SKU || '').trim().toLowerCase();
  const name = (item.Name || '').trim().toLowerCase();
  const handle = (item.Handle || '').trim().toLowerCase();
  const category = (item.Category || 'Uncategorized').trim();

  // 1. Check exact SKU match (e.g. F5.jfif, B11.png, BV2.png)
  let found = rawFiles.find(rf => {
    const base = rf.file.replace(/\.[^/.]+$/, '').trim().toLowerCase();
    return sku && base === sku;
  });

  let isSkuMatch = !!found;

  // 2. Check exact Name or Handle match if no SKU match
  if (!found) {
    found = rawFiles.find(rf => {
      const base = rf.file.replace(/\.[^/.]+$/, '').trim().toLowerCase();
      const baseClean = base.replace(/[^a-z0-9]/g, '');
      const nameClean = name.replace(/[^a-z0-9]/g, '');
      const handleClean = handle.replace(/[^a-z0-9]/g, '');
      return (baseClean && baseClean === nameClean) || (handleClean && baseClean === handleClean);
    });
  }

  if (found) {
    const catDir = path.join(imagesDir, category);
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
    }

    const destPath = path.join(catDir, found.file);
    fs.copyFileSync(found.fullPath, destPath);

    item.image = `/images/${category}/${found.file}`;

    if (isSkuMatch) skuMatches++;
    else nameMatches++;
  } else {
    // Leave EMPTY — no random fallbacks!
    item.image = '';
    emptyCount++;
  }
});

fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 4), 'utf-8');

console.log(`\nFinished linking raw images from backend/raw-images:`);
console.log(`  - SKU Code Matches: ${skuMatches}`);
console.log(`  - Name / Handle Matches: ${nameMatches}`);
console.log(`  - Total Real Images Linked: ${skuMatches + nameMatches}`);
console.log(`  - Items Left Empty (No Image): ${emptyCount}`);
