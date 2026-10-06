// backend/fix-s6-image.js
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
  const backupPath = path.resolve(root, 'frontend/src/assets/menu_backup.json');

  // Copy sweet & Sour pineaaple.png to Soup folder
  const srcImg = path.resolve(root, 'backend/raw-images/Random/sweet & Sour pineaaple.png');
  const destImg = path.resolve(root, 'frontend/public/images/Soup/sweet & Sour pineaaple.png');
  const destDir = path.dirname(destImg);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(srcImg)) {
    fs.copyFileSync(srcImg, destImg);
    console.log('Copied sweet & Sour pineaaple.png to Soup directory.');
  }

  // Update JSON files
  const files = [menuPath, backupPath];
  files.forEach(f => {
    if (fs.existsSync(f)) {
      const menu = JSON.parse(fs.readFileSync(f, 'utf-8'));
      const s6 = menu.find(item => item.SKU === 's6');
      if (s6) {
        s6.image = '/images/Soup/sweet & Sour pineaaple.png';
        console.log(`Updated s6 image in ${path.basename(f)}`);
      }
      fs.writeFileSync(f, JSON.stringify(menu, null, 4), 'utf-8');
    }
  });

  // Update Database
  const dbItem = await prisma.menuItem.findFirst({
    where: { sku: 's6' }
  });

  if (dbItem) {
    await prisma.menuItem.update({
      where: { id: dbItem.id },
      data: {
        image: '/images/Soup/sweet & Sour pineaaple.png'
      }
    });
    console.log('Updated s6 image in database.');
  }

  console.log('Successfully completed.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
