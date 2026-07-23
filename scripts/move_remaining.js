// Move remaining unmatched files into their correct categories manually
const fs = require('fs');
const path = require('path');

const imagesDir = path.resolve(__dirname, '../frontend/public/images');

// Manual mapping for the 37 remaining files
const manualMap = {
  // Soup category
  'amok-(2).webp': 'Soup',
  
  // Beverage category
  'big-beer.webp': 'Beverage',
  'small-beer.webp': 'Beverage',
  'coke-zero.webp': 'Beverage',
  'coke.webp': 'Beverage',
  'soft-drinks.webp': 'Beverage',
  'tonic-water.webp': 'Beverage',
  
  // Stir-fried category
  'brocoli-chicken-2.webp': 'Stir-fried',
  'egg-plant-shrimp.webp': 'Stir-fried',
  
  // Fried Rice / Noodle
  'pad-thai-shrimp.webp': 'Fried Noodle',
  'lot-chha.webp': 'Fried Noodle',
  'lot-chha-chicken.webp': 'Fried Noodle',
  'lot-chha-shrimp.webp': 'Fried Noodle',
  
  // Breakfast
  'fries-2.webp': 'Breakfast',
  'spaghetti-carbonara.webp': 'Breakfast',
  '482253029_636780205969231_2615569172713344013_n.webp': 'Breakfast',
  'img_20251201_000057.webp': 'Breakfast',
  
  // Smoothie
  'jackfruit-smoothie.webp': 'Smoothie',
  
  // Dessert
  'honey-pan-cake.webp': 'Dessert',
  'pan-cake-chocolate.webp': 'Dessert',
  'pan-cake-strawberry.webp': 'Dessert',
  'fresh-fruit-slice.webp': 'Dessert',
  
  // Cocktails
  'pina-colada.webp': 'Cocktails',
  
  // Salad
  'wester-salad.webp': 'Salad',
  
  // Gemini generated images -> put in a _generated subfolder (not linked to menu)
  'gemini_generated_image_6ypzxv6ypzxv6ypz.webp': '_generated',
  'gemini_generated_image_go7m3qgo7m3qgo7m.webp': '_generated',
  'gemini_generated_image_grvqbtgrvqbtgrvq.webp': '_generated',
  'gemini_generated_image_jmo6nsjmo6nsjmo6.webp': '_generated',
  'gemini_generated_image_kajaawkajaawkaja.webp': '_generated',
  'gemini_generated_image_l3gnv6l3gnv6l3gn.webp': '_generated',
  'gemini_generated_image_o9seugo9seugo9se.webp': '_generated',
  'gemini_generated_image_sanw8nsanw8nsanw.webp': '_generated',
  'gemini_generated_image_v5dcbgv5dcbgv5dc.webp': '_generated',
  'gemini_generated_image_vss19pvss19pvss1.webp': '_generated',
  'gemini_generated_image_xp9p75xp9p75xp9p.webp': '_generated',
  'gemini_generated_image_yrriefyrriefyrri.webp': '_generated',
  'gemini_generated_image_ziioahziioahziio.webp': '_generated',
};

let movedCount = 0;
for (const [file, category] of Object.entries(manualMap)) {
  const src = path.join(imagesDir, file);
  const catDir = path.join(imagesDir, category);
  const dest = path.join(catDir, file);
  
  if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });
  
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${file} -> ${category}/`);
    movedCount++;
  } else {
    console.log(`Skipped ${file} (not found)`);
  }
}

console.log(`\nDone. Moved ${movedCount} remaining files.`);

// Verify no loose files remain
const remaining = fs.readdirSync(imagesDir).filter(f => {
  const full = path.join(imagesDir, f);
  return fs.statSync(full).isFile() && /\.(webp|png|jpg|jpeg)$/i.test(f);
});
console.log(`Remaining loose files: ${remaining.length}`);
remaining.forEach(f => console.log(`  ${f}`));
