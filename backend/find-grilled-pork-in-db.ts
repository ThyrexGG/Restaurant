import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function inspectGrilledPork() {
  console.log('=== Inspecting Grilled Pork items in DB ===');
  
  const items = await prisma.menuItem.findMany({
    where: {
      name: { contains: 'Grilled Pork', mode: 'insensitive' }
    }
  });

  console.log(`Found ${items.length} items containing "Grilled Pork":\n`);
  for (const item of items) {
    console.log(`[ID: ${item.id}] SKU: ${item.sku} | Name: "${item.name}" | Image: "${item.image}" | Price: ${item.price}`);
  }
}

inspectGrilledPork()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
