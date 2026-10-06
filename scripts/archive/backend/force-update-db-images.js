// backend/force-update-db-images.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  const menuPath = path.resolve(__dirname, '../frontend/src/assets/menu.json');
  if (!fs.existsSync(menuPath)) {
    console.error('menu.json not found');
    return;
  }

  const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
  console.log(`Force updating ${menuData.length} DB records from menu.json...`);

  let updatedCount = 0;

  for (const item of menuData) {
    const sku = item.SKU ? item.SKU.trim() : null;
    const name = item.Name ? item.Name.trim() : null;
    const targetImage = item.image && item.image.length > 0 ? item.image : null;

    if (!name) continue;

    let dbItem = null;
    if (sku) {
      dbItem = await prisma.menuItem.findFirst({ where: { sku: sku } });
    }
    if (!dbItem && name) {
      dbItem = await prisma.menuItem.findFirst({ where: { name: name } });
    }

    if (dbItem) {
      await prisma.menuItem.update({
        where: { id: dbItem.id },
        data: { image: targetImage }
      });
      updatedCount++;
    }
  }

  console.log(`SUCCESS: Force updated database image paths for ${updatedCount} items.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
