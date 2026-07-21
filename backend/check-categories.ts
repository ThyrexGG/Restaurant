import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const items = await prisma.category.findMany();
  console.log(items.map(i => i.name));
}

run().catch(console.error).finally(() => prisma.$disconnect());
