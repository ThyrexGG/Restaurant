import fs from 'fs';
import path from 'path';

async function main() {
  const unusedImagesDir = path.join(process.cwd(), 'unused-images');
  
  if (!fs.existsSync(unusedImagesDir)) {
    console.log('unused-images dir not found');
    return;
  }
  
  const allFiles = fs.readdirSync(unusedImagesDir);
  
  let deletedCount = 0;
  for (const file of allFiles) {
    if (file.includes('-2.webp') || file.includes('-(2).webp') || file.startsWith('gemini')) {
      fs.unlinkSync(path.join(unusedImagesDir, file));
      deletedCount++;
      console.log(`Deleted: ${file}`);
    }
  }
  
  console.log(`\nPermanently deleted ${deletedCount} duplicate/AI images from unused-images folder.`);
}

main().catch(console.error);
