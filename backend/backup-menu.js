// backend/backup-menu.js
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

  console.log('Fetching latest menu items from database...');
  const dbItems = await prisma.menuItem.findMany({
    include: { category: true }
  });

  if (!fs.existsSync(menuPath)) {
    console.log('menu.json not found, creating a new one.');
    fs.writeFileSync(menuPath, '[]', 'utf-8');
  }

  let menu = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
  console.log(`Current local menu.json count: ${menu.length}`);
  console.log(`Database items count: ${dbItems.length}`);

  let updatedCount = 0;

  // Update existing items in menu.json with values from database
  menu.forEach(item => {
    const sku = item.SKU ? item.SKU.trim() : null;
    const name = item.Name ? item.Name.trim() : null;

    let dbItem = null;
    if (sku) dbItem = dbItems.find(i => i.sku === sku);
    if (!dbItem && name) dbItem = dbItems.find(i => i.name === name);

    if (dbItem) {
      item.Name = dbItem.name;
      item.Description = dbItem.description || '';
      item['Price [Best Khmer (Golden Cafe) Restaurant]'] = String(dbItem.price);
      item.image = dbItem.image || '';
      item.availability = dbItem.availability;
      updatedCount++;
    }
  });

  // Re-write menu.json
  fs.writeFileSync(menuPath, JSON.stringify(menu, null, 4), 'utf-8');
  console.log(`Saved updated menu.json (${updatedCount} items synchronized from DB).`);

  // Create dedicated backup file
  fs.writeFileSync(backupPath, JSON.stringify(menu, null, 4), 'utf-8');
  console.log(`Created dedicated backup at: ${backupPath}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
