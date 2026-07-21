import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const item = await prisma.menuItem.findFirst({
    where: { sku: 'G18' }
  });

  if (!item) {
    console.log("Item not found");
    return;
  }

  console.log("Found item:", item.name);

  // Create new item for Beef
  await prisma.menuItem.create({
    data: {
      name: item.name.replace('Chicken', 'Beef'),
      description: item.description,
      price: 4.50,
      image: item.image,
      imagePosition: item.imagePosition,
      availability: item.availability,
      preparationTime: item.preparationTime,
      calories: item.calories,
      categoryId: item.categoryId,
      sku: 'G18B' // G18 for Chicken, G18B for Beef
    }
  });
  console.log("Created new item for Beef");
}

run().catch(console.error).finally(() => prisma.$disconnect());
