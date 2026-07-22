import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function cleanupRedundantUnsplitItems() {
  console.log('=== Cleaning Redundant Un-split Items ===');

  // Delete old un-split items if split versions exist
  const unsplitNamesToDelete = [
    'English Lok lak (Beef/Chicken)',
    'Cheese Burger (Beef Burger with cheese)',
    '(Cheese Burger) Beef Burger with Cheese'
  ];

  for (const name of unsplitNamesToDelete) {
    const deleted = await prisma.menuItem.deleteMany({
      where: { name: { equals: name, mode: 'insensitive' } }
    });
    if (deleted.count > 0) {
      console.log(`Deleted ${deleted.count} old un-split item(s) named "${name}"`);
    }
  }

  console.log('Cleanup finished successfully.');
}

cleanupRedundantUnsplitItems()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
