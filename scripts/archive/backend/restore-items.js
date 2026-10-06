// backend/restore-items.js
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

  // 1. Copy Rice.png to Breakfast folder
  const srcRice = path.resolve(root, 'backend/raw-images/Rice.png');
  const destBreakfastRice = path.resolve(root, 'frontend/public/images/Breakfast/Rice.png');
  const destBreakfastDir = path.dirname(destBreakfastRice);

  if (!fs.existsSync(destBreakfastDir)) {
    fs.mkdirSync(destBreakfastDir, { recursive: true });
  }
  if (fs.existsSync(srcRice)) {
    fs.copyFileSync(srcRice, destBreakfastRice);
    console.log('Copied Rice.png to Breakfast category.');
  }

  // 2. Read menu.json: Keep B58 (Rice) and remove G5
  if (fs.existsSync(menuPath)) {
    let menu = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));

    // Re-add B58 if missing
    const b58Exists = menu.some(i => i.SKU === 'B58');
    if (!b58Exists) {
      const b58Item = {
        "Handle": "rice",
        "SKU": "B58",
        "Name": "Rice",
        "Category": "Breakfast",
        "Description": "Flavorful Rice. A carefully prepared breakfast showcasing premium ingredients and balanced flavors. Guaranteed to satisfy your cravings.",
        "Sold by weight": "N",
        "Option 1 name": "",
        "Option 1 value": "",
        "Option 2 name": "",
        "Option 2 value": "",
        "Option 3 name": "",
        "Option 3 value": "",
        "Cost": "0",
        "Barcode": "",
        "SKU of included item": "",
        "Quantity of included item": "",
        "Track stock": "N",
        "Available for sale [Best Khmer (Golden Cafe) Restaurant]": "Y",
        "Price [Best Khmer (Golden Cafe) Restaurant]": "0.5",
        "In stock [Best Khmer (Golden Cafe) Restaurant]": "",
        "Low stock [Best Khmer (Golden Cafe) Restaurant]": "",
        "Cloudinary_ID": "",
        "image": "/images/Breakfast/Rice.png"
      };
      menu.push(b58Item);
      console.log('Restored B58 (Rice) to menu.json with Rice.png image.');
    } else {
      const b58 = menu.find(i => i.SKU === 'B58');
      b58.image = '/images/Breakfast/Rice.png';
      console.log('Updated image of existing B58 (Rice) to Rice.png.');
    }

    // Filter out G5
    const beforeCount = menu.length;
    menu = menu.filter(item => item.SKU !== 'G5');
    console.log(`Filtered menu.json: removed G5 (Items count: ${beforeCount} -> ${menu.length})`);

    fs.writeFileSync(menuPath, JSON.stringify(menu, null, 4), 'utf-8');
  }

  // 3. Database operations
  console.log('Updating database...');
  
  // Find category ID for Breakfast
  const breakfastCategory = await prisma.category.findFirst({
    where: { name: 'Breakfast' }
  });

  if (breakfastCategory) {
    const dbItem = await prisma.menuItem.findFirst({
      where: { sku: 'B58' }
    });
    if (dbItem) {
      await prisma.menuItem.update({
        where: { id: dbItem.id },
        data: {
          name: 'Rice',
          price: 0.5,
          image: '/images/Breakfast/Rice.png',
          categoryId: breakfastCategory.id
        }
      });
      console.log('Updated existing B58 (Rice) in database.');
    } else {
      await prisma.menuItem.create({
        data: {
          sku: 'B58',
          name: 'Rice',
          price: 0.5,
          image: '/images/Breakfast/Rice.png',
          categoryId: breakfastCategory.id
        }
      });
      console.log('Created B58 (Rice) in database.');
    }
  }

  // Delete G5 from DB
  const deleted = await prisma.menuItem.deleteMany({
    where: { sku: 'G5' }
  });
  console.log(`Deleted ${deleted.count} record(s) matching G5.`);

  console.log('Database synced successfully.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
