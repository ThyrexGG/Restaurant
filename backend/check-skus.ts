import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const items = await prisma.menuItem.findMany({ where: { name: { contains: 'Noodle Soup' } } });
  console.log(items.map(i => ({name: i.name, sku: i.sku, SKU: i.SKU})));
  
  const pork = await prisma.menuItem.findMany({ where: { name: { contains: 'Grilled Pork' } } });
  console.log(pork.map(i => ({name: i.name, sku: i.sku, SKU: i.SKU})));
}
run().finally(() => prisma.$disconnect());
