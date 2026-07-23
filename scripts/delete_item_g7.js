// scripts/delete_item_g7.js
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const root = path.resolve(__dirname, '..');
  const menuPath = path.resolve(root, 'frontend/src/assets/menu.json');

  // 1. Update menu.json
  if (fs.existsSync(menuPath)) {
    let menu = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
    const beforeCount = menu.length;
    menu = menu.filter(item => item.SKU !== 'G7' && item.Name !== 'Pork Lok Lak with Rice');
    fs.writeFileSync(menuPath, JSON.stringify(menu, null, 4), 'utf-8');
    console.log(`Filtered menu.json: removed G7 (Items count: ${beforeCount} -> ${menu.length})`);
  } else {
    console.log('menu.json not found');
  }

  // 2. Delete from Prisma Database
  console.log('Connecting to database to delete G7...');
  const deleted = await prisma.menuItem.deleteMany({
    where: {
      OR: [
        { sku: 'G7' },
        { name: 'Pork Lok Lak with Rice' }
      ]
    }
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
