import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.menuItem.findMany();
  
  console.log(items.filter(i => 
    i.name.toLowerCase().includes('deep fried fish')
  ).map(i => ({ name: i.name, image: i.image })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
