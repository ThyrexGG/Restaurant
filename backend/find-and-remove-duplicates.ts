import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const prisma = new PrismaClient();

async function checkAndCleanDuplicates() {
  console.log('=== Checking for Duplicate Menu Items in Database ===');
  
  const allItems = await prisma.menuItem.findMany({
    include: { category: true }
  });

  console.log(`Total menu items in DB: ${allItems.length}`);

  const nameMap = new Map<string, typeof allItems>();
  const skuMap = new Map<string, typeof allItems>();

  for (const item of allItems) {
    const cleanName = item.name.trim().toLowerCase();
    if (!nameMap.has(cleanName)) {
      nameMap.set(cleanName, []);
    }
    nameMap.get(cleanName)!.push(item);

    if (item.sku) {
      const cleanSku = item.sku.trim().toLowerCase();
      if (!skuMap.has(cleanSku)) {
        skuMap.set(cleanSku, []);
      }
      skuMap.get(cleanSku)!.push(item);
    }
  }

  let duplicateNameCount = 0;
  let deletedCount = 0;

  // Process Duplicate Names
  for (const [name, items] of nameMap.entries()) {
    if (items.length > 1) {
      duplicateNameCount++;
      console.log(`\nFound ${items.length} duplicates for Name: "${items[0].name}"`);
      
      // Sort items: keep the one that has an image or lowest ID/created date
      items.sort((a, b) => {
        if (a.image && !b.image) return -1;
        if (!a.image && b.image) return 1;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

      const keep = items[0];
      const remove = items.slice(1);

      console.log(`  -> KEEPING: [ID: ${keep.id}] Name: "${keep.name}" | SKU: ${keep.sku} | Image: ${keep.image ? 'Yes' : 'No'}`);
      
      for (const dupe of remove) {
        console.log(`  -> REMOVING: [ID: ${dupe.id}] Name: "${dupe.name}" | SKU: ${dupe.sku}`);
        // Delete orderItems pointing to duplicate if any, or reconnect them
        await prisma.orderItem.deleteMany({ where: { menuItemId: dupe.id } });
        await prisma.menuItem.delete({ where: { id: dupe.id } });
        deletedCount++;
      }
    }
  }

  // Process Duplicate SKUs (if any remain with different names)
  for (const [sku, items] of skuMap.entries()) {
    if (items.length > 1) {
      console.log(`\nFound ${items.length} items sharing SKU: "${items[0].sku}"`);
      for (let i = 0; i < items.length; i++) {
        console.log(`  Item ${i + 1}: [ID: ${items[i].id}] Name: "${items[i].name}"`);
      }
    }
  }

  console.log(`\n=== Cleanup Complete ===`);
  console.log(`Duplicate name sets found: ${duplicateNameCount}`);
  console.log(`Total duplicate items deleted: ${deletedCount}`);
  console.log(`Remaining unique items in DB: ${allItems.length - deletedCount}`);
}

checkAndCleanDuplicates()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
