// backend/unlink-extra-bacon.js
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
      const menu = JSON.parse(fs.readFileSync(f, 'utf-8'));
      const add5 = menu.find(item => item.SKU === 'ADD5');
      if (add5) {
        add5.image = '';
        console.log(`Cleared image path of ADD5 (Extra Bacon) in ${path.basename(f)}`);
      }
      fs.writeFileSync(f, JSON.stringify(menu, null, 4), 'utf-8');
    }
  });

  // 2. Update Database
  const dbItem = await prisma.menuItem.findFirst({
    where: { sku: 'ADD5' }
  });

  if (dbItem) {
    await prisma.menuItem.update({
      where: { id: dbItem.id },
      data: {
        image: null
      }
    });
    console.log('Cleared image of ADD5 (Extra Bacon) in database.');
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
