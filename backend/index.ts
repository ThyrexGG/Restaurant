import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { testLoyverseConnection } from './loyverse.js';
import { loadActiveOrders, setupSockets } from './src/socket/index.js';
import menuRoutes from './src/routes/menu.js';
import analyticsRoutes from './src/routes/analytics.js';
import inventoryRoutes from './src/routes/inventory.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Restaurant POS API is running' });
});

// Setup Routes
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
  // Test Loyverse connection on startup
  await testLoyverseConnection();
});
