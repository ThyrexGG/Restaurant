import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const items = await prisma.menuItem.findMany({
    where: { category: { name: 'Addons' } },
    include: { category: true }
  });
  console.log(items.map(i => ({ id: i.id, name: i.name, price: i.price })));
}

run().finally(() => prisma.$disconnect());
