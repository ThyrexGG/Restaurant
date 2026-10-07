import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import express from 'express';
import authRoutes, { requireAdmin, verifyToken, isAdminSocket } from './auth.js';

let server: Server;
let base = '';

before(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes());
  app.get('/api/secret', requireAdmin, (_req, res) => res.json({ ok: true }));
  await new Promise<void>(resolve => { server = app.listen(0, () => resolve()); });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => { server.close(); });

const login = (password: unknown) =>
  fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

test('with no ADMIN_PASSWORD, admin routes and sockets stay open', async () => {
  delete process.env.ADMIN_PASSWORD;
  assert.equal((await fetch(`${base}/api/secret`)).status, 200);
  assert.deepEqual(await (await fetch(`${base}/api/auth/check`)).json(), { authRequired: false, valid: true });
  assert.equal(isAdminSocket({ handshake: {} }), true);
});

test('with ADMIN_PASSWORD, requests without a valid token are rejected', async () => {
  process.env.ADMIN_PASSWORD = 'test-pass';
  assert.equal((await fetch(`${base}/api/secret`)).status, 401);
  const bad = await fetch(`${base}/api/secret`, { headers: { Authorization: 'Bearer not-a-token' } });
  assert.equal(bad.status, 401);
  assert.equal(isAdminSocket({ handshake: { auth: { token: 'nope' } } }), false);
  assert.equal(isAdminSocket({ handshake: {} }), false);
});

test('wrong, empty and malformed passwords are rejected', async () => {
  process.env.ADMIN_PASSWORD = 'test-pass';
  assert.equal((await login('wrong')).status, 401);
  assert.equal((await login('')).status, 401);
  assert.equal((await login(12345)).status, 401);
});

test('correct password returns a token that unlocks admin routes and sockets', async () => {
  process.env.ADMIN_PASSWORD = 'test-pass';
  const res = await login('test-pass');
  assert.equal(res.status, 200);
  const { token } = await res.json() as { token: string };
  assert.ok(verifyToken(token));
  assert.equal((await fetch(`${base}/api/secret`, { headers: { Authorization: `Bearer ${token}` } })).status, 200);
  const check = await (await fetch(`${base}/api/auth/check`, { headers: { Authorization: `Bearer ${token}` } })).json();
  assert.deepEqual(check, { authRequired: true, valid: true });
  assert.equal(isAdminSocket({ handshake: { auth: { token } } }), true);
});

test('a token stops working when the password (and so the signing key) changes', async () => {
  process.env.ADMIN_PASSWORD = 'test-pass';
  const { token } = await (await login('test-pass')).json() as { token: string };
  process.env.ADMIN_PASSWORD = 'changed-pass';
  assert.equal(verifyToken(token), false);
  process.env.ADMIN_PASSWORD = 'test-pass';
});
