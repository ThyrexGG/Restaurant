import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.menuItem.findMany({
    where: {
      OR: [
        { name: { contains: 'Coconut', mode: 'insensitive' } },
        { name: { contains: 'Taro', mode: 'insensitive' } }
      ]
    }
  });

  console.log(items.map(i => ({ name: i.name, image: i.image })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
