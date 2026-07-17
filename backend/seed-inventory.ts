import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const initialIngredients = [
    // Meat
    { name: 'Beef', khmerName: 'សាច់គោ', category: 'Meat', quantity: 5, unit: 'kg', lowWarning: 2, status: 'IN_STOCK' },
    { name: 'Chicken', khmerName: 'សាច់មាន់', category: 'Meat', quantity: 10, unit: 'kg', lowWarning: 3, status: 'IN_STOCK' },
    { name: 'Pork', khmerName: 'សាច់ជ្រូក', category: 'Meat', quantity: 5, unit: 'kg', lowWarning: 2, status: 'IN_STOCK' },
    { name: 'Fish', khmerName: 'សាច់ត្រី', category: 'Meat', quantity: 3, unit: 'kg', lowWarning: 1, status: 'IN_STOCK' },
    { name: 'Shrimp', khmerName: 'បង្គា', category: 'Meat', quantity: 2, unit: 'kg', lowWarning: 1, status: 'IN_STOCK' },
    
    // Vegetables
    { name: 'Morning Glory', khmerName: 'ត្រកួន', category: 'Vegetable', quantity: 5, unit: 'kg', lowWarning: 1, status: 'IN_STOCK' },
    { name: 'Bok Choy', khmerName: 'ស្ពៃតឿ', category: 'Vegetable', quantity: 3, unit: 'kg', lowWarning: 1, status: 'IN_STOCK' },
    { name: 'Broccoli', khmerName: 'ខាត់ណាខៀវ', category: 'Vegetable', quantity: 3, unit: 'kg', lowWarning: 1, status: 'IN_STOCK' },
    { name: 'Onion', khmerName: 'ខ្ទឹមបារាំង', category: 'Vegetable', quantity: 5, unit: 'kg', lowWarning: 2, status: 'IN_STOCK' },
    { name: 'Garlic', khmerName: 'ខ្ទឹមស', category: 'Vegetable', quantity: 2, unit: 'kg', lowWarning: 0.5, status: 'IN_STOCK' },
    { name: 'Tomato', khmerName: 'ប៉េងប៉ោះ', category: 'Vegetable', quantity: 4, unit: 'kg', lowWarning: 1, status: 'IN_STOCK' },
    { name: 'Lemon', khmerName: 'ក្រូចឆ្មារ', category: 'Vegetable', quantity: 2, unit: 'kg', lowWarning: 0.5, status: 'IN_STOCK' },
    
    // Dry Goods & Sauces
    { name: 'Rice', khmerName: 'អង្ករ', category: 'Dry Goods', quantity: 50, unit: 'kg', lowWarning: 10, status: 'IN_STOCK' },
    { name: 'Cooking Oil', khmerName: 'ប្រេងឆា', category: 'Dry Goods', quantity: 10, unit: 'L', lowWarning: 2, status: 'IN_STOCK' },
    { name: 'Oyster Sauce', khmerName: 'ប្រេងខ្យង', category: 'Dry Goods', quantity: 5, unit: 'bottle', lowWarning: 1, status: 'IN_STOCK' },
    { name: 'Fish Sauce', khmerName: 'ទឹកត្រី', category: 'Dry Goods', quantity: 5, unit: 'bottle', lowWarning: 1, status: 'IN_STOCK' },
    { name: 'Sugar', khmerName: 'ស្ករស', category: 'Dry Goods', quantity: 5, unit: 'kg', lowWarning: 1, status: 'IN_STOCK' },
    { name: 'Salt', khmerName: 'អំបិល', category: 'Dry Goods', quantity: 3, unit: 'kg', lowWarning: 1, status: 'IN_STOCK' },
    
    // Drinks
    { name: 'Angkor Beer', khmerName: 'ស្រាបៀរអង្គរ', category: 'Drinks', quantity: 2, unit: 'case', lowWarning: 1, status: 'IN_STOCK' },
    { name: 'Coca Cola', khmerName: 'កូកាកូឡា', category: 'Drinks', quantity: 2, unit: 'case', lowWarning: 1, status: 'IN_STOCK' },
    { name: 'Water', khmerName: 'ទឹកបរិសុទ្ធ', category: 'Drinks', quantity: 5, unit: 'case', lowWarning: 2, status: 'IN_STOCK' },
    { name: 'Coffee Bean', khmerName: 'គ្រាប់កាហ្វេ', category: 'Drinks', quantity: 2, unit: 'kg', lowWarning: 0.5, status: 'IN_STOCK' }
  ];

  console.log('Seeding initial inventory...');
  for (const item of initialIngredients) {
    const exists = await prisma.inventoryItem.findUnique({ where: { name: item.name } });
    if (!exists) {
      await prisma.inventoryItem.create({ data: item });
      console.log(`Added ${item.name}`);
    } else {
      await prisma.inventoryItem.update({
        where: { name: item.name },
        data: item
      });
      console.log(`Updated ${item.name}`);
    }
  }
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
