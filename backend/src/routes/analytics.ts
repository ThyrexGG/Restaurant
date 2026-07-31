import express from 'express';
import { prisma } from '../db/prisma.js';

export default function analyticsRoutes() {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        where: { status: { not: 'CANCELLED' } },
        include: { items: { include: { menuItem: true } } }
      });

      const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
      const totalOrders = orders.length;

      // Filter Today's orders (current calendar day)
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const todayOrdersList = orders.filter(o => new Date(o.createdAt) >= startOfToday);
      const todayRevenue = todayOrdersList.reduce((sum, o) => sum + o.totalPrice, 0);
      const todayOrders = todayOrdersList.length;

      // Recent orders (complete history sorted newest first)
      const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Top Selling Items (Parsed from items relation or JSON notes)
      const itemSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
      orders.forEach(o => {
        let items: any[] = [];
        if (o.items && o.items.length > 0) {
          items = o.items.map(i => ({
            id: i.menuItem?.id || i.menuItemId,
            name: i.menuItem?.name || 'Unknown Item',
            quantity: i.quantity,
            price: i.priceAtTime
          }));
        } else if (o.notes) {
          try {
            const parsed = JSON.parse(o.notes);
            if (Array.isArray(parsed)) {
              items = parsed.map(i => ({
                id: i.id || i.sku || i.name,
                name: i.name || 'Unknown Item',
                quantity: i.quantity || 1,
                price: i.price || 0
              }));
            }
          } catch (e) {}
        }

        items.forEach(i => {
          const id = i.id;
          const name = i.name;
          if (!id) return;
          if (!itemSales[id]) itemSales[id] = { name, quantity: 0, revenue: 0 };
          itemSales[id].quantity += i.quantity;
          itemSales[id].revenue += i.quantity * i.price;
        });
      });

      const topItems = Object.values(itemSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Sales by Day (last 7 days)
      const salesByDay: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        salesByDay[dateStr] = 0;
      }
      
      orders.forEach(o => {
        const dateStr = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (salesByDay[dateStr] !== undefined) {
          salesByDay[dateStr] += o.totalPrice;
        }
      });

      const salesChart = Object.keys(salesByDay).map(date => ({ date, revenue: salesByDay[date] }));

      // Daily Breakdown List (Grouped by date, sorted newest first)
      const dailyMap: Record<string, { date: string, revenue: number, ordersCount: number, itemsCount: number }> = {};
      orders.forEach(o => {
        const dateKey = new Date(o.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        if (!dailyMap[dateKey]) {
          dailyMap[dateKey] = { date: dateKey, revenue: 0, ordersCount: 0, itemsCount: 0 };
        }
        dailyMap[dateKey].revenue += o.totalPrice;
        dailyMap[dateKey].ordersCount += 1;

        // Sum up total dishes/items sold
        let qtySum = 0;
        if (o.items && o.items.length > 0) {
          qtySum = o.items.reduce((sum, item) => sum + item.quantity, 0);
        } else if (o.notes) {
          try {
            const parsed = JSON.parse(o.notes);
            if (Array.isArray(parsed)) {
              qtySum = parsed.reduce((sum, item) => sum + (item.quantity || 1), 0);
            }
          } catch (e) {}
        }
        dailyMap[dateKey].itemsCount += qtySum || 1;
      });

      const dailyBreakdown = Object.values(dailyMap).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json({
        todayRevenue,
        todayOrders,
        totalRevenue,
        totalOrders,
        recentOrders,
        topItems,
        salesChart,
        dailyBreakdown
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  router.delete('/clear-orders', async (req, res) => {
    try {
      await prisma.orderItem.deleteMany();
      await prisma.order.deleteMany();
      res.json({ success: true, message: 'All order history cleared.' });
    } catch (error) {
      console.error('Failed to clear orders:', error);
      res.status(500).json({ error: 'Failed to clear order history' });
    }
  });

  router.delete('/order/:id', async (req, res) => {
    const { id } = req.params;
    try {
      // Delete associated items first to satisfy foreign key constraints
      await prisma.orderItem.deleteMany({
        where: { orderId: id }
      });
      // Delete the order record
      await prisma.order.delete({
        where: { id }
      });
      res.json({ success: true, message: `Order ${id} successfully deleted.` });
    } catch (error) {
      console.error(`Failed to delete order ${id}:`, error);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  });

  return router;
}
