// scripts/apply_batch4.js
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
      results = results.concat(getAllImageFiles(dir));
    } else if (/\.(webp|png|jpg|jpeg|jfif)$/i.test(f)) {
      results.push({ fullPath: p, file: f });
    }
  });
  return results;
}

// Flat file list
const rawDir = path.join(root, 'backend/raw-images');
const legacyDir = path.join(root, 'frontend/public/images/_legacy');

function getFlatFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isFile() && /\.(webp|png|jpg|jpeg|jfif)$/i.test(f)) {
      results.push({ fullPath: p, file: f });
    } else if (fs.statSync(p).isDirectory()) {
      results = results.concat(getFlatFiles(p));
    }
  });
  return results;
}

const allAssets = getFlatFiles(rawDir).concat(getFlatFiles(legacyDir));

// Batch 4 confirmed matches
const batch4Confirmed = [
  { sku: 'D58', file: 'Pine apple smoothie.png' },
  { sku: 'FS1', file: 'fresh fruit slice.png' },
  { sku: 'H1', file: 'hot espresso.png' },
  { sku: 'D83', file: 'milo.png' },
  { sku: 'D84', file: 'ovaltine.png' },
  { sku: 'CKT5', file: 'Magarita.png' },
  { sku: 'CKT7', file: 'Mojito.png' },
  { sku: 'CKT1', file: 'golden barcadi.png' },
  { sku: 'W3', file: 'GIN.png' },
  { sku: 'W2', file: 'Rum.png' },
  { sku: 'ADD6', file: 'avocado-slice.webp' }
];

let applied = 0;
batch4Confirmed.forEach(c => {
  const item = menuData.find(i => i.SKU === c.sku);
  const asset = allAssets.find(a => a.file.toLowerCase() === c.file.toLowerCase());
  
  if (item && asset) {
    const cat = (item.Category || 'Uncategorized').trim();
    const catDir = path.join(imagesDir, cat);
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

    const dest = path.join(catDir, asset.file);
    if (!fs.existsSync(dest)) fs.copyFileSync(asset.fullPath, dest);

    item.image = `/images/${cat}/${asset.file}`;
    applied++;
  }
});

fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 4), 'utf-8');
console.log(`Applied Batch 4 links: ${applied}`);
