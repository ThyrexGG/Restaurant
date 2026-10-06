import express from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAdmin } from '../auth.js';

const inventorySchema = z.object({
  name: z.string().min(1).max(200),
  khmerName: z.string().max(200).nullish(),
  category: z.string().max(100),
  quantity: z.coerce.number().finite(),
  unit: z.string().max(50),
  lowWarning: z.coerce.number().finite(),
  status: z.string().max(50).optional()
});

export default function inventoryRoutes() {
  const router = express.Router();
  router.use(requireAdmin);

  router.get('/', async (req, res) => {
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

  router.post('/', async (req, res) => {
    try {
      const parsed = inventorySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'Invalid inventory item' });
      const { name, khmerName, category, quantity, unit, lowWarning, status } = parsed.data;
      const newItem = await prisma.inventoryItem.create({
        data: { name, khmerName: khmerName ?? null, category, quantity, unit, lowWarning, ...(status ? { status } : {}) }
      });
      res.json(newItem);
    } catch (error) {
      console.error('Failed to create inventory item:', error);
      res.status(500).json({ error: 'Failed to create inventory item' });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = inventorySchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'Invalid inventory item' });
      const { name, khmerName, category, quantity, unit, lowWarning, status } = parsed.data;

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

  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.inventoryItem.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      res.status(500).json({ error: 'Failed to delete inventory item' });
    }
  });

  return router;
}
