import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const items = await prisma.menuItem.findMany({
    where: {
      OR: [
        { name: { contains: 'Avocado', mode: 'insensitive' } },
        { name: { contains: 'Egg', mode: 'insensitive' } },
        { name: { contains: 'Rice', mode: 'insensitive' } },
        { name: { contains: 'Cheese', mode: 'insensitive' } },
      ]
    },
    select: { id: true, name: true, price: true, category: { select: { name: true } } }
  });
  console.log(items.filter(i => i.price <= 2.5));
}

run().finally(() => prisma.$disconnect());
