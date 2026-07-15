import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting deduplication...');
  const allItems = await prisma.menuItem.findMany();
  
  const seenNames = new Set<string>();
  let deletedCount = 0;
  
  for (const item of allItems) {
    if (seenNames.has(item.name.toLowerCase())) {
      // Duplicate, delete it
      await prisma.menuItem.delete({ where: { id: item.id } });
      deletedCount++;
    } else {
      // First time seeing this name
      seenNames.add(item.name.toLowerCase());
    }
  }
  
  console.log(`Finished! Deleted ${deletedCount} duplicate items.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
