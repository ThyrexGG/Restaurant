import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.menuItem.findMany({
  where: {
    name: { contains: 'Burger', mode: 'insensitive' }
  }
}).then(res => {
  console.log('Burger Items:', res.map(i => i.name));
});
