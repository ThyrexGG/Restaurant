// scripts/link_all_remaining_candidates.js
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
      results.push({ fullPath: p, file: f, folder: path.basename(path.dirname(p)) });
    }
  });
  return results;
}

const rawImages = getAllImageFiles(path.join(root, 'backend/raw-images'));
const legacyImages = getAllImageFiles(path.join(root, 'frontend/public/images/_legacy'));
const allAssets = rawImages.concat(legacyImages);

// Batch 2 confirmed links
const batch2Confirmed = [
  { sku: 'Dessert4', file: 'Banana in coconut milk.png' },
  { sku: 'D43', file: 'Brown sugar frappe.png' },
  { sku: 'D45', file: 'Butterfly pea tea frappe.png' },
  { sku: 'D76', file: 'Butterfly pea milk tea macchiato.png' },
  { sku: 'G11', file: 'Deep fried chicken drumstick with Khmer fish cheese.png' },
  { sku: 'SF32', file: 'Deep fried fish with sweet and sour sauce.png' },
  { sku: 'B30', file: 'Deep fried hotdog flour.png' },
  { sku: 'K8', file: 'Green Mango Salad with dried shrimp.png' },
  { sku: 'G13', file: 'Grilled beef with khmer fish cheese.png' },
  { sku: 'G10', file: 'Chicken BBQ.png' }
];

batch2Confirmed.forEach(c => {
  const item = menuData.find(i => i.SKU === c.sku);
  const asset = allAssets.find(a => a.file.toLowerCase() === c.file.toLowerCase());
  if (item && asset) {
    const cat = (item.Category || 'Uncategorized').trim();
    const catDir = path.join(imagesDir, cat);
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });
    
    const dest = path.join(catDir, asset.file);
    if (!fs.existsSync(dest)) fs.copyFileSync(asset.fullPath, dest);
    item.image = `/images/${cat}/${asset.file}`;
  }
});

function tokenize(str) {
  return (str || '').toLowerCase()
    .replace(/[\(\)\/\,\.\-\_\&]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['with', 'and', 'or', 'the', 'small', 'big', 'can', 'bottle'].includes(w));
}

let newlyLinked = 0;

menuData.forEach(item => {
  if (item.image && item.image.length > 0) return; // already linked

  const itemTokens = tokenize(item.Name);
  const itemLower = item.Name.toLowerCase();
  
  // Find unused assets that match keywords
  const linkedFiles = new Set(menuData.filter(i => i.image).map(i => path.basename(i.image).toLowerCase()));
  const unusedAssets = allAssets.filter(a => !linkedFiles.has(a.file.toLowerCase()));

  const matches = unusedAssets.map(asset => {
    const fBase = asset.file.replace(/\.[^/.]+$/, '');
    const assetTokens = tokenize(fBase);
    const common = itemTokens.filter(t => assetTokens.includes(t) || fBase.toLowerCase().includes(t));
    return { asset, commonCount: common.length, commonWords: common };
  }).filter(m => m.commonCount >= 2).sort((a, b) => b.commonCount - a.commonCount);

  if (matches.length > 0) {
    const candFile = matches[0].asset.file;
    const candLower = candFile.toLowerCase();

    // Guard against false positives
    if (itemLower.includes('apple') && !itemLower.includes('pineapple') && candLower.includes('pineapple')) return;
    if (itemLower.includes('gin') && !itemLower.includes('ginger') && candLower.includes('ginger')) return;
    if (itemLower.includes('egg') && !itemLower.includes('eggplant') && candLower.includes('eggplant')) return;

    const cat = (item.Category || 'Uncategorized').trim();
    const catDir = path.join(imagesDir, cat);
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

    const dest = path.join(catDir, candFile);
    if (!fs.existsSync(dest)) fs.copyFileSync(matches[0].asset.fullPath, dest);

    item.image = `/images/${cat}/${candFile}`;
    newlyLinked++;
  }
});

fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 4), 'utf-8');

const totalLinked = menuData.filter(i => i.image && i.image.length > 0).length;
const totalEmpty = menuData.filter(i => !i.image || i.image.length === 0).length;

console.log(`\nCandidate linking complete!`);
console.log(`  - Newly linked: ${newlyLinked}`);
console.log(`  - Total items with real photo linked: ${totalLinked} / ${menuData.length}`);
console.log(`  - Total items left empty (no photo file): ${totalEmpty}`);
