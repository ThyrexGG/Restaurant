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

      // Recent orders (last 5)
      const recentOrders = [...orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

      // Top Selling Items
      const itemSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
      orders.forEach(o => {
        o.items.forEach(i => {
          const id = i.menuItem?.id;
          const name = i.menuItem?.name || 'Unknown Item';
          if (!id) return;
          if (!itemSales[id]) itemSales[id] = { name, quantity: 0, revenue: 0 };
          itemSales[id].quantity += i.quantity;
          itemSales[id].revenue += i.quantity * i.priceAtTime;
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
        const dateStr = o.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (salesByDay[dateStr] !== undefined) {
          salesByDay[dateStr] += o.totalPrice;
        }
      });

      const salesChart = Object.keys(salesByDay).map(date => ({ date, revenue: salesByDay[date] }));

      res.json({
        totalRevenue,
        totalOrders,
        recentOrders,
        topItems,
        salesChart
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

  return router;
}
