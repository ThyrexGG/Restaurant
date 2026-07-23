// scripts/link_user_recent_uploads.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const menuPath = path.resolve(root, 'frontend/src/assets/menu.json');
const imagesDir = path.resolve(root, 'frontend/public/images');
const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));

const rawDir = path.resolve(root, 'backend/raw-images');

const links = [
  { sku: 'D80', category: 'Macchiato', file: 'brown sugar macchiato.jpg' },
  { sku: 'SF14', category: 'Stir-fried', file: 'Bok Choy tofu.jpg' },
  { sku: 'F22', category: 'Fried Noodle', file: 'Flat noodle tofu.jpg' },
  { sku: 'SF24', category: 'Stir-fried', file: 'morning glory tofu.jpg' },
  { sku: 'B10', category: 'Breakfast', file: 'tofu noodle soup.jpg' }
];

let linkedCount = 0;
links.forEach(l => {
  const item = menuData.find(i => i.SKU === l.sku);
  const srcPath = path.join(rawDir, l.file);
  
  if (item && fs.existsSync(srcPath)) {
    const catDir = path.join(imagesDir, l.category);
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

    const destPath = path.join(catDir, l.file);
    fs.copyFileSync(srcPath, destPath);

    item.image = `/images/${l.category}/${l.file}`;
    linkedCount++;
    console.log(`Linked SKU ${l.sku} (${item.Name}) to ${item.image}`);
  } else {
    console.log(`Failed to link ${l.sku}: item found? ${!!item}, file exists? ${fs.existsSync(srcPath)} at ${srcPath}`);
  }
});

fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 4), 'utf-8');
console.log(`\nSuccessfully linked ${linkedCount} items.`);
