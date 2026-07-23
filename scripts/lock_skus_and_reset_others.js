// scripts/lock_skus_and_reset_others.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const menuPath = path.resolve(root, 'frontend/src/assets/menu.json');
const imagesDir = path.resolve(root, 'frontend/public/images');
const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));

function getRawFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      results = results.concat(getRawFiles(p));
    } else if (/\.(webp|png|jpg|jpeg|jfif)$/i.test(f)) {
      results.push({ fullPath: p, file: f });
    }
  });
  return results;
}

const rawFiles = getRawFiles(path.join(root, 'backend/raw-images'));

let lockedCount = 0;
let resetCount = 0;

menuData.forEach(item => {
  const sku = (item.SKU || '').trim().toLowerCase();
  
  // Strict match by SKU filename in backend/raw-images/
  const skuMatch = rawFiles.find(rf => {
    const base = rf.file.replace(/\.[^/.]+$/, '').trim().toLowerCase();
    return sku && base === sku;
  });

  if (skuMatch) {
    const cat = (item.Category || 'Uncategorized').trim();
    const catDir = path.join(imagesDir, cat);
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

    const dest = path.join(catDir, skuMatch.file);
    if (!fs.existsSync(dest)) fs.copyFileSync(skuMatch.fullPath, dest);

    item.image = `/images/${cat}/${skuMatch.file}`;
    lockedCount++;
  } else {
    // Reset all non-SKU items to empty for user examination
    item.image = '';
    resetCount++;
  }
});

fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 4), 'utf-8');

console.log(`\nSKU Lock Complete:`);
console.log(`  - Locked SKU items (Protected): ${lockedCount}`);
console.log(`  - Reset items (Empty for examination): ${resetCount}`);
