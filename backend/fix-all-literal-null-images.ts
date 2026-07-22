import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function fixLiteralNullImages() {
  console.log('=== Fixing Literal "null" and "undefined" Image Strings in DB ===');
  
  const allItems = await prisma.menuItem.findMany();
  let deletedCount = 0;
  let updatedCount = 0;

  for (const item of allItems) {
    const rawImage = (item.image || '').trim().toLowerCase();
    
    if (rawImage === 'null' || rawImage === 'undefined' || rawImage === 'none' || rawImage === '') {
      // Check if there is another version of this item with a valid image
      const cleanName = item.name.trim().toLowerCase();
      const duplicateWithImage = allItems.find(other => 
        other.id !== item.id && 
        other.name.trim().toLowerCase() === cleanName && 
        other.image && 
        !['null', 'undefined', 'none', ''].includes(other.image.trim().toLowerCase())
      );

      if (duplicateWithImage) {
        console.log(`Deleting imageless duplicate: [ID: ${item.id}] Name: "${item.name}"`);
        await prisma.orderItem.deleteMany({ where: { menuItemId: item.id } });
        await prisma.menuItem.delete({ where: { id: item.id } });
        deletedCount++;
      } else {
        console.log(`Updating DB item [ID: ${item.id}] Name: "${item.name}" -> setting image to null`);
        await prisma.menuItem.update({
          where: { id: item.id },
          data: { image: null }
        });
        updatedCount++;
      }
    }
  }

  console.log(`=== Done! Deleted ${deletedCount} imageless duplicates, updated ${updatedCount} items to clean null ===`);
}

fixLiteralNullImages()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
