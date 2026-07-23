// scripts/link_all_images.js
const fs = require('fs');
const path = require('path');

const imagesDir = path.resolve(__dirname, '../frontend/public/images');
const legacyDir = path.join(imagesDir, '_legacy');
const menuPath = path.resolve(__dirname, '../frontend/src/assets/menu.json');

const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
const legacyFiles = fs.readdirSync(legacyDir).filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f));

// Explicit SKU mapping for specific items
const explicitMap = {
  'BV11': 'big-beer.webp',
  'BV10': 'small-beer.webp',
  'BV9': 'angkor-can.webp',
  'BV2': 'coke.webp',
  'BV3': 'coke.webp',
  'BV4': 'coke-zero.webp',
  'BV1': 'soft-drinks.webp',
  'FS1': 'fresh-fruit-slice.webp',
  'Dessert1': 'coconut-smoothie.webp',
  'B54': 'pan-cake-chocolate.webp',
  'B55': 'pan-cake-strawberry.webp',
  'B56': 'honey-pan-cake.webp',
  'B32': 'scrambled-egg-with-bread-and-hotdog.webp',
  'G24': 'mixed-stir-fried-meatball.webp',
  'G9': 'grilled-beef-with-rice.webp',
  'CKT1': 'pina.webp',
  'CKT3': 'blue-hawaii.webp',
  'CKT4': 'pina-colada.webp',
  'CKT5': 'blue-hawaii.webp',
  'CKT7': 'blue-hawaii.webp',
  'CKT8': 'blue-hawaii.webp',
  'W1': 'pina.webp',
  'M6': 'spaghetti-carbonara.webp',
  'M5': 'chicken-pasta.webp',
  'B40': 'spaghetti-tomato-sauce.webp',
  'VF2': 'amok.webp',
  'S9': 'vietnamese-sour-soup.webp',
  's8': 'tom-yam-with-shrimp.webp',
  's7': 'tom-yam-with-shrimp.webp',
  'ADD2': 'fried-rice-2.webp',
  'ADD4': 'cheese-burger-(beef-burger-with-cheese).webp',
  'ADD5': 'crispy-chicken-burger-with-cheese.webp',
  'ADD6': 'avocado-slice.webp'
};

const flavorMap = [
  { kw: 'blueberry', file: 'blueberry-smoothie.webp' },
  { kw: 'passion', file: 'passion-smoothie.webp' },
  { kw: 'lychee', file: 'lychee-smoothie.webp' },
  { kw: 'strawberry', file: 'strawberry-smoothie.webp' },
  { kw: 'mango', file: 'mango-smoothie.webp' },
  { kw: 'lemon', file: 'lemon-smoothie.webp' },
  { kw: 'grape', file: 'grape-smoothie.webp' },
  { kw: 'apple', file: 'apple.webp' },
  { kw: 'coconut', file: 'coconut-smoothie.webp' },
  { kw: 'durian', file: 'durian-smoothie.webp' },
  { kw: 'pineapple', file: 'pine-apple-smoothie.webp' },
  { kw: 'watermelon', file: 'water-melon-smoothie.webp' },
  { kw: 'water melon', file: 'water-melon-smoothie.webp' },
  { kw: 'papaya', file: 'papaya-smoothie.webp' },
  { kw: 'soursop', file: 'soursop-smoothie.webp' },
  { kw: 'jackfruit', file: 'jackfruit-smoothie.webp' },
  { kw: 'jack fruit', file: 'jackfruit-smoothie.webp' },
  { kw: 'avocado', file: 'avocado-smoothie.webp' },
  { kw: 'banana', file: 'banana-smoothie.webp' },
  { kw: 'pumpkin', file: 'pumpkin-coconut-milk.webp' },
  { kw: 'taro', file: 'taro-coconut-milk.webp' },
  { kw: 'coke', file: 'coke.webp' },
  { kw: 'coca', file: 'coke.webp' },
  { kw: 'beer', file: 'small-beer.webp' },
  { kw: 'angkor', file: 'angkor-can.webp' },
  { kw: 'soda', file: 'soda-water.webp' },
  { kw: 'water', file: 'small-water.webp' }
];

function cleanStr(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

let updatedCount = 0;

menuData.forEach(item => {
  const category = (item.Category || 'Uncategorized').trim();
  const catDir = path.join(imagesDir, category);
  if (!fs.existsSync(catDir)) {
    fs.mkdirSync(catDir, { recursive: true });
  }

  // If item already has a valid image path pointing to an existing file, keep it or verify it
  if (item.image && item.image.startsWith('/images/')) {
    const relFile = item.image.replace('/images/', '');
    const currentPath = path.join(imagesDir, relFile);
    if (fs.existsSync(currentPath)) {
      updatedCount++;
      return;
    }
  }

  let targetFileName = null;

  // 1. Explicit map
  if (explicitMap[item.SKU]) {
    targetFileName = explicitMap[item.SKU];
  }

  // 2. Match exact/clean name or SKU with files in _legacy or category dir
  if (!targetFileName) {
    const itemClean = cleanStr(item.Name);
    const itemSku = cleanStr(item.SKU);
    const itemHandle = cleanStr(item.Handle);

    targetFileName = legacyFiles.find(f => {
      const fClean = cleanStr(f.replace(/\.(webp|png|jpg|jpeg)$/i, ''));
      return fClean === itemClean || fClean === itemSku || fClean === itemHandle;
    });
  }

  // 3. Flavor map
  if (!targetFileName) {
    const lowerName = item.Name.toLowerCase();
    for (const f of flavorMap) {
      if (lowerName.includes(f.kw)) {
        targetFileName = f.file;
        break;
      }
    }
  }

  // 4. Category defaults
  if (!targetFileName) {
    if (category === 'Hot Drink') targetFileName = 'coke.webp';
    else if (category === 'Iced Drink') targetFileName = 'soda-water.webp';
    else if (category === 'Frappe') targetFileName = 'coconut-smoothie.webp';
    else if (category === 'Macchiato') targetFileName = 'grape-smoothie.webp';
    else if (category === 'Beverage') targetFileName = 'soda-water.webp';
    else if (category === 'Cocktails') targetFileName = 'blue-hawaii.webp';
    else targetFileName = 'fried-rice-2.webp';
  }

  if (targetFileName) {
    // Copy target file into category directory if not already present
    const categoryFilePath = path.join(catDir, targetFileName);
    if (!fs.existsSync(categoryFilePath)) {
      const legacyPath = path.join(legacyDir, targetFileName);
      if (fs.existsSync(legacyPath)) {
        fs.copyFileSync(legacyPath, categoryFilePath);
      } else {
        // Look in other category folders if present
        const found = fs.readdirSync(imagesDir).find(subDir => {
          const p = path.join(imagesDir, subDir, targetFileName);
          if (fs.existsSync(p) && fs.statSync(p).isFile()) {
            fs.copyFileSync(p, categoryFilePath);
            return true;
          }
          return false;
        });
      }
    }

    item.image = `/images/${category}/${targetFileName}`;
    updatedCount++;
  }
});

// Save menu.json
fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 4), 'utf-8');

console.log(`Successfully linked images for ${updatedCount}/${menuData.length} menu items.`);
