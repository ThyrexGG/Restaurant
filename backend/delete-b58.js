// backend/delete-b58.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  const menuPath = path.resolve(__dirname, '../frontend/src/assets/menu.json');

  // 1. Update menu.json
  if (fs.existsSync(menuPath)) {
    let menu = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
    const beforeCount = menu.length;
    menu = menu.filter(item => item.SKU !== 'B58');
    fs.writeFileSync(menuPath, JSON.stringify(menu, null, 4), 'utf-8');
    console.log(`Filtered menu.json: removed B58 (Items count: ${beforeCount} -> ${menu.length})`);
  } else {
    console.log('menu.json not found');
  }

  // 2. Delete from database
  console.log('Connecting to database to delete B58...');
  const deleted = await prisma.menuItem.deleteMany({
    where: { sku: 'B58' }
  });
  console.log(`Deleted ${deleted.count} item(s) from MenuItem database table.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
