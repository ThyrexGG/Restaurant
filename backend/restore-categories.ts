import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const categories = await prisma.category.findMany();
  
  const getCatId = (name: string) => {
    const cat = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    return cat ? cat.id : categories[0].id; // Fallback to first category if not found
  };

  const updates = [
    { name: 'Avocado Smoothie', category: 'Smoothie' },
    { name: 'Chicken Burger with Cheese', category: 'New Menu' }, // Burgers were likely New Menu or Breakfast
    { name: 'Crispy Chicken Sandwich with Cheese', category: 'Breakfast' },
    { name: 'Crispy Fish Burger with Cheese', category: 'New Menu' },
    { name: 'Crispy Chicken Burger with Cheese', category: 'New Menu' },
    { name: 'Crab Meat Sandwich with Cheese', category: 'Breakfast' },
    { name: 'Fried Egg with bread or toast', category: 'Breakfast' },
    { name: 'Fried Egg, Hotdog with bread or toast', category: 'Breakfast' },
    { name: 'Egg Burger with Cheese', category: 'Breakfast' },
    { name: 'Ham and Cheese Sandwich', category: 'Breakfast' },
    { name: 'Pineapple Fried Rice (Chicken/Pork/Tofu/Egg)', category: 'Fried Rice' },
    { name: 'Omelet Cheese with bread or toast', category: 'Breakfast' },
    { name: 'Scrambled Egg Hotdog with bread or toast', category: 'Breakfast' },
    { name: 'Scrambled Egg with bread or toast', category: 'Breakfast' },
    { name: 'Sandwich Egg with French fries', category: 'Breakfast' },
  ];

  for (const update of updates) {
    const items = await prisma.menuItem.findMany({ where: { name: update.name } });
    for (const item of items) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { categoryId: getCatId(update.category) }
      });
      console.log(`Updated ${item.name} to ${update.category}`);
    }
  }
}

run().finally(() => prisma.$disconnect());
