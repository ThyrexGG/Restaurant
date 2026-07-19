import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const generatedImgPath = 'C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\4c6912f5-3ccf-42f7-a3c2-a6816a145fb8';
  
  // Find the exact generated filename
  const files = fs.readdirSync(generatedImgPath);
  const eggImg = files.find(f => f.startsWith('egg_burger_with_cheese') && f.endsWith('.png'));
  
  if (!eggImg) {
    console.log('Could not find generated egg burger image!');
    return;
  }
  
  const sourcePath = path.join(generatedImgPath, eggImg);
  const destPath = path.join(process.cwd(), '..', 'frontend', 'public', 'images', 'egg-burger-with-cheese.png');
  
  fs.copyFileSync(sourcePath, destPath);
  console.log('Copied image to frontend public directory!');
  
  await prisma.menuItem.updateMany({
    where: { name: 'Egg Burger with Cheese' },
    data: { image: '/images/egg-burger-with-cheese.png' }
  });
  
  console.log('Updated DB mapping for Egg Burger with Cheese');
}

main().catch(console.error).finally(() => prisma.$disconnect());
