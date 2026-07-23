// scripts/link_by_sku_and_name.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const menuPath = path.resolve(root, 'frontend/src/assets/menu.json');
const imagesDir = path.resolve(root, 'frontend/public/images');

const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));

function getAllImageFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      results = results.concat(getAllImageFiles(p));
    } else if (/\.(webp|png|jpg|jpeg|jfif)$/i.test(f)) {
      results.push({ fullPath: p, file: f });
    }
  });
  return results;
}

const rawImages = getAllImageFiles(path.join(root, 'backend/raw-images'));
const legacyImages = getAllImageFiles(path.join(root, 'frontend/public/images/_legacy'));
const allAssets = rawImages.concat(legacyImages);

console.log(`Collected ${allAssets.length} total image assets.`);

function clean(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

const stopWords = ['apple', 'gin', 'egg', 'rice', 'soup', 'salad', 'fried', 'food', 'drink'];

let skuMatched = 0;
let nameMatched = 0;
let emptyCount = 0;

menuData.forEach(item => {
  const category = (item.Category || 'Uncategorized').trim();
  const catDir = path.join(imagesDir, category);
  if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

  const skuClean = clean(item.SKU);
  const nameClean = clean(item.Name);
  const handleClean = clean(item.Handle);

  let found = null;
  let isSkuMatch = false;

  // Pass 1: SKU Match (e.g. F5.jfif, B11.png, BV2.png)
  if (skuClean) {
    found = allAssets.find(a => {
      const fClean = clean(a.file.replace(/\.[^/.]+$/, ''));
      return fClean === skuClean;
    });
    if (found) isSkuMatch = true;
  }

  // Pass 2: Dish Name Match
  if (!found) {
    found = allAssets.find(a => {
      const fBase = a.file.replace(/\.[^/.]+$/, '').trim();
      const fClean = clean(fBase);
      if (!fClean || stopWords.includes(fClean)) return false;

      if (fClean === nameClean || (handleClean && fClean === handleClean)) return true;
      if (fClean.length >= 4 && (nameClean.startsWith(fClean) || fClean.startsWith(nameClean))) return true;

      return false;
    });
  }

  if (found) {
    const destPath = path.join(catDir, found.file);
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(found.fullPath, destPath);
    }
    item.image = `/images/${category}/${found.file}`;

    if (isSkuMatch) skuMatched++;
    else nameMatched++;
  } else {
    item.image = '';
    emptyCount++;
  }
});

fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 4), 'utf-8');

console.log(`\nFinished Linking Image Assets:`);
console.log(`  - SKU Code Matches: ${skuMatched}`);
console.log(`  - Dish Name Matches: ${nameMatched}`);
console.log(`  - Total Real Matches Linked: ${skuMatched + nameMatched}`);
console.log(`  - Items Left Empty (No Photo): ${emptyCount}`);
