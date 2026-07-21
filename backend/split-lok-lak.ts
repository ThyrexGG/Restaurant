import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const item = await prisma.menuItem.findFirst({
    where: { name: { contains: 'English Lok lak' } }
  });

  if (!item) {
    console.log("Item not found");
    return;
  }

  console.log("Found item:", item);

  // Update existing item to Beef
  await prisma.menuItem.update({
    where: { id: item.id },
    data: {
      name: 'English Lok lak (Beef)',
      description: item.description ? item.description.replace('Choice of: Beef, Chicken', 'Beef') : null
    }
  });
  console.log("Updated existing item to Beef");

  // Create new item for Chicken
  await prisma.menuItem.create({
    data: {
      name: 'English Lok lak (Chicken)',
      description: item.description ? item.description.replace('Choice of: Beef, Chicken', 'Chicken') : null,
      price: 4.00,
      image: item.image,
      imagePosition: item.imagePosition,
      availability: item.availability,
      preparationTime: item.preparationTime,
      calories: item.calories,
      categoryId: item.categoryId,
      sku: item.sku ? item.sku + 'C' : null // e.g. G17C
    }
  });
  console.log("Created new item for Chicken");
}

run().catch(console.error).finally(() => prisma.$disconnect());
