// backend/update-rice-image.js
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

  // Copy Rice.png and delete old White Rice.png
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

  // Update menu.json
  if (fs.existsSync(menuPath)) {
    let menu = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
    const item = menu.find(i => i.SKU === 'ADD2');
    if (item) {
      item.image = '/images/Addons/Rice.png';
      console.log(`Updated SKU ADD2 to ${item.image} in menu.json.`);
    }
    fs.writeFileSync(menuPath, JSON.stringify(menu, null, 4), 'utf-8');
  }

  // Update database
  console.log('Updating database record for SKU ADD2...');
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
