import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { testLoyverseConnection } from './loyverse.js';
import { loadActiveOrders, setupSockets } from './src/socket/index.js';
import menuRoutes from './src/routes/menu.js';
import analyticsRoutes from './src/routes/analytics.js';
import inventoryRoutes from './src/routes/inventory.js';
import authRoutes, { authEnabled } from './src/auth.js';

dotenv.config();

// ALLOWED_ORIGINS: comma-separated list, e.g. "https://my-site.vercel.app,*.vercel.app".
// A "*.domain" entry matches any subdomain. When unset, all origins are allowed (old behaviour).
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
const originAllowed = (origin: string | undefined) => {
  if (!origin || allowedOrigins.length === 0) return true; // non-browser clients (Flutter) send no Origin
  return allowedOrigins.some(rule => {
    if (rule === '*') return true;
    if (rule.startsWith('*.')) {
      try { return new URL(origin).hostname.endsWith(rule.slice(1)); } catch { return false; }
    }
    return origin === rule;
  });
};
const corsOrigin = (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) =>
  cb(null, originAllowed(origin));

const app = express();
app.set('trust proxy', 1); // behind Render's proxy, so rate limits see the real client IP
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
});

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));
// Generous because a whole restaurant can share one Wi-Fi IP
app.use('/api', rateLimit({ windowMs: 60_000, limit: 600, standardHeaders: true, legacyHeaders: false }));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Restaurant POS API is running' });
});

// Setup Routes
app.use('/api/auth', authRoutes());
app.use('/api/menu', menuRoutes(io));
app.use('/api/analytics', analyticsRoutes());
app.use('/api/inventory', inventoryRoutes());

// Load active orders from DB into memory
(async () => {
  await loadActiveOrders();
})();

// Setup Sockets
setupSockets(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  if (!authEnabled()) console.warn('WARNING: ADMIN_PASSWORD is not set. Admin endpoints are NOT protected.');
  if (!process.env.ALLOWED_ORIGINS) console.warn('WARNING: ALLOWED_ORIGINS is not set. CORS allows all origins.');
  // Test Loyverse connection on startup
  await testLoyverseConnection();
});
