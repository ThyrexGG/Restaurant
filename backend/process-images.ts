import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RAW_DIR = path.join(process.cwd(), 'raw-images');
const OUT_DIR = path.join(process.cwd(), '../frontend/public/images');

async function processImages() {
  console.log('Starting image compression and database sync...');
  
  try {
    // Ensure output directory exists
    await fs.mkdir(OUT_DIR, { recursive: true });
    
    // Read raw images
    const files = await fs.readdir(RAW_DIR);
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));
    
    if (imageFiles.length === 0) {
      console.log('No images found in backend/raw-images/. Please drop some images there first!');
      return;
    }
    
    let processedCount = 0;
    let matchedCount = 0;
    
    for (const file of imageFiles) {
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      
      const outFileName = `${baseName.replace(/\s+/g, '-').toLowerCase()}.webp`;
      const outFilePath = path.join(OUT_DIR, outFileName);
      
      // Compress and convert to webp
      await sharp(path.join(RAW_DIR, file))
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outFilePath);
        
      console.log(`\n✅ Compressed: ${file} -> ${outFileName}`);
      processedCount++;
      
      // Look for a menu item with a similar name in the database
      // Using a basic case-insensitive exact match first
      const items = await prisma.menuItem.findMany();
      const matchedItem = items.find(item => item.name.toLowerCase() === baseName.toLowerCase());
      
      if (matchedItem) {
        // Update database with new image path
        await prisma.menuItem.update({
          where: { id: matchedItem.id },
          data: { image: `/images/${outFileName}` }
        });
        console.log(`🔗 Linked image to menu item: ${matchedItem.name}`);
        matchedCount++;
      } else {
        console.log(`⚠️  Could not find a menu item matching the exact name: "${baseName}"`);
      }
    }
    
    console.log(`\n🎉 Finished! Compressed ${processedCount} images and linked ${matchedCount} to the database.`);
    console.log('You can now check the website, the images should load instantly!');
    
  } catch (error) {
    console.error('Error processing images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

processImages();
