// backend/restore_full_matches.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const root = path.resolve(__dirname, '..');
const menuPath = path.resolve(root, 'frontend/src/assets/menu.json');
const imagesDir = path.resolve(root, 'frontend/public/images');
const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));

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

const rawImages = getFlatFiles(path.join(root, 'backend/raw-images'));
const legacyImages = getFlatFiles(path.join(root, 'frontend/public/images/_legacy'));
const allAssets = rawImages.concat(legacyImages);

function tokenize(str) {
  return (str || '').toLowerCase()
    .replace(/[\(\)\/\,\.\-\_\&]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['with', 'and', 'or', 'the', 'small', 'big', 'can', 'bottle'].includes(w));
}

let newlyLinked = 0;

menuData.forEach(item => {
  const sku = (item.SKU || '').trim().toLowerCase();
  const itemLower = item.Name.toLowerCase();

  if (item.image && item.image.length > 0) return;

  const nameTokens = tokenize(item.Name);
  
  const matches = allAssets.map(asset => {
    const fBase = asset.file.replace(/\.[^/.]+$/, '').trim();
    const assetTokens = tokenize(fBase);
    const common = nameTokens.filter(t => assetTokens.includes(t) || fBase.toLowerCase().includes(t));
    return { asset, commonCount: common.length, commonWords: common };
  }).filter(m => m.commonCount >= 2).sort((a, b) => b.commonCount - a.commonCount);

  if (matches.length > 0) {
    const candFile = matches[0].asset.file;
    const candLower = candFile.toLowerCase();

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
console.log(`\nRestored linking:`);
console.log(`  - Newly linked back: ${newlyLinked}`);
console.log(`  - Total items with real photo linked: ${totalLinked} / ${menuData.length}`);

async function syncDb() {
  console.log('Synchronizing back to DB...');
  const dbItems = await prisma.menuItem.findMany();
  
  for (const item of menuData) {
    const sku = item.SKU ? item.SKU.trim() : null;
    const name = item.Name ? item.Name.trim() : null;
    const img = item.image && item.image.length > 0 ? item.image : null;

    if (!name) continue;

    let dbItem = null;
    if (sku) dbItem = dbItems.find(i => i.sku === sku);
    if (!dbItem && name) dbItem = dbItems.find(i => i.name === name);

    if (dbItem) {
      await prisma.menuItem.update({
        where: { id: dbItem.id },
        data: { image: img }
      });
    }
  }
  console.log('DONE DB sync.');
}

syncDb()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
