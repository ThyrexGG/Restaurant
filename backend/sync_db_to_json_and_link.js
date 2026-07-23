// backend/sync_db_to_json_and_link.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  const root = path.resolve(__dirname, '..');
  const menuPath = path.resolve(root, 'frontend/src/assets/menu.json');
  const imagesDir = path.resolve(root, 'frontend/public/images');
  const rawDir = path.resolve(root, 'backend/raw-images');

  // 1. Read existing menu.json
  let menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));

  // 2. Fetch all items from DB
  const dbItems = await prisma.menuItem.findMany({
    include: { category: true }
  });

  console.log(`Database items: ${dbItems.length}, menu.json items: ${menuData.length}`);

  // 3. Add missing DB items to menu.json
  dbItems.forEach(dbItem => {
    const exists = menuData.some(i => i.SKU === dbItem.sku || i.Name === dbItem.name);
    if (!exists) {
      const newItem = {
        Handle: dbItem.sku || dbItem.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        SKU: dbItem.sku || '',
        Name: dbItem.name,
        Category: dbItem.category ? dbItem.category.name : 'Uncategorized',
        Description: dbItem.description || '',
        "Sold by weight": "N",
        "Price [Best Khmer (Golden Cafe) Restaurant]": String(dbItem.price),
        image: dbItem.image || ''
      };
      menuData.push(newItem);
      console.log(`Added missing item to JSON: ${newItem.Name} (SKU: ${newItem.SKU})`);
    }
  });

  // 4. Link the new matching images
  const newLinks = [
    { sku: 'VF25', category: 'Vegetarian Food', file: 'Bok Choy tofu.jpg' },
    { sku: 'VF3', category: 'Vegetarian Food', file: 'Deep fry tofu.jpg' },
    { sku: 'VF20', category: 'Vegetarian Food', file: 'Flat noodle tofu.jpg' },
    { sku: 'VF21', category: 'Vegetarian Food', file: 'green mango salad tofu.jpg' },
    { sku: 'VF24', category: 'Vegetarian Food', file: 'morning glory tofu.jpg' },
    { sku: 'VF19', category: 'Vegetarian Food', file: 'tofu noodle soup.jpg' },
    { sku: 'G17', category: 'Grilled', file: 'English Lok lak (Beef).jpg' }
  ];

  newLinks.forEach(l => {
    const item = menuData.find(i => i.SKU === l.sku);
    const srcPath = path.join(rawDir, l.file);
    if (item && fs.existsSync(srcPath)) {
      const catDir = path.join(imagesDir, l.category);
      if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

      const destPath = path.join(catDir, l.file);
      fs.copyFileSync(srcPath, destPath);

      item.image = `/images/${l.category}/${l.file}`;
      console.log(`Linked SKU ${l.sku} (${item.Name}) to ${item.image}`);
    }
  });

  // 5. Save updated menu.json
  fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 4), 'utf-8');

  // 6. Sync back to DB
  for (const item of menuData) {
    const sku = item.SKU ? item.SKU.trim() : null;
    const name = item.Name ? item.Name.trim() : null;
    const img = item.image && item.image.length > 0 ? item.image : null;

    if (!name) continue;

    let dbItem = null;
    if (sku) {
      dbItem = dbItems.find(i => i.sku === sku);
    }
    if (!dbItem && name) {
      dbItem = dbItems.find(i => i.name === name);
    }

    if (dbItem) {
      await prisma.menuItem.update({
        where: { id: dbItem.id },
        data: { image: img }
      });
    }
  }

  const finalLinked = menuData.filter(i => i.image).length;
  console.log(`\nUpdated all items: ${finalLinked} / ${menuData.length} dishes with photos.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
