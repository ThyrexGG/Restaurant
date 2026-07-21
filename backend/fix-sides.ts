import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const addonCategory = await prisma.category.findFirst({ where: { name: 'Addons' } });
  if (!addonCategory) {
    console.log("Addons category not found!");
    return;
  }

  // Update Rice to White Rice and move to Addons
  const rice = await prisma.menuItem.findFirst({ where: { name: 'Rice' } });
  if (rice) {
    await prisma.menuItem.update({
      where: { id: rice.id },
      data: { name: 'White Rice', categoryId: addonCategory.id }
    });
    console.log("Updated Rice to White Rice and moved to Addons");
  }

}

run().finally(() => prisma.$disconnect());
