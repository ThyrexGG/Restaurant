// backend/delete-add5.js
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

  // 1. Update JSON files
  const files = [menuPath, backupPath];
  files.forEach(f => {
    if (fs.existsSync(f)) {
      let menu = JSON.parse(fs.readFileSync(f, 'utf-8'));
      const beforeCount = menu.length;

      // Filter out ADD5
      menu = menu.filter(item => item.SKU !== 'ADD5');

      fs.writeFileSync(f, JSON.stringify(menu, null, 4), 'utf-8');
      console.log(`Updated ${path.basename(f)}: removed ADD5 (Items count: ${beforeCount} -> ${menu.length})`);
    }
  });

  // 2. Delete from database
  console.log('Deleting ADD5 from database...');
  const deleted = await prisma.menuItem.deleteMany({
    where: { sku: 'ADD5' }
  });
  console.log(`Deleted ${deleted.count} record(s) matching ADD5 from database.`);

  console.log('Database synced successfully.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
