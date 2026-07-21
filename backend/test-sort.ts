import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const items = await prisma.menuItem.findMany({ include: { category: true } });
  
  const searchQuery = "b1";
  
  const displayItems = items.filter(item => {
    const matchesSearch = searchQuery === '' ? true : (
      (item.name || item.Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku || item.SKU || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesSearch;
  }).sort((a, b) => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const skuA = (a.sku || a.SKU || '').toLowerCase();
      const skuB = (b.sku || b.SKU || '').toLowerCase();
      const nameA = (a.name || a.Name || '').toLowerCase();
      const nameB = (b.name || b.Name || '').toLowerCase();

      const aExactSku = skuA === lowerQuery;
      const bExactSku = skuB === lowerQuery;
      if (aExactSku && !bExactSku) return -1;
      if (!aExactSku && bExactSku) return 1;

      const aStartsSku = skuA.startsWith(lowerQuery);
      const bStartsSku = skuB.startsWith(lowerQuery);
      if (aStartsSku && !bStartsSku) return -1;
      if (!aStartsSku && bStartsSku) return 1;

      if (aStartsSku && bStartsSku) {
        return skuA.localeCompare(skuB);
      }

      const aStartsName = nameA.startsWith(lowerQuery);
      const bStartsName = nameB.startsWith(lowerQuery);
      if (aStartsName && !bStartsName) return -1;
      if (!aStartsName && bStartsName) return 1;
    }

    const catA = a.category?.name || a.Category || 'Uncategorized';
    const catB = b.category?.name || b.Category || 'Uncategorized';
    if (catA < catB) return -1;
    if (catA > catB) return 1;
    
    const nameA = a.name || a.Name || '';
    const nameB = b.name || b.Name || '';
    return nameA.localeCompare(nameB);
  });
  
  console.log(displayItems.map(i => ({ name: i.name, sku: i.sku })));
}
run().finally(() => prisma.$disconnect());
