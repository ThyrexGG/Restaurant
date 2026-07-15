import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.menuItem.findMany({
  where: {
    name: { contains: 'fries', mode: 'insensitive' }
  }
}).then(res => {
  console.log('Fries Items:', res.map(i => i.name));
});
