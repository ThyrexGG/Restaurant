// backend/remove-vf23.js
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

  // 1. Update menu.json and menu_backup.json
  const files = [menuPath, backupPath];
  files.forEach(f => {
    if (fs.existsSync(f)) {
      let menu = JSON.parse(fs.readFileSync(f, 'utf-8'));
      const beforeCount = menu.length;

      // Filter out VF23
      menu = menu.filter(item => item.SKU !== 'VF23');

      fs.writeFileSync(f, JSON.stringify(menu, null, 4), 'utf-8');
      console.log(`Updated ${path.basename(f)}: removed VF23 (Items count: ${beforeCount} -> ${menu.length})`);
    }
  });

  // 2. Delete from database
  console.log('Deleting VF23 from database...');
  const deleted = await prisma.menuItem.deleteMany({
    where: { sku: 'VF23' }
  });
  console.log(`Deleted ${deleted.count} record(s) matching VF23 from database.`);

  console.log('Database synced successfully.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
