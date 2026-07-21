import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const roastBeef = await prisma.menuItem.findUnique({
    where: { id: '4ee8b3df-744d-428f-8fb4-121ad7b84af4' }
  });

  const chickenPasta = await prisma.menuItem.findUnique({
    where: { id: 'bb4167cb-014c-400b-a685-50b6ff75817f' }
  });

  if (roastBeef) {
    await prisma.menuItem.updateMany({
      where: { name: 'Roast Chicken on Strip' },
      data: { image: roastBeef.image }
    });
    console.log("Updated Roast Chicken on Strip image.");
  }

  if (chickenPasta) {
    await prisma.menuItem.updateMany({
      where: { name: 'Fish Pasta' },
      data: { image: chickenPasta.image }
    });
    console.log("Updated Fish Pasta image.");
  }
}

run().finally(() => prisma.$disconnect());
