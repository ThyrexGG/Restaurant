import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.menuItem.findMany();
  console.log(JSON.stringify(items.map(i => ({id: i.id, name: i.name, desc: i.description})), null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
