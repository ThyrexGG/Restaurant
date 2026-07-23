// Organize ALL images into category subfolders.
// 1. Read menu.json to build a Name→Category map
// 2. For each loose image file in images/, find its category and move it
// 3. Update menu.json with the new image paths
// 4. Create _legacy backup first

const fs = require('fs');
const path = require('path');

const imagesDir = path.resolve(__dirname, '../frontend/public/images');
const backupDir = path.join(imagesDir, '_legacy');
const menuPath = path.resolve(__dirname, '../frontend/src/assets/menu.json');

// Create backup if not exists
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

// Get all loose image files (not in subdirectories)
const allLooseFiles = fs.readdirSync(imagesDir).filter(f => {
  const full = path.join(imagesDir, f);
  return fs.statSync(full).isFile() && /\.(webp|png|jpg|jpeg)$/i.test(f);
});

console.log(`Found ${allLooseFiles.length} loose image files to organize`);

// Backup all loose files
allLooseFiles.forEach(file => {
  const src = path.join(imagesDir, file);
  const dest = path.join(backupDir, file);
  if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
});
console.log(`Backed up to _legacy/`);

// Load menu
const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));

// Build a slug→category map from menu items
function slugify(name) {
  return name.toLowerCase()
    .replace(/[&\/]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Build multiple lookup maps for fuzzy matching
const nameToCategory = {};
const slugToCategory = {};
const slugToName = {};

menuData.forEach(item => {
  const name = item.Name;
  const cat = item.Category;
  const slug = slugify(name);
  nameToCategory[name] = cat;
  slugToCategory[slug] = cat;
  slugToName[slug] = name;
});

// Get all unique categories
const categories = [...new Set(menuData.map(i => i.Category))];
console.log(`Categories: ${categories.join(', ')}`);

// Create all category folders
categories.forEach(cat => {
  const catDir = path.join(imagesDir, cat);
  if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });
});

// Try to match each file to a menu item
function findCategoryForFile(filename) {
  const base = filename.replace(/\.(webp|png|jpg|jpeg)$/i, '').toLowerCase();
  
  // Direct slug match
  if (slugToCategory[base]) return slugToCategory[base];
  
  // Try removing trailing numbers like "-2", "-3"
  const withoutTrailing = base.replace(/-\d+$/, '');
  if (slugToCategory[withoutTrailing]) return slugToCategory[withoutTrailing];
  
  // Try matching by checking if slug contains file base or vice versa
  for (const [slug, cat] of Object.entries(slugToCategory)) {
    if (slug.includes(base) || base.includes(slug)) return cat;
  }
  
  // Try partial match - at least 3 words in common
  const fileWords = base.split('-').filter(w => w.length > 1);
  let bestMatch = null;
  let bestScore = 0;
  
  for (const [slug, cat] of Object.entries(slugToCategory)) {
    const slugWords = slug.split('-').filter(w => w.length > 1);
    const common = fileWords.filter(w => slugWords.includes(w));
    if (common.length > bestScore && common.length >= 2) {
      bestScore = common.length;
      bestMatch = cat;
    }
  }
  
  return bestMatch;
}

// Move files and track results
const moved = [];
const unmatched = [];

allLooseFiles.forEach(file => {
  const cat = findCategoryForFile(file);
  if (cat) {
    const src = path.join(imagesDir, file);
    const dest = path.join(imagesDir, cat, file);
    if (fs.existsSync(src)) {
      fs.renameSync(src, dest);
      moved.push({ file, category: cat });
    }
  } else {
    unmatched.push(file);
  }
});

console.log(`\nMoved ${moved.length} files into category folders`);
moved.forEach(m => console.log(`  ${m.file} -> ${m.category}/`));

if (unmatched.length > 0) {
  console.log(`\n${unmatched.length} files could not be matched:`);
  unmatched.forEach(f => console.log(`  ${f}`));
}

// Now update menu.json: for each item, find its image file in its category folder
menuData.forEach(item => {
  const cat = item.Category;
  const catDir = path.join(imagesDir, cat);
  if (!fs.existsSync(catDir)) return;
  
  const filesInCat = fs.readdirSync(catDir).filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f));
  const slug = slugify(item.Name);
  
  // Try to find matching file
  let match = filesInCat.find(f => {
    const fBase = f.replace(/\.(webp|png|jpg|jpeg)$/i, '').toLowerCase();
    return fBase === slug || fBase.includes(slug) || slug.includes(fBase);
  });
  
  // Try partial match
  if (!match) {
    const words = slug.split('-').filter(w => w.length > 1);
    let bestFile = null;
    let bestScore = 0;
    for (const f of filesInCat) {
      const fBase = f.replace(/\.(webp|png|jpg|jpeg)$/i, '').toLowerCase();
      const fWords = fBase.split('-').filter(w => w.length > 1);
      const common = words.filter(w => fWords.includes(w));
      if (common.length > bestScore && common.length >= 2) {
        bestScore = common.length;
        bestFile = f;
      }
    }
    match = bestFile;
  }
  
  if (match) {
    item.image = `/images/${cat}/${match}`;
  }
});

// Write updated menu.json
fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 4), 'utf-8');
console.log('\nMenu JSON updated with new image paths.');

// Summary of category folder contents
console.log('\n=== Category Folder Summary ===');
categories.forEach(cat => {
  const catDir = path.join(imagesDir, cat);
  if (fs.existsSync(catDir)) {
    const count = fs.readdirSync(catDir).filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f)).length;
    console.log(`  ${cat}: ${count} images`);
  }
});

// Check remaining loose files
const remaining = fs.readdirSync(imagesDir).filter(f => {
  const full = path.join(imagesDir, f);
  return fs.statSync(full).isFile() && /\.(webp|png|jpg|jpeg)$/i.test(f);
});
console.log(`\nRemaining loose files: ${remaining.length}`);
remaining.forEach(f => console.log(`  ${f}`));
