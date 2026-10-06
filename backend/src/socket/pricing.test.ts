import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computePricing } from './pricing.js';

const db = [
  { id: 'u1', sku: 'B1', name: 'Fried Rice', price: 4.5, availability: true },
  { id: 'u2', sku: null, name: 'Amok', price: 6, availability: true },
  { id: 'u3', sku: 'S9', name: 'Sold Out', price: 3, availability: false }
];

test('replaces a tampered client price with the database price', () => {
  const r = computePricing([{ id: 'u1', name: 'x', price: 0.01, quantity: 2 }], db);
  assert.ok(r.ok);
  assert.equal(r.total, 9);
  assert.equal(r.items[0].price, 4.5);
});

test('adds the fried egg extra only when the note is present', () => {
  const withEgg = computePricing([{ id: 'u1', quantity: 1, notes: 'Add Fried Egg (+$0.50) | hi' }], db);
  assert.ok(withEgg.ok);
  assert.equal(withEgg.total, 5);
  const without = computePricing([{ id: 'u1', quantity: 1, notes: 'no egg please' }], db);
  assert.ok(without.ok);
  assert.equal(without.total, 4.5);
});

test('matches items by id, sku and name', () => {
  for (const id of ['u1', 'B1']) {
    const r = computePricing([{ id, quantity: 1 }], db);
    assert.ok(r.ok);
    assert.equal(r.total, 4.5);
  }
  const byName = computePricing([{ id: 'Amok', quantity: 1 }], db);
  assert.ok(byName.ok);
  assert.equal(byName.total, 6);
});

test('rejects unavailable and unknown items', () => {
  assert.equal(computePricing([{ id: 'u3', quantity: 1 }], db).ok, false);
  assert.equal(computePricing([{ id: 'nope', name: 'Ghost', quantity: 1 }], db).ok, false);
});

test('rejects invalid quantities', () => {
  for (const quantity of [-3, 0, 1.5, 100]) {
    assert.equal(computePricing([{ id: 'u1', quantity }], db).ok, false, `quantity ${quantity}`);
  }
});

test('drops client-supplied addons', () => {
  const r = computePricing([{ id: 'u1', quantity: 1, addons: [{ id: 'a', name: 'free', price: -99 }] }], db);
  assert.ok(r.ok);
  assert.equal(r.total, 4.5);
  assert.ok(!('addons' in r.items[0]));
});

test('sums multiple lines', () => {
  const r = computePricing([{ id: 'u1', quantity: 3 }, { id: 'u2', quantity: 1 }], db);
  assert.ok(r.ok);
  assert.equal(r.total, 19.5);
});
