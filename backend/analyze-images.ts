import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const RAW_DIR = path.join(process.cwd(), 'raw-images');

async function analyze() {
  console.log('--- Image & Database Analysis ---');
  
  // 1. Get all menu items
  const items = await prisma.menuItem.findMany();
  
  // 2. Find duplicates in database by name
  const nameCounts = new Map<string, number>();
  for (const item of items) {
    const lower = item.name.toLowerCase();
    nameCounts.set(lower, (nameCounts.get(lower) || 0) + 1);
  }
  
  const duplicates = Array.from(nameCounts.entries()).filter(([name, count]) => count > 1);
  console.log(`\nFound ${duplicates.length} duplicate dish names in the database:`);
  for (const [name, count] of duplicates) {
    console.log(`- "${name}" appears ${count} times`);
  }

  // 3. Find menu items that do NOT have an image linked
  const missingImages = items.filter(item => !item.image);
  console.log(`\nFound ${missingImages.length} menu items with NO image linked:`);
  const missingNames = missingImages.map(i => i.name).sort();
  for (let i = 0; i < Math.min(20, missingNames.length); i++) {
    console.log(`- ${missingNames[i]}`);
  }
  if (missingNames.length > 20) {
    console.log(`  ... and ${missingNames.length - 20} more`);
  }

  // 4. Find raw images that did not perfectly match a database name
  try {
    const files = await fs.readdir(RAW_DIR);
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp|avif|jfif)$/i.test(f));
    
    const unlinkedImages = [];
    for (const file of imageFiles) {
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      
      const exactMatch = items.some(item => item.name.toLowerCase() === baseName.toLowerCase());
      if (!exactMatch) {
        unlinkedImages.push(file);
      }
    }
    
    console.log(`\nFound ${unlinkedImages.length} raw images that did NOT match any dish exactly:`);
    for (let i = 0; i < Math.min(20, unlinkedImages.length); i++) {
      console.log(`- ${unlinkedImages[i]}`);
    }
    if (unlinkedImages.length > 20) {
      console.log(`  ... and ${unlinkedImages.length - 20} more`);
    }
  } catch (err) {
    console.log('Error reading raw-images dir');
  }

}

analyze().catch(console.error).finally(() => prisma.$disconnect());
