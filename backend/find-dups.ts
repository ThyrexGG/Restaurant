import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.menuItem.findMany().then(res => {
  const counts: Record<string, number> = {};
  for(const r of res) {
    counts[r.name] = (counts[r.name] || 0) + 1;
  }
  const duplicates = Object.entries(counts).filter(([name, count]) => count > 1);
  console.log('Duplicates:', duplicates);
});
