import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function purgeAllMissingImageItems() {
  console.log('=== Purging All 5 Missing Image Items from Database & JSON ===');

  const targetIds = [
    'cae2fdf1-dff3-4a79-825b-b4194f7bf6e2', // G17 English Lok lak (Beef/Chicken)
    '4e1c6c0d-b580-4cf6-9246-f24b3f450951', // F21 Fried Flat Noodle (Beef/Seafood)
    'e13f81e9-2592-4b14-b7d2-a0bcb00b427a', // F28 Fried Glass Noodle (Beef/Seafood)
    'ae583ff0-baec-47a2-9d96-4dd550a83adc', // F23 Fried Mama Noodle (Beef/Seafood)
    '31c68d4c-e87c-4671-b591-96188a084bfd'  // B20 Deep Fried fish & French fries
  ];

  // 1. Delete from DB
  for (const id of targetIds) {
    await prisma.orderItem.deleteMany({ where: { menuItemId: id } });
    const res = await prisma.menuItem.deleteMany({ where: { id } });
    console.log(`Deleted DB item ID ${id}: ${res.count} deleted`);
  }

  // 2. Also delete any item where image is null or empty in DB
  const emptyImageResult = await prisma.menuItem.deleteMany({
    where: {
      OR: [
        { image: null },
        { image: '' }
      ]
    }
  });
  console.log(`Additional empty image DB items deleted: ${emptyImageResult.count}`);

  // 3. Clean menu.json
  const jsonPath = path.resolve(process.cwd(), '../frontend/src/assets/menu.json');
  if (fs.existsSync(jsonPath)) {
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const menuArray = JSON.parse(rawData);
    const targetSkus = ['G17', 'F21', 'F28', 'F23', 'B20'];
    const cleaned = menuArray.filter((i: any) => !targetSkus.includes(i.SKU) && i.Cloudinary_ID && i.Cloudinary_ID.trim() !== '');
    fs.writeFileSync(jsonPath, JSON.stringify(cleaned, null, 4), 'utf-8');
    console.log(`Cleaned menu.json! Remaining items: ${cleaned.length}`);
  }

  console.log('=== PURGE COMPLETE ===');
}

purgeAllMissingImageItems()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
