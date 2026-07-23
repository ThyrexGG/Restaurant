import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const item = await prisma.menuItem.findFirst({ where: { sku: 'F5' } });
  console.log('F5 DB record image:', item.image);
}

check().then(() => prisma.$disconnect());
