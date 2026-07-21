import express from 'express';
import { prisma } from '../db/prisma.js';

export default function inventoryRoutes() {
  const router = express.Router();

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

  router.put('/:id', async (req, res) => {
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
