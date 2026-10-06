import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning duplicate items B60 and B59 from database...');
  
  // Delete items with SKU B60 or B59
  const deleted = await prisma.menuItem.deleteMany({
    where: {
      sku: {
        in: ['B60', 'B59']
      }
    }
  });

  console.log(`Deleted ${deleted.count} duplicate records from MenuItem table.`);
}

main().then(() => prisma.$disconnect()).catch(err => {
  console.error(err);
  prisma.$disconnect();
});
