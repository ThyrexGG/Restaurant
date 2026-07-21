import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  // First, find or create the "Addons" category
  let addonCategory = await prisma.category.findFirst({ where: { name: 'Addons' } });
  if (!addonCategory) {
    addonCategory = await prisma.category.create({ data: { name: 'Addons' } });
  }

  // Update specific items to belong to the Addons category
  const updated = await prisma.menuItem.updateMany({
    where: {
      OR: [
        { name: { contains: 'Avocado', mode: 'insensitive' } },
        { name: { contains: 'Cheese', mode: 'insensitive' } },
        { name: { contains: 'Egg', mode: 'insensitive' } },
        { name: { contains: 'Extra', mode: 'insensitive' } }
      ],
      price: { lte: 3.00 } // only move cheap side items
    },
    data: {
      categoryId: addonCategory.id
    }
  });

  console.log(`Moved ${updated.count} items to the Addons category.`);
}

run().finally(() => prisma.$disconnect());
