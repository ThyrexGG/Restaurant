const fs = require('fs');
const path = require('path');

// Resolve sharp from backend node_modules
const sharpPath = require.resolve('sharp', { paths: [path.resolve(__dirname, '../backend')] });
const sharp = require(sharpPath);

const rootDir = path.resolve(__dirname, '..');
const imagesDir = path.resolve(rootDir, 'frontend/public/images');
const menuPath = path.resolve(rootDir, 'frontend/src/assets/menu.json');
const menuBackupPath = path.resolve(rootDir, 'frontend/src/assets/menu.backup-before-webp.json');

async function run() {
  console.log('Starting WebP conversion and optimization...');

  // 1. Backup menu.json
  if (fs.existsSync(menuPath)) {
    fs.copyFileSync(menuPath, menuBackupPath);
    console.log(`Backed up menu.json to: ${menuBackupPath}`);
  }

  // 2. Remove _legacy directory if it exists
  const legacyDir = path.resolve(imagesDir, '_legacy');
  if (fs.existsSync(legacyDir)) {
    console.log(`Removing unused legacy directory: ${legacyDir}`);
    fs.rmSync(legacyDir, { recursive: true, force: true });
    console.log('Removed _legacy directory.');
  }

  // 3. Find all images to convert
  const supportedExts = new Set(['.png', '.jpg', '.jpeg', '.jfif']);
  
  function getFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(getFiles(fullPath));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (supportedExts.has(ext)) {
          results.push(fullPath);
        }
      }
    }
    return results;
  }

  const filesToConvert = getFiles(imagesDir);
  console.log(`Found ${filesToConvert.length} images to convert.`);

  let totalOriginalBytes = 0;
  let totalNewBytes = 0;
  let convertedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < filesToConvert.length; i++) {
    const file = filesToConvert[i];
    const ext = path.extname(file);
    const targetFile = file.slice(0, -ext.length) + '.webp';
    const originalStat = fs.statSync(file);
    totalOriginalBytes += originalStat.size;

    try {
      await sharp(file)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toFile(targetFile);

      const newStat = fs.statSync(targetFile);
      totalNewBytes += newStat.size;

      // Remove the original file if target exists and is valid
      if (newStat.size > 0) {
        fs.unlinkSync(file);
        convertedCount++;
      } else {
        throw new Error('Converted file has 0 bytes');
      }

      if ((i + 1) % 50 === 0 || i === filesToConvert.length - 1) {
        console.log(`Converted ${i + 1}/${filesToConvert.length} images...`);
      }
    } catch (err) {
      console.error(`Failed to convert ${file}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\nConversion finished:`);
  console.log(`Successfully converted: ${convertedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Original size: ${(totalOriginalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`New size: ${(totalNewBytes / 1024 / 1024).toFixed(2)} MB`);
  const savings = totalOriginalBytes > 0 ? ((1 - totalNewBytes / totalOriginalBytes) * 100).toFixed(1) : 0;
  console.log(`Total space saved: ${savings}%`);

  // 4. Update menu.json
  if (fs.existsSync(menuPath)) {
    console.log('\nUpdating menu.json with .webp paths...');
    const menuRaw = fs.readFileSync(menuPath, 'utf8');
    const menuData = JSON.parse(menuRaw);
    let updatedPaths = 0;

    menuData.forEach(item => {
      if (item.image) {
        const ext = path.extname(item.image).toLowerCase();
        if (supportedExts.has(ext)) {
          item.image = item.image.slice(0, -ext.length) + '.webp';
          updatedPaths++;
        }
      }
    });

    fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 4), 'utf8');
    console.log(`Updated ${updatedPaths} image paths in menu.json.`);
  }

  console.log('\nAll operations completed successfully!');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
