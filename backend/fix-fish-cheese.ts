import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const publicDir = path.join(process.cwd(), '..', 'frontend', 'public', 'images');
  
  const chickenCheese = path.join(publicDir, 'crispy-chicken-burger-with-cheese.webp');
  const fishCheese = path.join(publicDir, 'crispy-fish-burger-with-cheese.webp');

  if (fs.existsSync(chickenCheese)) {
    fs.copyFileSync(chickenCheese, fishCheese);
    console.log('Copied crispy-chicken-burger-with-cheese to crispy-fish-burger-with-cheese!');
  } else {
    console.log('Could not find crispy-chicken-burger-with-cheese.webp');
  }

  await prisma.menuItem.updateMany({
    where: { name: 'Crispy Fish Burger with Cheese' },
    data: { image: '/images/crispy-fish-burger-with-cheese.webp' }
  });
  
  console.log('Updated DB mapping for Crispy Fish Burger with Cheese');
}

main().catch(console.error).finally(() => prisma.$disconnect());
