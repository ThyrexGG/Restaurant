import axios from 'axios';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const LOYVERSE_API_KEY = process.env.LOYVERSE_API_KEY;

export const loyverseApi = axios.create({
  baseURL: 'https://api.loyverse.com/v1.0',
  headers: {
    'Authorization': `Bearer ${LOYVERSE_API_KEY}`
  }
});

// Cache items to avoid fetching on every order
let cachedItems: any[] = [];

export const testLoyverseConnection = async () => {
  try {
    const response = await loyverseApi.get('/items');
    cachedItems = response.data.items;
    console.log('✅ Successfully connected to Loyverse API!');
    console.log(`Fetched ${cachedItems.length} items from Loyverse inventory.`);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to connect to Loyverse:', error.response?.data || error.message);
    return false;
  }
};

export const postOrderToLoyverse = async (orderData: any) => {
  try {
    if (cachedItems.length === 0) {
      await testLoyverseConnection();
    }

    const lineItems = orderData.items.map((cartItem: any) => {
      // Find matching item in Loyverse
      const matchedLoyverseItem = cachedItems.find(
        (li: any) => li.item_name.toLowerCase() === cartItem.name.toLowerCase()
      );

      if (!matchedLoyverseItem) {
        console.warn(`⚠️ Warning: Item "${cartItem.name}" not found in Loyverse inventory. Skipping...`);
        return null;
      }

      const variant = matchedLoyverseItem.variants[0]; // Usually default variant

      return {
        item_id: matchedLoyverseItem.id,
        variant_id: variant.variant_id,
        quantity: cartItem.quantity,
        price: cartItem.price,
        discount_amount: 0
      };
    }).filter(Boolean); // Remove nulls

    if (lineItems.length === 0) {
      console.error('❌ Could not map any items to Loyverse. Receipt sync cancelled.');
      return null;
    }

    const receipt = {
      receipt_number: `ORD-${Date.now()}`,
      receipt_date: new Date().toISOString(),
      receipt_type: "SALE",
      total_money: orderData.total,
      line_items: lineItems,
      payments: [
        {
          payment_type_id: "cash", // Assuming cash or custom type
          money_amount: orderData.total,
          name: "Cash"
        }
      ]
    };

    const response = await loyverseApi.post('/receipts', [receipt]);
    console.log(`✅ Successfully pushed order to Loyverse! Receipt #${receipt.receipt_number}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to push order to Loyverse:', error.response?.data || error.message);
    return null;
  }
};
