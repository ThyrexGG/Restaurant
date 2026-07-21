import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const items = await prisma.menuItem.findMany({
    where: { name: { contains: 'Pineapple Fried Rice' } }
  });
  console.log(JSON.stringify(items.map(i => ({id: i.id, name: i.name, price: i.price, categoryId: i.categoryId, image: i.image})), null, 2));
}

run().finally(() => prisma.$disconnect());
