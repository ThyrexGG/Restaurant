import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('=== Cleaning menu.json and Database ===');

  const jsonPath = path.resolve(process.cwd(), '../frontend/src/assets/menu.json');
  let rawData = fs.readFileSync(jsonPath, 'utf-8');
  let menuArray = JSON.parse(rawData);

  console.log(`Original menu.json count: ${menuArray.length}`);

  // List of un-split or duplicate names/SKUs to remove completely
  const targetUnsplitNames = [
    'Deep Fried fish & French fries',
    'Deep Fried fish & fries',
    'Special Pad Thai (Beef/Seafood)',
    'Special Pad Thai (Chicken/Pork/Tofu)',
    'English Lok lak (Beef/Chicken)',
    'Special Pad Thai with Tofu',
    'Shrimp Paste Fried Rice (Chicken/ Pork)',
    'Fried Flat Noodle (Beef/Seafood)',
    'Fried Flat Noodle (Beef/Shrimp)',
    'Fried Mama instant noodle (Beef/Seafood)',
    'Fried Mama Noodle (Beef/Seafood)',
    'Fried  instant Noodle (Beef/Seafood)',
    'Fried Glass Noodle (Beef/Seafood)',
    'Fried Glass Noodle (Beef/Shrimp)',
    'Cheese Burger (Beef Burger with cheese)',
    '(Cheese Burger) Beef Burger with Cheese'
  ];

  const targetSKUs = ['B20', 'F17', 'F18', 'G17', 'VF13'];

  // 1. Clean menu.json
  const cleanedJson = menuArray.filter((item: any) => {
    const name = item.Name || '';
    const sku = item.SKU || '';

    if (targetSKUs.includes(sku)) return false;
    if (targetUnsplitNames.some(u => name.toLowerCase() === u.toLowerCase())) return false;
    return true;
  });

  fs.writeFileSync(jsonPath, JSON.stringify(cleanedJson, null, 4), 'utf-8');
  console.log(`Cleaned menu.json count: ${cleanedJson.length} (Removed ${menuArray.length - cleanedJson.length} items from JSON)`);

  // 2. Clean Database
  let totalDeletedDb = 0;

  for (const name of targetUnsplitNames) {
    const deleted = await prisma.menuItem.deleteMany({
      where: { name: { equals: name, mode: 'insensitive' } }
    });
    totalDeletedDb += deleted.count;
    if (deleted.count > 0) {
      console.log(`Deleted ${deleted.count} DB item(s) matching name: "${name}"`);
    }
  }

  for (const sku of targetSKUs) {
    const deleted = await prisma.menuItem.deleteMany({
      where: { sku: { equals: sku, mode: 'insensitive' } }
    });
    totalDeletedDb += deleted.count;
    if (deleted.count > 0) {
      console.log(`Deleted ${deleted.count} DB item(s) matching SKU: "${sku}"`);
    }
  }

  // Also clean any exact duplicate names in DB (where duplicate has no image)
  const dbItems = await prisma.menuItem.findMany();
  const nameMap = new Map<string, typeof dbItems>();
  for (const item of dbItems) {
    const nameKey = item.name.trim().toLowerCase();
    if (!nameMap.has(nameKey)) nameMap.set(nameKey, []);
    nameMap.get(nameKey)!.push(item);
  }

  for (const [nameKey, items] of nameMap.entries()) {
    if (items.length > 1) {
      // Sort so item with image comes first
      items.sort((a, b) => (a.image ? -1 : 1) - (b.image ? -1 : 1));
      const keep = items[0];
      const remove = items.slice(1);
      for (const dupe of remove) {
        await prisma.orderItem.deleteMany({ where: { menuItemId: dupe.id } });
        await prisma.menuItem.delete({ where: { id: dupe.id } });
        totalDeletedDb++;
        console.log(`Deleted duplicate DB item: "${dupe.name}" [ID: ${dupe.id}]`);
      }
    }
  }

  console.log(`=== Done! Total DB items deleted: ${totalDeletedDb} ===`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
