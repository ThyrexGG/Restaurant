import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allItems = await prisma.menuItem.findMany();

  // Find Taro item
  const taroItem = allItems.find(i => i.name.toLowerCase().includes('taro'));
  if (taroItem) {
    console.log('Found Taro item:', taroItem.name);
    await prisma.menuItem.update({
      where: { id: taroItem.id },
      data: { image: '/images/taro-coconut-milk.webp' }
    });
  } else {
    console.log('No Taro item found in database');
  }

  // Clear Fresh Coconut image
  const freshCoconut = allItems.find(i => i.name === 'Fresh Coconut');
  if (freshCoconut) {
    await prisma.menuItem.update({
      where: { id: freshCoconut.id },
      data: { image: null }
    });
    console.log('Cleared Fresh Coconut image');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
