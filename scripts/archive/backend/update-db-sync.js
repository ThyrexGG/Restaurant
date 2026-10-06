import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function runSync() {
  const menuPath = path.resolve(__dirname, '../frontend/src/assets/menu.json');
  const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
  console.log(`Syncing ${menuData.length} items to Prisma DB...`);

  let count = 0;
  for (const item of menuData) {
    const sku = item.SKU ? item.SKU.trim() : null;
    const name = item.Name ? item.Name.trim() : null;
    const img = item.image && item.image.length > 0 ? item.image : null;

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
        data: { image: img }
      });
      count++;
    }
  }

  console.log(`DONE! Synchronized ${count} database items.`);
}

runSync().then(() => prisma.$disconnect()).catch(err => {
  console.error(err);
  prisma.$disconnect();
});
