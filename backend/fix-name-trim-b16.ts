import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function fixNameTrimB16() {
  console.log('=== Trimming Name on Valid B16 Item ===');

  const item = await prisma.menuItem.findFirst({
    where: { id: 'c1225a28-d21f-4bab-940c-f06c2841fea0' }
  });

  if (item) {
    await prisma.menuItem.update({
      where: { id: item.id },
      data: { name: item.name.trim() }
    });
    console.log(`Updated ID ${item.id} name from "${item.name}" to "${item.name.trim()}"`);
  }
}

fixNameTrimB16()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
