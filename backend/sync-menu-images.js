// backend/sync-menu-images.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const menuPath = path.resolve(process.cwd(), '../frontend/src/assets/menu.json');
  if (!fs.existsSync(menuPath)) {
    console.error('menu.json not found');
    return;
  }

  const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
  console.log(`Syncing ${menuData.length} menu items to DB...`);

  let updated = 0;
  for (const item of menuData) {
    if (!item.Name || !item.image) continue;

    const sku = item.SKU ? item.SKU.trim() : null;
    const name = item.Name.trim();

    // Try finding by SKU first, then by Name
    let dbItem = null;
    if (sku) {
      dbItem = await prisma.menuItem.findFirst({ where: { sku: sku } });
    }
    if (!dbItem) {
      dbItem = await prisma.menuItem.findFirst({ where: { name: name } });
    }

    if (dbItem) {
      await prisma.menuItem.update({
        where: { id: dbItem.id },
        data: { image: item.image }
      });
      updated++;
    }
  }

  console.log(`Updated DB image paths for ${updated} menu items.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
