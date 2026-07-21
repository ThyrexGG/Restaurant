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
    await prisma.menuItem.create({
      data: {
        name: 'Roast Chicken on Strip',
        description: roastBeef.description,
        price: 3.5,
        categoryId: roastBeef.categoryId,
        availability: true,
      }
    });
    console.log("Added Roast Chicken on Strip");
  }

  if (chickenPasta) {
    await prisma.menuItem.create({
      data: {
        name: 'Fish Pasta',
        description: chickenPasta.description,
        price: 3.5, // assuming same price as chicken pasta
        categoryId: chickenPasta.categoryId,
        availability: true,
      }
    });
    console.log("Added Fish Pasta");
  }
}

run().finally(() => prisma.$disconnect());
