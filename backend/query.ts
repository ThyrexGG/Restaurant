import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.menuItem.findMany().then(res => console.log(res.map(i => i.name)));
