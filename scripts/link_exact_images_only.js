// scripts/link_exact_images_only.js
const fs = require('fs');
const path = require('path');

const imagesDir = path.resolve(__dirname, '../frontend/public/images');
const legacyDir = path.join(imagesDir, '_legacy');
const menuPath = path.resolve(__dirname, '../frontend/src/assets/menu.json');

const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
const legacyFiles = fs.readdirSync(legacyDir).filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f));

// Exact mapping for items that have actual matching food photos in raw images
const exactPhotoMap = {
  // Amok
  's1': 'amok.webp',
  's2': 'amok-(2).webp',
  'VF2': 'amok.webp',
  
  // Beverages
  'BV9': 'angkor-can.webp',
  'BV8': 'cambodia-can.webp',
  'BV2': 'coke.webp',
  'BV3': 'coke.webp',
  'BV4': 'coke-zero.webp',
  'BV1': 'soft-drinks.webp',
  'big-water': 'big-water.webp',
  'small-water': 'small-water.webp',
  'BV11': 'big-beer.webp',
  'BV10': 'small-beer.webp',
  'tonic-water': 'tonic-water.webp',
  'soda-water': 'soda-water.webp',
  
  // Smoothies
  'D64': 'apple.webp',
  'D52': 'avocado-smoothie.webp',
  'D57': 'banana-smoothie.webp',
  'D56': 'blueberry-smoothie.webp',
  'D60': 'carrot-smoothie.webp',
  'D50': 'coconut-smoothie.webp',
  'D63': 'durian-smoothie.webp',
  'D53': 'grape-smoothie.webp',
  'D59': 'jackfruit-smoothie.webp',
  'D62': 'lemon-smoothie.webp',
  'D58': 'lychee-smoothie.webp',
  'D51': 'mango-smoothie.webp',
  'D66': 'mixed-fruit-smoothie.webp',
  'D55': 'papaya-smoothie.webp',
  'D54': 'passion-smoothie.webp',
  'D61': 'pine-apple-smoothie.webp',
  'D67': 'soursop-smoothie.webp',
  'D68': 'strawberry-&-lychee-smoothie.webp',
  'D65': 'strawberry-smoothie.webp',
  'D69': 'water-melon-smoothie.webp',
  'D70': 'winter-melon-smoothie.webp',
  
  // Desserts & Breakfast Pancakes
  'B54': 'pan-cake-chocolate.webp',
  'B55': 'pan-cake-strawberry.webp',
  'B56': 'honey-pan-cake.webp',
  'B57': 'coconut-cream-pan-cake.webp',
  'FS1': 'fresh-fruit-slice.webp',
  'Dessert4': 'banana-in-coconut-milk.webp',
  'Dessert3': 'pumpkin-coconut-milk.webp',
  'Dessert2': 'taro-coconut-milk.webp',
  'Dessert5': 'mango-sticky-rice.webp',

  // Burgers & Sandwiches
  'B46': 'beef-burger.webp',
  'B47': 'beef-burger-with-cheese-or-cheese-burger.webp',
  'B49': 'cheese-burger-with-fries.webp',
  'B43': 'chicken-burger.webp',
  'B48': 'chicken-burger-with-cheese.webp',
  'B51': 'chicken-burger-with-fries.webp',
  'B41': 'crispy-chicken-burger.webp',
  'B44': 'crispy-chicken-burger-with-cheese.webp',
  'B50': 'crispy-chicken-burger-with-cheese-and-fries.webp',
  'B42': 'crispy-fish-burger.webp',
  'B45': 'crispy-fish-burger-with-cheese.webp',
  'B53': 'crispy-chicken-sandwich.webp',
  'B52': 'ham-cheese-sandwich.webp',
  'B39': 'egg-sandwich-and-fries.webp',

  // Eggs & Breakfast
  'B60': 'avocado-slice.webp',
  'B33': 'fried-egg-with-bread.webp',
  'B34': '2-fried-egg-with-bread.webp',
  'B35': 'fried-egg-hotdog-and-bread.webp',
  'B36': 'scrambled-egg-with-bread.webp',
  'B37': 'scrambled-egg-with-bread-and-hotdog.webp',
  'B38': 'scrambled-egg-with-bread-and-hotdog-2.webp',
  'B58': 'french-fries.webp',
  'fries-2': 'fries-2.webp',

  // Noodle Soups & Pasta
  'B11': 'beef-noodle-soup.webp',
  'B12': 'chicken-noodle-soup.webp',
  'B14': 'shrimp-noodle-soup.webp',
  'B13': 'tofu-noodle-soup.webp',
  'B15': 'vegetable-noodle-soup.webp',
  'M7': 'chicken-pasta.webp',
  'M6': 'spaghetti-carbonara.webp',
  'spaghetti-tomato-sauce': 'spaghetti-tomato-sauce.webp',

  // Rice & Fried Rice & Lok Lak
  'F1': 'beef-lok-lak.webp',
  'F3': 'beef-lok-lak-with-fried-rice.webp',
  'F7': 'lok-lak-bok-choy-with-rice.webp',
  'F2': 'chicken-lok-lak-with-rice.webp',
  'F4': 'pork-lok-lak.webp',
  'F8': 'tofu-lok-lak.webp',
  'F5': 'beef-fried-rice.webp',
  'F6': 'chicken-fried-rice.webp',
  'F9': 'chicken-fried-rice-with-basil.webp',
  'F10': 'fried-rice-shrimp-with-basil.webp',
  'F11': 'fried-rice-with-sausage.webp',
  'F12': 'shrimp-paste-fried-rice.webp',
  'F13': 'shrimp-paste-fried-rice-golden-cafe.webp',
  'F14': 'pine-aple-fried-rice-with-tofu.webp',
  'F15': 'pine-apple-fried-rice-with-tofu-cashew-nut.webp',

  // Stir Fried & Noodles
  'B16': 'fried-yellow-noodle-beef.webp',
  'B17': 'fried-yellow-noodle-with-shrimp.webp',
  'B18': 'fried-yellow-noodle.webp',
  'B19': 'fried-glass-noodle-beef.webp',
  'B20': 'fried-glass-noodle-chicken.webp',
  'B21': 'fried-glass-noodle-with-shrimp.webp',
  'B22': 'fried-flat-noodle-egg.webp',
  'B23': 'flat-noodle-shrimp.webp',
  'B24': 'flat-noodle-tofu.webp',
  'B25': 'fried-instant-noodle-beef.webp',
  'B26': 'fried-instant-noodle.webp',
  'B27': 'lot-chha-chicken.webp',
  'B28': 'lot-chha-shrimp.webp',
  'B29': 'lot-chha.webp',
  'B30': 'pad-thai-shrimp.webp',
  'B31': 'pad-thai-tofu.webp',

  // Soups & Curries
  's3': 'shrimp-soup.webp',
  's4': 'tom-yam-with-shrimp.webp',
  's5': 'red-curry.webp',
  's6': 'green-curry.webp',
  'S10': 'chicken-with-fermented-lime.webp',
  'S11': 'samlor-kor-ko.webp',
  'S12': 'vietnamese-sour-soup.webp',
  'S13': 'pumpkin-soup-with-bread.webp',
  'S14': 'tomato-soup-with-bread.webp',
  'S15': 'wonton-soup.webp',

  // Salads & Starters
  'K1': 'green-mango-salad-with-shrimp.webp',
  'K2': 'green-mango-salad-with-smoked-fish.webp',
  'K4': 'green-mango-salad-with-tofu.webp',
  'K5': 'green-papaya-salad-with-shrimp.webp',
  'K6': 'green-papaya-salad-with-tofu.webp',
  'K7': 'glass-noodle-salad-with-shrimp.webp',
  'K8': 'glass-noodle-salad-with-chicken.webp',
  'K9': 'glass-noodle-salad-with-pork.webp',
  'K10': 'glass-noodle-salad-with-seafood.webp',
  'K11': 'mixed-salad-with-chicken.webp',
  'K12': 'mixed-vegetable-salad.webp',
  'K13': 'khmer-beef-salad.webp',
  'K14': 'khmer-shrimp-salad.webp',
  'K15': 'beef-lab.webp',
  'K16': 'pork-lab.webp',
  'K17': 'spicy-beef.webp',

  // Grilled & Deep Fried
  'G1': 'grilled-pork-with-rice.webp',
  'G2': 'grilled-chicken-with-rice.webp',
  'G3': 'grilled-beef-with-rice.webp',
  'G4': 'deep-fried-chicken-with-rice.webp',
  'G5': 'deep-fried-fish-with-rice.webp',
  'G6': 'deep-fried-fish-fillet-with-rice.webp',
  'G7': 'grilled-mackerel-fish-with-spicy-sauce.webp',
  'G8': 'chicken-bbq.webp',
  'G10': 'grilled-beef-with-khmer-fish-cheese.webp',
  'G11': 'grilled-khmer-fish-cheese.webp',
  'G12': 'fried-khmer-fish-cheese.webp',
  'G13': 'deep-fried-khmer-fish-cheese.webp',
  'G14': 'chicken-steak.webp',
  'G15': 'fish-and-chips.webp',
  'G16': 'chicken-and-chips.webp',
  'G17': 'two-deep-fried-chicken.webp',
  'G18': 'deep-fried-chick-drumstick.webp',
  'G19': 'fried-spring-rolls.webp',
  'G20': 'chicken-spring-rolls.webp',
  'G21': 'shrimp-spring-rolls.webp',
  'G22': 'deep-fried-wonton.webp',
  'G23': 'deep-fried-shrimp-with-flour.webp',
  'G25': 'deep-fried-hotdog-flour.webp',
  'G26': 'deep-fried-mushroom.webp',
  'G27': 'deep-fried-tofu.webp',
  'G28': 'onion-ring.webp',
  'G29': 'chive-cake.webp',
  
  // Cocktails
  'CKT2': 'blue-hawaii.webp',
  'CKT6': 'pina-colada.webp'
};

let matchedCount = 0;
let emptyCount = 0;

menuData.forEach(item => {
  let matchedFile = null;

  if (exactPhotoMap[item.SKU]) {
    matchedFile = exactPhotoMap[item.SKU];
  } else if (exactPhotoMap[item.Handle]) {
    matchedFile = exactPhotoMap[item.Handle];
  }

  // Check if legacy file clean name matches item clean name exactly
  if (!matchedFile) {
    const itemClean = item.Name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = legacyFiles.find(f => f.toLowerCase().replace(/\.(webp|png|jpg|jpeg)$/i, '').replace(/[^a-z0-9]/g, '') === itemClean);
    if (found) matchedFile = found;
  }

  if (matchedFile) {
    const cat = (item.Category || 'Uncategorized').trim();
    const catDir = path.join(imagesDir, cat);
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

    // Copy to category folder if needed
    const dest = path.join(catDir, matchedFile);
    if (!fs.existsSync(dest)) {
      const src = path.join(legacyDir, matchedFile);
      if (fs.existsSync(src)) fs.copyFileSync(src, dest);
    }

    item.image = `/images/${cat}/${matchedFile}`;
    matchedCount++;
  } else {
    // Leave EMPTY — no random fallback images!
    item.image = '';
    emptyCount++;
  }
});

// Save updated menu.json
fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 4), 'utf-8');

console.log(`Updated menu.json:`);
console.log(`  - Real photo matches linked: ${matchedCount}`);
console.log(`  - Items left empty (no random image): ${emptyCount}`);
