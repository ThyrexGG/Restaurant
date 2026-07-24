// backend/link_last_three_remaining.js
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
const rawDir = path.resolve(root, 'backend/raw-images');

const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));

const links = [
  { sku: 's8', category: 'Soup', file: 'Tom Yum Chicken.jpg' },
  { sku: 's7', category: 'Soup', file: 'Tom Yum Shrimp.jpg' },
  { sku: 'ADD5', category: 'Addons', file: 'Extra Bacon.jpg' }
];

links.forEach(l => {
  const item = menuData.find(i => i.SKU === l.sku);
  
  function findFile(dir, filename) {
    let found = null;
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) {
        const res = findFile(p, filename);
        if (res) found = res;
      } else if (f.toLowerCase() === filename.toLowerCase()) {
        found = p;
      }
    });
    return found;
  }

  const srcPath = findFile(rawDir, l.file);
  
  if (item && srcPath && fs.existsSync(srcPath)) {
    const catDir = path.join(imagesDir, l.category);
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

    const destPath = path.join(catDir, l.file);
    fs.copyFileSync(srcPath, destPath);

    item.image = `/images/${l.category}/${l.file}`;
    console.log(`Successfully linked SKU ${l.sku} to ${item.image}`);
  } else {
    console.log(`Failed to link SKU ${l.sku}: file exists? ${srcPath && fs.existsSync(srcPath)}`);
  }
});

fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 4), 'utf-8');

async function syncDb() {
  console.log('Syncing all items to Prisma DB...');
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
  console.log('Database synced successfully.');
}

syncDb()
  .then(() => {
    const totalLinked = menuData.filter(i => i.image).length;
    console.log(`\nFinal completion: ${totalLinked} of ${menuData.length} items linked!`);
    prisma.$disconnect();
  })
  .catch(err => {
    console.error(err);
    prisma.$disconnect();
  });
