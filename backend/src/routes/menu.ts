import express from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../db/prisma.js';
import { Server } from 'socket.io';

export default function menuRoutes(io: Server) {
  const router = express.Router();

  // Seed menu from JSON
  router.post('/seed', async (req, res) => {
    try {
      // Use import.meta.url for ESM to get __dirname equivalent, or keep simple path relative to CWD
      const menuPath = path.resolve(process.cwd(), '../frontend/src/assets/menu.json');
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
  router.get('/', async (req, res) => {
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

  // Get a menu item by slug
  router.get('/slug/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const items = await prisma.menuItem.findMany({ include: { category: true } });
      
      // Find the item where the generated slug matches
      const item = items.find(i => 
        (i.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === slug
      );
      
      if (!item) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      res.json(item);
    } catch (error) {
      console.error('Failed to fetch menu item by slug:', error);
      res.status(500).json({ error: 'Failed to fetch menu item' });
    }
  });

  // Update a menu item
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, availability, imagePosition, image, sku } = req.body;
      
      const updated = await prisma.menuItem.update({
        where: { id },
        data: { 
          name, 
          description, 
          price: Number(price), 
          availability,
          ...(sku !== undefined && { sku }),
          ...(imagePosition !== undefined && { imagePosition }),
          ...(image !== undefined && { image })
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

  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.menuItem.delete({ where: { id } });
      io.emit('menu_item_deleted', id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      res.status(500).json({ error: 'Failed to delete menu item' });
    }
  });

  return router;
}
