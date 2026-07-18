import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { testLoyverseConnection, postOrderToLoyverse } from './loyverse.js';

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

// Analytics endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const revenue = await prisma.order.aggregate({ _sum: { totalPrice: true } });
    const recentOrders = await prisma.order.findMany({ 
      take: 10, 
      orderBy: { createdAt: 'desc' } 
    });
    
    res.json({ 
      totalOrders, 
      totalRevenue: revenue._sum.totalPrice || 0, 
      recentOrders 
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Menu Management Endpoints
import fs from 'fs';
import path from 'path';

// Seed menu from JSON
app.post('/api/menu/seed', async (req, res) => {
  try {
    const menuPath = path.join(__dirname, '../frontend/src/assets/menu.json');
    if (!fs.existsSync(menuPath)) {
      return res.status(404).json({ error: 'menu.json not found' });
    }
    
    const rawData = fs.readFileSync(menuPath, 'utf-8');
    const menuData = JSON.parse(rawData);
    
    let itemsAdded = 0;
    
    for (const item of menuData) {
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
            sku: item.SKU || null,
            description: item.Description,
            price: priceValue,
            image: item.Cloudinary_ID || null,
            categoryId: category.id,
          }
        });
        itemsAdded++;
      }
    }
    
    res.json({ success: true, message: `Seeded ${itemsAdded} new menu items.` });
  } catch (error) {
    console.error('Failed to seed menu:', error);
    res.status(500).json({ error: 'Failed to seed menu' });
  }
});

// Get all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      include: { category: true }
    });
    res.json(items);
  } catch (error) {
    console.error('Failed to fetch menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Update a menu item
app.put('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, availability, imagePosition } = req.body;
    
    const updated = await prisma.menuItem.update({
      where: { id },
      data: { 
        name, 
        description, 
        price: Number(price), 
        availability,
        ...(imagePosition !== undefined && { imagePosition })
      }
    });
    
    // Broadcast menu update to connected clients
    io.emit('menu_updated', updated);
    
    res.json(updated);
  } catch (error) {
    console.error('Failed to update menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// --- INVENTORY ROUTES ---
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { category: 'asc' }
    });
    res.json(items);
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const { name, khmerName, category, quantity, unit, lowWarning, status } = req.body;
    const newItem = await prisma.inventoryItem.create({
      data: { name, khmerName, category, quantity: Number(quantity), unit, lowWarning: Number(lowWarning), status }
    });
    res.json(newItem);
  } catch (error) {
    console.error('Failed to create inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, khmerName, category, quantity, unit, lowWarning, status } = req.body;
    
    const data: any = { name, khmerName, category, unit, status };
    if (quantity !== undefined) data.quantity = Number(quantity);
    if (lowWarning !== undefined) data.lowWarning = Number(lowWarning);

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Failed to update inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.inventoryItem.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});
// ------------------------
const activeOrders: any[] = [];
(async () => {
  try {
    const dbOrders = await prisma.order.findMany({
      where: { status: { in: ['NEW', 'COOKING', 'READY'] } }
    });
    for (const o of dbOrders) {
      try {
        const isDailyFormat = o.orderNumber && o.orderNumber.includes('-') && o.orderNumber.split('-')[0].length === 8 && !isNaN(Number(o.orderNumber.split('-')[1]));
        
        activeOrders.push({
          id: o.id,
          orderNumber: o.orderNumber,
          dailyOrderNumber: isDailyFormat ? o.orderNumber.split('-')[1] : String(Math.floor(Math.random() * 900) + 100),
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
})();

// Socket.IO connection handling
io.on('connection', (socket) => {
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
          diningType: 'DINE_IN',
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

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Test Loyverse connection on startup
  await testLoyverseConnection();
});
