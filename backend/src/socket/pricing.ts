import { prisma } from '../db/prisma.js';

export interface DbMenuItem {
  id: string;
  sku: string | null;
  name: string;
  price: number;
  availability: boolean;
}

export type PricingResult =
  | { ok: true; items: any[]; total: number }
  | { ok: false; error: string };

// Matches the note ItemModal adds when the customer picks the fried egg extra
const EGG_NOTE = 'Add Fried Egg (+$0.50)';
const EGG_PRICE = 0.5;

const norm = (s: unknown) => String(s ?? '').trim().toLowerCase();
const cents = (n: number) => Math.round(n * 100) / 100;

// Never trust prices sent by the browser: rebuild every line from the database price.
export function computePricing(items: any[], dbItems: DbMenuItem[]): PricingResult {
  const byId = new Map<string, DbMenuItem>();
  const bySku = new Map<string, DbMenuItem>();
  const byName = new Map<string, DbMenuItem>();
  for (const d of dbItems) {
    byId.set(d.id, d);
    if (d.sku) bySku.set(norm(d.sku), d);
    byName.set(norm(d.name), d);
  }

  let total = 0;
  const priced: any[] = [];
  for (const line of items) {
    const quantity = Number(line.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return { ok: false, error: 'Invalid quantity' };
    }

    const match = byId.get(String(line.id)) || bySku.get(norm(line.sku)) || bySku.get(norm(line.id)) || byName.get(norm(line.id));
    if (!match) return { ok: false, error: `"${line.name ?? 'An item'}" is no longer on the menu` };
    if (!match.availability) return { ok: false, error: `"${match.name}" is currently unavailable` };

    const hasEgg = typeof line.notes === 'string' && line.notes.includes(EGG_NOTE);
    const unitPrice = cents(match.price + (hasEgg ? EGG_PRICE : 0));
    total += unitPrice * quantity;

    // addons are not offered by any current screen, so they are dropped instead of trusting client prices
    const { addons: _addons, ...rest } = line;
    priced.push({ ...rest, quantity, price: unitPrice });
  }

  return { ok: true, items: priced, total: cents(total) };
}

// Looks up the ordered items in the database and prices the order.
export async function priceOrder(items: any[]): Promise<PricingResult> {
  const keys = new Set<string>();
  for (const line of items) {
    for (const k of [line.id, line.sku]) if (k) keys.add(String(k));
  }
  const list = [...keys];
  const dbItems = await prisma.menuItem.findMany({
    where: { OR: [{ id: { in: list } }, { sku: { in: list } }, { name: { in: list } }] },
    select: { id: true, sku: true, name: true, price: true, availability: true }
  });
  return computePricing(items, dbItems);
}
