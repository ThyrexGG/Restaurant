import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const categories = await prisma.category.findMany();
  console.log(categories.map(c => c.name));
}

run().finally(() => prisma.$disconnect());
