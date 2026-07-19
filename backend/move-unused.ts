import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.menuItem.findMany();
  
  const usedImages = items
    .map(i => i.image?.replace('/images/', ''))
    .filter(Boolean) as string[];
    
  const publicImagesDir = path.join(process.cwd(), '..', 'frontend', 'public', 'images');
  const unusedImagesDir = path.join(process.cwd(), 'unused-images');
  
  if (!fs.existsSync(unusedImagesDir)) {
    fs.mkdirSync(unusedImagesDir, { recursive: true });
  }
  
  const allFiles = fs.readdirSync(publicImagesDir);
  
  let movedCount = 0;
  for (const file of allFiles) {
    // skip directories or non-image files if any
    const fullPath = path.join(publicImagesDir, file);
    if (!fs.statSync(fullPath).isFile()) continue;
    
    // If the file is not used by any menu item, move it
    if (!usedImages.includes(file)) {
      const destPath = path.join(unusedImagesDir, file);
      fs.renameSync(fullPath, destPath);
      movedCount++;
      console.log(`Moved: ${file}`);
    }
  }
  
  console.log(`\nSuccessfully moved ${movedCount} unused images to 'backend/unused-images' folder.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
