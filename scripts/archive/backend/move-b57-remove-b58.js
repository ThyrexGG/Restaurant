// backend/move-b57-remove-b58.js
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

  // 1. Copy image for B57 to Addons and delete old
  const oldImgPath = path.resolve(root, 'frontend/public/images/Breakfast/fried egg hotdog and bread.png');
  const newImgDir = path.resolve(root, 'frontend/public/images/Addons');
  const newImgPath = path.resolve(newImgDir, 'fried egg hotdog and bread.png');

  if (!fs.existsSync(newImgDir)) {
    fs.mkdirSync(newImgDir, { recursive: true });
  }

  if (fs.existsSync(oldImgPath)) {
    fs.copyFileSync(oldImgPath, newImgPath);
    console.log('Copied fried egg image to Addons folder.');
    fs.unlinkSync(oldImgPath);
    console.log('Deleted old fried egg image from Breakfast folder.');
  }

  // 2. Update menu.json and menu_backup.json
  const files = [menuPath, backupPath];
  files.forEach(f => {
    if (fs.existsSync(f)) {
      let menu = JSON.parse(fs.readFileSync(f, 'utf-8'));
      const beforeCount = menu.length;

      // Remove B58
      menu = menu.filter(item => item.SKU !== 'B58');

      // Update B57 -> ADD7
      const b57 = menu.find(item => item.SKU === 'B57');
      if (b57) {
        b57.SKU = 'ADD7';
        b57.Category = 'Addons';
        b57.image = '/images/Addons/fried egg hotdog and bread.png';
        console.log(`Updated SKU B57 to ADD7 and moved to Addons in: ${path.basename(f)}`);
      }

      fs.writeFileSync(f, JSON.stringify(menu, null, 4), 'utf-8');
      console.log(`Saved ${path.basename(f)} (Items count: ${beforeCount} -> ${menu.length})`);
    }
  });

  // 3. Database operations
  console.log('Updating database...');
  
  // Find Addons category
  const addonsCategory = await prisma.category.findFirst({
    where: { name: 'Addons' }
  });

  if (!addonsCategory) {
    throw new Error('Addons category not found in database');
  }

  // Delete B58 from DB
  const deletedB58 = await prisma.menuItem.deleteMany({
    where: { sku: 'B58' }
  });
  console.log(`Deleted B58 from database (Count: ${deletedB58.count}).`);

  // Update B57 -> ADD7
  const b57Db = await prisma.menuItem.findFirst({
    where: { sku: 'B57' }
  });

  if (b57Db) {
    await prisma.menuItem.update({
      where: { id: b57Db.id },
      data: {
        sku: 'ADD7',
        categoryId: addonsCategory.id,
        image: '/images/Addons/fried egg hotdog and bread.png'
      }
    });
    console.log('Updated SKU B57 to ADD7 under Addons category in database.');
  } else {
    // If not found by SKU, find by name "Fried Egg"
    const friedEggDb = await prisma.menuItem.findFirst({
      where: { name: 'Fried Egg' }
    });
    if (friedEggDb) {
      await prisma.menuItem.update({
        where: { id: friedEggDb.id },
        data: {
          sku: 'ADD7',
          categoryId: addonsCategory.id,
          image: '/images/Addons/fried egg hotdog and bread.png'
        }
      });
      console.log('Updated Fried Egg (found by Name) to ADD7 in database.');
    }
  }

  console.log('Database synced successfully.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
