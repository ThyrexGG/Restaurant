import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

export const prisma = new PrismaClient();
