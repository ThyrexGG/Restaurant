import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

// Auth is only enforced when ADMIN_PASSWORD is set, so deploying this code
// cannot lock staff out before the variable exists. Env vars are read lazily
// because dotenv.config() runs after imports are evaluated.
const TOKEN_TTL = '12h';

export const authEnabled = () => !!process.env.ADMIN_PASSWORD;

const secret = () =>
  process.env.JWT_SECRET ||
  crypto.createHash('sha256').update(`restaurant-pos:${process.env.ADMIN_PASSWORD}`).digest('hex');

export function verifyToken(token: unknown): boolean {
  if (typeof token !== 'string' || !token) return false;
  try {
    jwt.verify(token, secret());
    return true;
  } catch {
    return false;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!authEnabled()) return next();
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (verifyToken(token)) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

export function isAdminSocket(socket: { handshake: { auth?: any } }): boolean {
  return !authEnabled() || verifyToken(socket.handshake.auth?.token);
}

const safeEqual = (a: string, b: string) => {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' }
});

const loginSchema = z.object({ password: z.string().min(1).max(200) });

export default function authRoutes() {
  const router = express.Router();

  // Lets the frontend know whether to show a login screen, and whether the stored token is still valid
  router.get('/check', (req, res) => {
    if (!authEnabled()) return res.json({ authRequired: false, valid: true });
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    res.json({ authRequired: true, valid: verifyToken(token) });
  });

  router.post('/login', loginLimiter, (req, res) => {
    if (!authEnabled()) return res.json({ token: '', authRequired: false });
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success || !safeEqual(parsed.data.password, process.env.ADMIN_PASSWORD as string)) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    const token = jwt.sign({ role: 'admin' }, secret(), { expiresIn: TOKEN_TTL });
    res.json({ token, authRequired: true });
  });

  return router;
}
