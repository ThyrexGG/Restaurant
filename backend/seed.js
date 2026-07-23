const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');
  const menuPath = path.join(__dirname, '../frontend/src/assets/menu.json');
  const rawData = fs.readFileSync(menuPath, 'utf-8');
  const menuData = JSON.parse(rawData);
  
  let itemsAdded = 0;
  
  for (let i = 0; i < menuData.length; i++) {
    const item = menuData[i];
    if (!item.Name) continue;
    
    const categoryName = item.Category || 'Uncategorized';
    let category = await prisma.category.findFirst({ where: { name: categoryName } });
    
    if (!category) {
      category = await prisma.category.create({ data: { name: categoryName } });
    }
    
    const priceValue = Number(item['Price [Best Khmer (Golden Cafe) Restaurant]']) || 5.00;
    
    const existingItem = await prisma.menuItem.findFirst({ where: { name: item.Name } });
    if (!existingItem) {
      await prisma.menuItem.create({
        data: {
          name: item.Name,
          description: item.Description,
          price: priceValue,
          image: item.image || item.Cloudinary_ID || null,
          categoryId: category.id,
        }
      });
      itemsAdded++;
      console.log(`Added ${item.Name} (${i+1}/${menuData.length})`);
    }
  }
  console.log(`\nFinished! Added ${itemsAdded} missing items.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
