import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function deleteTargetItem() {
  console.log('=== Deleting target item: Deep Fried fish & French fries ===');
  
  const deleted = await prisma.menuItem.deleteMany({
    where: {
      OR: [
        { name: { contains: 'Deep Fried fish & French fries', mode: 'insensitive' } },
        { name: { contains: 'Deep Fried fish & fries', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`Deleted ${deleted.count} target item(s).`);
}

deleteTargetItem()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
