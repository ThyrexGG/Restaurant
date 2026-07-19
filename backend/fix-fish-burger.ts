import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const unusedChickenBurger = path.join(process.cwd(), 'unused-images', 'crispy-chicken-burger.webp');
  const newFishBurgerPath = path.join(process.cwd(), '..', 'frontend', 'public', 'images', 'crispy-fish-burger.webp');

  // Copy image over
  if (fs.existsSync(unusedChickenBurger)) {
    fs.copyFileSync(unusedChickenBurger, newFishBurgerPath);
    console.log('Copied crispy-chicken-burger to crispy-fish-burger!');
  } else {
    console.log('Could not find crispy-chicken-burger in unused-images folder!');
    return;
  }

  // Map to DB
  await prisma.menuItem.updateMany({
    where: { 
      OR: [
        { name: 'Crispy Fish Burger' },
        { name: 'Crispy Fish Burger with Cheese' }
      ]
    },
    data: { image: '/images/crispy-fish-burger.webp' }
  });
  
  console.log('Updated DB mappings for Fish Burgers');
}

main().catch(console.error).finally(() => prisma.$disconnect());
