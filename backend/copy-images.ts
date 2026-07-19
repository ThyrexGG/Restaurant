import fs from 'fs';
import path from 'path';

const rawGrape = path.join(process.cwd(), 'raw-images', 'Grape Smoothie.png');
const rawStrawLych = path.join(process.cwd(), 'raw-images', 'Strawberry & Lychee Smoothie.png');

const destGrape = path.join(process.cwd(), '..', 'frontend', 'public', 'images', 'grape-smoothie.png');
const destStrawLych = path.join(process.cwd(), '..', 'frontend', 'public', 'images', 'strawberry-lychee-smoothie.png');

fs.copyFileSync(rawGrape, destGrape);
fs.copyFileSync(rawStrawLych, destStrawLych);

console.log('Copied user images over the AI ones!');
