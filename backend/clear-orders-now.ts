import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function clearOrdersNow() {
  console.log('=== Clearing All Orders and Order Items from Database ===');
  
  const itemDel = await prisma.orderItem.deleteMany();
  const orderDel = await prisma.order.deleteMany();

  console.log(`Deleted ${itemDel.count} order items.`);
  console.log(`Deleted ${orderDel.count} orders.`);
  console.log('=== Database Order History Cleared! ===');
}

clearOrdersNow()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
