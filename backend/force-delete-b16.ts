import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function forceDeleteB16() {
  console.log('=== Force Deleting All B16 / Grilled Pork items with Price $2.00 or No Image ===');

  // Find all items matching B16 or Grilled Pork
  const items = await prisma.menuItem.findMany({
    where: {
      OR: [
        { sku: { equals: 'B16', mode: 'insensitive' } },
        { name: { contains: 'Grilled Pork', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`Found ${items.length} items:\n`);
  for (const item of items) {
    console.log(`[ID: ${item.id}] Name: "${item.name}" | SKU: ${item.sku} | Price: ${item.price} | Image: "${item.image}"`);
  }

  // Delete any item that has price == 2.00 OR has image == 'null' OR image == null OR image == ''
  for (const item of items) {
    const rawImage = (item.image || '').trim().toLowerCase();
    const isPrice2 = Math.abs(Number(item.price) - 2.00) < 0.01;
    const isMissingImg = !rawImage || rawImage === 'null' || rawImage === 'undefined' || rawImage === 'none';

    if (isPrice2 || isMissingImg) {
      console.log(`\nDeleting item ID ${item.id}...`);
      await prisma.orderItem.deleteMany({ where: { menuItemId: item.id } });
      const del = await prisma.menuItem.delete({ where: { id: item.id } });
      console.log(`Deleted item ID ${item.id}: "${del.name}"`);
    }
  }

  console.log('\n=== Cleanup Complete ===');
}

forceDeleteB16()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
