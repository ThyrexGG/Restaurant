import fs from 'fs';
import path from 'path';

function filterMenuJson() {
  const jsonPath = path.resolve(process.cwd(), '../frontend/src/assets/menu.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const menuArray = JSON.parse(rawData);

  console.log(`Initial count: ${menuArray.length}`);

  const targetSkus = ['G17', 'F21', 'F28', 'F23', 'B20', 'F17', 'F18', 'VF13'];

  const cleaned = menuArray.filter((item: any) => {
    const sku = (item.SKU || '').toUpperCase();
    return !targetSkus.includes(sku);
  });

  fs.writeFileSync(jsonPath, JSON.stringify(cleaned, null, 4), 'utf-8');
  console.log(`Final count: ${cleaned.length} (Removed ${menuArray.length - cleaned.length} items)`);
}

filterMenuJson();
