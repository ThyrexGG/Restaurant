// backend/process-5-new-images.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const mappings = [
  {
    sku: 'VF5',
    src: 'backend/raw-images/vf5.jpg',
    dest: 'frontend/public/images/Vegetarian Food/vf5.jpg',
    dbPath: '/images/Vegetarian Food/vf5.jpg'
  },
  {
    sku: 'VF9',
    src: 'backend/raw-images/vf9.jpg',
    dest: 'frontend/public/images/Vegetarian Food/vf9.jpg',
    dbPath: '/images/Vegetarian Food/vf9.jpg'
  },
  {
    sku: 'VF11',
    src: 'backend/raw-images/vf11.jpg',
    dest: 'frontend/public/images/Vegetarian Food/vf11.jpg',
    dbPath: '/images/Vegetarian Food/vf11.jpg'
  },
  {
    sku: 'VF12',
    src: 'backend/raw-images/vf12.jpg',
    dest: 'frontend/public/images/Vegetarian Food/vf12.jpg',
    dbPath: '/images/Vegetarian Food/vf12.jpg'
  },
  {
    sku: 'D23',
    src: 'backend/raw-images/Brown Sugar Fresh Milk with pearl.jpg',
    dest: 'frontend/public/images/Iced Drink/Brown Sugar Fresh Milk with pearl.jpg',
    dbPath: '/images/Iced Drink/Brown Sugar Fresh Milk with pearl.jpg'
  }
];

async function main() {
  const root = path.resolve(__dirname, '..');
  const menuPath = path.resolve(root, 'frontend/src/assets/menu.json');
  const backupPath = path.resolve(root, 'frontend/src/assets/menu_backup.json');

  // 1. Copy files
  mappings.forEach(m => {
    const srcPath = path.resolve(root, m.src);
    const destPath = path.resolve(root, m.dest);
    const destDir = path.dirname(destPath);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${path.basename(m.src)} to ${m.dest}`);
    } else {
      console.warn(`Source file not found: ${m.src}`);
    }
  });

  // 2. Update JSON files
  const files = [menuPath, backupPath];
  files.forEach(f => {
    if (fs.existsSync(f)) {
      const menu = JSON.parse(fs.readFileSync(f, 'utf-8'));
      let matchCount = 0;
      mappings.forEach(m => {
        const item = menu.find(i => i.SKU === m.sku);
        if (item) {
          item.image = m.dbPath;
          matchCount++;
        }
      });
      fs.writeFileSync(f, JSON.stringify(menu, null, 4), 'utf-8');
      console.log(`Updated ${matchCount} image paths in ${path.basename(f)}`);
    }
  });

  // 3. Update Database
  console.log('Updating database...');
  for (const m of mappings) {
    const dbItem = await prisma.menuItem.findFirst({
      where: { sku: m.sku }
    });

    if (dbItem) {
      await prisma.menuItem.update({
        where: { id: dbItem.id },
        data: {
          image: m.dbPath
        }
      });
      console.log(`Updated database image link for SKU: ${m.sku}`);
    } else {
      console.warn(`SKU not found in DB: ${m.sku}`);
    }
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
