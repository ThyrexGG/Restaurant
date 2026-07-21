import { Server, Socket } from 'socket.io';
import { prisma } from '../db/prisma.js';
import { postOrderToLoyverse } from '../../loyverse.js';

export const activeOrders: any[] = [];

export async function loadActiveOrders() {
  try {
    const dbOrders = await prisma.order.findMany({
      where: { status: { in: ['NEW', 'COOKING', 'READY'] } }
    });
    for (const o of dbOrders) {
      try {
        const orderNum = o.orderNumber || '';
        const parts = orderNum.split('-');
        const isDailyFormat = orderNum.includes('-') && (parts[0] || '').length === 8 && !isNaN(Number(parts[1] || 'NaN'));
        
        activeOrders.push({
          id: o.id,
          orderNumber: o.orderNumber,
          dailyOrderNumber: isDailyFormat ? parts[1] : String(Math.floor(Math.random() * 900) + 100),
          table: o.customerName ? o.customerName.replace('Table ', '') : '',
          type: o.diningType,
          status: o.status,
          total: o.totalPrice,
          items: JSON.parse(o.notes || '[]'),
          timestamp: o.createdAt
        });
      } catch (e) {
        // ignore parse error
      }
    }
    console.log(`Loaded ${activeOrders.length} active orders from DB.`);
  } catch (err) {
    console.error('Failed to load active orders from DB:', err);
  }
}

export function setupSockets(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);

    // For the Kitchen Display System (KDS)
    socket.on('join_kitchen', () => {
      socket.join('kitchen_room');
      console.log(`Socket ${socket.id} joined kitchen_room`);
      // Send existing active orders to the kitchen
      socket.emit('initial_orders', activeOrders.filter(o => ['NEW', 'COOKING'].includes(o.status)));
    });

    // For the Admin Dashboard
    socket.on('join_admin', () => {
      socket.join('admin_room');
      console.log(`Socket ${socket.id} joined admin_room`);
      // Send existing active orders to the admin
      socket.emit('initial_orders', activeOrders);
    });

    // Handle incoming new order from Customer Ordering App
    socket.on('new_order', async (orderData) => {
      console.log('New order received from customer:', orderData);

      // Save to PostgreSQL Database for resilience and analytics
      let dbOrderId = `mock-${Date.now()}`;
      let dbOrderNumber = dbOrderId;
      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const count = await prisma.order.count({
          where: {
            createdAt: { gte: startOfDay }
          }
        });
        const orderNumStr = (count + 1).toString().padStart(3, '0');
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        dbOrderNumber = `${dateStr}-${orderNumStr}`;

        const savedOrder = await prisma.order.create({
          data: {
            orderNumber: dbOrderNumber,
            customerName: `Table ${orderData.table}`,
            diningType: orderData.type || 'DINE_IN',
            status: 'COOKING',
            totalPrice: orderData.total,
            notes: JSON.stringify(orderData.items)
          }
        });
        dbOrderId = savedOrder.id;
        console.log(`Order saved to Database! DB ID: ${savedOrder.id}, Order Number: ${dbOrderNumber}`);
      } catch (dbError) {
        console.error('Failed to save to database:', dbError);
      }

      // Add unique ID and timestamp before broadcasting
      orderData.id = dbOrderId;
      orderData.orderNumber = dbOrderNumber;
      orderData.dailyOrderNumber = dbOrderNumber.includes('-') ? dbOrderNumber.split('-')[1] : dbOrderNumber.substring(0, 4);
      orderData.status = 'COOKING';
      orderData.timestamp = new Date().toISOString();

      // Store in-memory
      activeOrders.push(orderData);

      // Broadcast to Kitchen and Admin
      io.to('kitchen_room').emit('new_order_received', orderData);
      io.to('admin_room').emit('new_order_received', orderData);
      // Also echo back to the customer so they know their order ID for tracking
      socket.emit('order_confirmed', orderData);

      // Sync to Loyverse in the background
      const loyverseReceipt = await postOrderToLoyverse(orderData);
      if (loyverseReceipt) {
        console.log('Order officially logged into Loyverse POS.');
      }

      // Auto-transition to COOKING after 5 seconds to animate the customer's UI
      setTimeout(async () => {
        const orderIndex = activeOrders.findIndex(o => o.id === dbOrderId);
        // Only transition if it's still NEW (hasn't been rejected or manually changed)
        if (orderIndex !== -1 && activeOrders[orderIndex].status === 'NEW') {
          activeOrders[orderIndex].status = 'COOKING';
          io.emit('order_status_changed', { orderId: dbOrderId, status: 'COOKING' });
          
          // Update DB if it's a real order
          if (dbOrderId.length > 10 && !dbOrderId.startsWith('mock')) {
            try {
              await prisma.order.update({
                where: { id: dbOrderId },
                data: { status: 'COOKING' }
              });
            } catch (e) {
              console.error('Error auto-updating DB to COOKING:', e);
            }
          }
        }
      }, 5000);
    });

    // Handle order status updates from Admin or KDS
    socket.on('update_order_status', async ({ orderId, status }) => {
      console.log(`Order ${orderId} status updated to: ${status}`);

      // Update in-memory store
      const orderIndex = activeOrders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        if (status === 'PAID') {
          activeOrders.splice(orderIndex, 1);
        } else {
          activeOrders[orderIndex].status = status;
        }
      }

      // Broadcast to all clients (Customer, Kitchen, Admin)
      io.emit('order_status_changed', { orderId, status });

      // Update in database if it's a real UUID (not a mock order right now)
      if (orderId && orderId.length > 10) {
        try {
          await prisma.order.update({
            where: { id: orderId },
            data: { status }
          });
        } catch (e) {
          console.error('Error updating DB status (might be a mock order):', e);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}
