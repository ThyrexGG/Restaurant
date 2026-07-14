import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { testLoyverseConnection, postOrderToLoyverse } from './loyverse';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Restaurant POS API is running' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // For the Kitchen Display System (KDS)
  socket.on('join_kitchen', () => {
    socket.join('kitchen_room');
    console.log(`Socket ${socket.id} joined kitchen_room`);
  });

  // For the Admin Dashboard
  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log(`Socket ${socket.id} joined admin_room`);
  });

  // Handle incoming new order from Customer Ordering App
  socket.on('new_order', async (orderData) => {
    console.log('New order received from customer:', orderData);

    // Save to PostgreSQL Database for resilience and analytics
    let dbOrderId = `mock-${Date.now()}`;
    try {
      const savedOrder = await prisma.order.create({
        data: {
          customerName: `Table ${orderData.table}`,
          diningType: 'DINE_IN',
          status: 'NEW',
          totalPrice: orderData.total,
          notes: 'Auto-synced from Customer App'
        }
      });
      dbOrderId = savedOrder.id;
      console.log(`Order saved to Database! DB ID: ${savedOrder.id}`);
    } catch (dbError) {
      console.error('⚠️ Database save failed (but order still sent to kitchen):', dbError);
    }

    // Attach real ID to the order data so frontend can update it
    const enrichedOrder = { ...orderData, id: dbOrderId, status: 'NEW' };

    // Broadcast to kitchen and admin instantly for real-time responsiveness
    io.to('kitchen_room').emit('new_order_received', enrichedOrder);
    io.to('admin_room').emit('new_order_received', enrichedOrder);
    // Also echo back to the customer so they know their order ID for tracking
    socket.emit('order_confirmed', enrichedOrder);

    // Sync to Loyverse in the background
    const loyverseReceipt = await postOrderToLoyverse(orderData);
    if (loyverseReceipt) {
      console.log('Order officially logged into Loyverse POS.');
    }
  });

  // Handle order status updates from Admin or KDS
  socket.on('update_order_status', async ({ orderId, status }) => {
    console.log(`Order ${orderId} status updated to: ${status}`);

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

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Test Loyverse connection on startup
  await testLoyverseConnection();
});
