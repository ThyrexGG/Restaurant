// backend/remove-tomyum-image.js
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
    const item = menu.find(i => i.SKU === 's8');
    if (item) {
      item.image = '';
      console.log(`Cleared image path for SKU s8 (${item.Name}) in menu.json.`);
    }
    fs.writeFileSync(menuPath, JSON.stringify(menu, null, 4), 'utf-8');
  }

  // 2. Update database
  console.log('Connecting to database to clear image for SKU s8...');
  const updated = await prisma.menuItem.updateMany({
    where: { sku: 's8' },
    data: { image: null }
  });
  console.log(`Updated database records for SKU s8: cleared image path.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
