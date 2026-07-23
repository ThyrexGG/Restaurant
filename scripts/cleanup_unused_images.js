// scripts/cleanup_unused_images.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const menuPath = path.resolve(root, 'frontend/src/assets/menu.json');
const imagesDir = path.resolve(root, 'frontend/public/images');
const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));

// Collect all referenced image paths from menu.json
const referencedPaths = new Set();
menuData.forEach(item => {
  if (item.image) {
    // Normalize path to lowercase with forward slashes for matching
    referencedPaths.add(item.image.trim().toLowerCase());
  }
});

console.log(`Referenced images count: ${referencedPaths.size}`);

// Get all files in frontend/public/images/
function getAllFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      // Skip the legacy folder to keep original legacy files safe if needed,
      // but scan everything else.
      if (f !== '_legacy') {
        results = results.concat(getAllFiles(p));
      }
    } else {
      results.push(p);
    }
  });
  return results;
}

const allPublicImages = getAllFiles(imagesDir);
let deletedCount = 0;

allPublicImages.forEach(filePath => {
  // Convert absolute file path to relative /images/... url format
  const relativePath = filePath
    .replace(path.resolve(root, 'frontend/public'), '')
    .replace(/\\/g, '/')
    .toLowerCase();

  // If this public image file is not in our referenced set, delete it!
  if (!referencedPaths.has(relativePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted unused image file: ${relativePath}`);
    deletedCount++;
  }
});

console.log(`\nCleanup complete:`);
console.log(`  - Deleted ${deletedCount} unused image files from public directory.`);
