const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const items = await prisma.menuItem.findMany({
    where: {
      OR: [
        { name: { contains: 'Avocado', mode: 'insensitive' } },
        { name: { contains: 'Cheese', mode: 'insensitive' } },
        { name: { contains: 'Egg', mode: 'insensitive' } },
        { name: { contains: 'Bacon', mode: 'insensitive' } },
        { name: { contains: 'Extra', mode: 'insensitive' } }
      ]
    }
  });
  console.log(items.map((i: any) => ({ id: i.id, name: i.name, categoryId: i.categoryId, price: i.price })));
}

run().finally(() => prisma.$disconnect());
