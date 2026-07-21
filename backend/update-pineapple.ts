import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  await prisma.menuItem.update({
    where: { id: '9d769a7c-a5ba-4b49-bd39-85c55a418d7c' },
    data: { name: 'Pineapple Fried Rice Cashew Nut (Chicken/Pork/Tofu)' }
  });

  await prisma.menuItem.update({
    where: { id: '9d86b3d4-1420-4c67-a1c2-b9db990b8546' },
    data: { name: 'Pineapple Fried Rice (Chicken/Pork/Tofu)' }
  });

  console.log("Updated Pineapple Fried Rice items.");
}

run().finally(() => prisma.$disconnect());
