import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, 'Menu.csv');
const jsonPath = path.join(__dirname, 'src', 'assets', 'menu.json');

try {
  const csvData = fs.readFileSync(csvPath, 'utf8');

  // Parse the CSV
  const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length > 0) {
    const headers = lines[0].split(',').map(h => h.trim());
    const results = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const row = [];
      let curVal = "";
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(curVal.trim());
          curVal = "";
        } else {
          curVal += char;
        }
      }
      row.push(curVal.trim());

      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        // Only add if there is a header
        if (headers[j]) {
          obj[headers[j]] = row[j] || "";
        }
      }
      results.push(obj);
    }

    // Write to JSON
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 4));
    console.log('✅ Successfully updated src/assets/menu.json from your Excel CSV!');
  }
} catch (error) {
  console.error('❌ Error converting CSV to JSON:', error);
}
