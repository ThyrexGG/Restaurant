import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const roastItems = await prisma.menuItem.findMany({
    where: { name: { contains: 'Roast' } }
  });
  
  const pastaItems = await prisma.menuItem.findMany({
    where: { name: { contains: 'Pasta' } }
  });
  
  console.log("ROAST ITEMS:");
  console.log(JSON.stringify(roastItems.map(i => ({id: i.id, name: i.name, price: i.price, categoryId: i.categoryId, image: i.image})), null, 2));
  
  console.log("PASTA ITEMS:");
  console.log(JSON.stringify(pastaItems.map(i => ({id: i.id, name: i.name, price: i.price, categoryId: i.categoryId, image: i.image})), null, 2));
}

run().finally(() => prisma.$disconnect());
