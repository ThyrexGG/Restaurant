import express from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../db/prisma.js';
import { Server } from 'socket.io';

export default function menuRoutes(io: Server) {
  const router = express.Router();

  // Seed/Import menu from JSON
  router.post('/seed', async (req, res) => {
    try {
      const menuPath = path.resolve(process.cwd(), '../frontend/src/assets/menu.json');
      if (!fs.existsSync(menuPath)) {
        return res.status(404).json({ error: 'menu.json not found' });
      }
      
      const rawData = fs.readFileSync(menuPath, 'utf-8');
      const menuData = JSON.parse(rawData);
      
      let itemsAdded = 0;
      let itemsUpdated = 0;
      
      const categories = await prisma.category.findMany();
      const categoryMap = new Map<string, string>();
      categories.forEach(c => categoryMap.set(c.name.trim().toLowerCase(), c.id));

      const existingItems = await prisma.menuItem.findMany({ select: { id: true, name: true, sku: true } });
      const existingMap = new Map<string, string>();
      existingItems.forEach(i => {
        if (i.sku) existingMap.set(i.sku.trim().toLowerCase(), i.id);
        if (i.name) existingMap.set(i.name.trim().toLowerCase(), i.id);
      });

      // Process in parallel batches of 25 items for fast performance
      const BATCH_SIZE = 25;
      for (let i = 0; i < menuData.length; i += BATCH_SIZE) {
        const batch = menuData.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (item: any) => {
          if (!item.Name) return;
          const cleanName = item.Name.trim();
          const skuValue = item.SKU ? item.SKU.trim() : null;
          
          const categoryName = (item.Category || 'Uncategorized').trim();
          let catId = categoryMap.get(categoryName.toLowerCase());
          
          if (!catId) {
            const category = await prisma.category.create({ data: { name: categoryName } });
            catId = category.id;
            categoryMap.set(categoryName.toLowerCase(), catId);
          }
          
          const priceValue = Number(
            item['Price [Best Khmer (Golden Cafe) Restaurant]'] ?? 
            item.Price ?? 
            item.price ?? 
            5.00
          );
          const imgValue = item.image || item.Cloudinary_ID || null;
          
          const matchId = (skuValue && existingMap.get(skuValue.toLowerCase())) || existingMap.get(cleanName.toLowerCase());

          if (matchId) {
            await prisma.menuItem.update({
              where: { id: matchId },
              data: {
                name: cleanName,
                sku: skuValue,
                description: item.Description,
                price: priceValue,
                ...(imgValue ? { image: imgValue } : {}),
                categoryId: catId,
                availability: true
              }
            });
            itemsUpdated++;
          } else {
            const created = await prisma.menuItem.create({
              data: {
                name: cleanName,
                sku: skuValue,
                description: item.Description,
                price: priceValue,
                image: imgValue,
                categoryId: catId,
                availability: true
              }
            });
            existingMap.set(cleanName.toLowerCase(), created.id);
            if (skuValue) existingMap.set(skuValue.toLowerCase(), created.id);
            itemsAdded++;
          }
        }));
      }
      
      res.json({ success: true, message: `Imported menu items (${itemsAdded} added, ${itemsUpdated} updated).` });
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
      // Sanitize items where image is literal string "null" or "undefined"
      const sanitized = items.map(item => {
        if (item.image === 'null' || item.image === 'undefined') {
          return { ...item, image: null };
        }
        return item;
      });
      res.json(sanitized);
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
        },
        include: { category: true }
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
