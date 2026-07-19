import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.menuItem.findMany();
  
  const missing = items.filter(i => !i.image || i.image === '');
  console.log('Missing images in DB:', missing.map(i => i.name));

  const files = fs.readdirSync('../frontend/public/images');
  console.log('\nAll images in folder:', files.length);

  const usedImages = items.map(i => i.image?.replace('/images/', '')).filter(Boolean);
  const unused = files.filter(f => !usedImages.includes(f) && !f.startsWith('gemini'));
  console.log('\nUnused images:', unused);
}

main().catch(console.error).finally(() => prisma.$disconnect());
