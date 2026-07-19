import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.menuItem.findMany();
  const eggOrBurger = items.filter(i => 
    i.name.toLowerCase().includes('egg') || 
    i.name.toLowerCase().includes('burger')
  ).map(i => i.name);
  
  console.log(eggOrBurger);
}

main().catch(console.error).finally(() => prisma.$disconnect());
