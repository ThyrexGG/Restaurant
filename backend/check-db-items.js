import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function check() {
  const menuPath = path.resolve(__dirname, '../frontend/src/assets/menu.json');
  const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
  const localSkus = new Set(menuData.map(i => i.SKU ? i.SKU.trim().toLowerCase() : ''));
  const localNames = new Set(menuData.map(i => i.Name ? i.Name.trim().toLowerCase() : ''));

  const dbItems = await prisma.menuItem.findMany({
    include: { category: true }
  });

  console.log(`Database items count: ${dbItems.length}`);
  console.log(`menu.json items count: ${menuData.length}`);

  const extraItems = [];
  dbItems.forEach(item => {
    const sku = item.sku ? item.sku.trim().toLowerCase() : '';
    const name = item.name ? item.name.trim().toLowerCase() : '';

    const hasSku = sku && localSkus.has(sku);
    const hasName = name && localNames.has(name);

    if (!hasSku && !hasName) {
      extraItems.push(item);
    }
  });

  console.log(`\nExtra items in Database (not in menu.json) count: ${extraItems.length}`);
  extraItems.forEach(i => {
    console.log(`  - SKU: ${i.sku || 'N/A'} | Name: ${i.name} | Category: ${i.category ? i.category.name : 'N/A'}`);
  });
}

check().then(() => prisma.$disconnect()).catch(console.error);
