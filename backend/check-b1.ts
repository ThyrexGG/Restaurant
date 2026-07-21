import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const items = await prisma.menuItem.findMany();
  
  const b1Items = items.filter(i => 
    (i.sku || '').toLowerCase().includes('b1') || 
    (i.SKU || '').toLowerCase().includes('b1') ||
    (i.name || '').toLowerCase().includes('b1')
  );
  
  console.log(b1Items.map(i => ({ name: i.name, sku: i.sku, SKU: i.SKU })));
}
run().finally(() => prisma.$disconnect());
