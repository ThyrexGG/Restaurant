import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImages() {
  const items = await prisma.menuItem.findMany();
  let withImage = 0;
  
  items.forEach(item => {
    if (item.image && item.image.trim() !== '') {
      withImage++;
    }
  });
  
  const total = items.length;
  const withoutImage = total - withImage;
  const percentage = ((withImage / total) * 100).toFixed(2);
  
  console.log(`Total Menu Items: ${total}`);
  console.log(`Items WITH an image: ${withImage}`);
  console.log(`Items WITHOUT an image: ${withoutImage}`);
  console.log(`Percentage Filled: ${percentage}%`);
}

checkImages()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
