const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetOrders() {
  console.log('Resetting test orders...');
  try {
    const deletedItems = await prisma.orderItem.deleteMany();
    console.log(`Deleted ${deletedItems.count} order items.`);
    
    const deletedOrders = await prisma.order.deleteMany();
    console.log(`Deleted ${deletedOrders.count} orders.`);
    
    console.log('Successfully reset all test orders and analytics.');
  } catch (e) {
    console.error('Error resetting orders:', e);
  } finally {
    await prisma.$disconnect();
  }
}

resetOrders();
