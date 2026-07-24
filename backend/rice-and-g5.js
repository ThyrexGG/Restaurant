// backend/rice-and-g5.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  const root = path.resolve(__dirname, '..');
  const menuPath = path.resolve(root, 'frontend/src/assets/menu.json');

  // 1. Copy Rice.png and delete old White Rice.png
  const src = path.resolve(root, 'backend/raw-images/Rice.png');
  const dest = path.resolve(root, 'frontend/public/images/Addons/Rice.png');
  const oldDest = path.resolve(root, 'frontend/public/images/Addons/White Rice.png');

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('Copied Rice.png to Addons category.');
  }
  if (fs.existsSync(oldDest)) {
    fs.unlinkSync(oldDest);
    console.log('Deleted old White Rice.png from Addons.');
  }

  // 2. Remove duplicate item G5 and update ADD2 (White Rice) in menu.json
  if (fs.existsSync(menuPath)) {
    let menu = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
    const beforeCount = menu.length;

    // Filter out G5
    menu = menu.filter(item => item.SKU !== 'G5');

    // Update ADD2
    const add2 = menu.find(i => i.SKU === 'ADD2');
    if (add2) {
      add2.image = '/images/Addons/Rice.png';
      console.log('Updated SKU ADD2 to use /images/Addons/Rice.png in menu.json.');
    }

    fs.writeFileSync(menuPath, JSON.stringify(menu, null, 4), 'utf-8');
    console.log(`Filtered menu.json: removed duplicate SKU G5 (Items count: ${beforeCount} -> ${menu.length})`);
  }

  // 3. Update database
  console.log('Updating database for G5 and ADD2...');
  // Delete G5
  const deleted = await prisma.menuItem.deleteMany({
    where: { sku: 'G5' }
  });
  console.log(`Deleted ${deleted.count} record(s) matching G5.`);

  // Update ADD2
  await prisma.menuItem.updateMany({
    where: { sku: 'ADD2' },
    data: { image: '/images/Addons/Rice.png' }
  });
  console.log('Database synced successfully.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
