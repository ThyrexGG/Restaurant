import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function checkMissingImages() {
  console.log('=== Checking All Database Items with Missing Images ===');
  
  const allItems = await prisma.menuItem.findMany({
    include: { category: true }
  });

  const missingImageItems = allItems.filter(item => !item.image || item.image.trim() === '');

  console.log(`Total DB items: ${allItems.length}`);
  console.log(`Total DB items with MISSING image: ${missingImageItems.length}\n`);

  for (const item of missingImageItems) {
    console.log(`[ID: ${item.id}] SKU: ${item.sku || 'N/A'} | Name: "${item.name}" | Category: ${item.category?.name}`);
  }
}

checkMissingImages()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
