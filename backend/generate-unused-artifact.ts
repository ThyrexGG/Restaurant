import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();
const artifactPath = path.join(process.env.APPDATA || 'C:\\Users\\Asus\\.gemini\\antigravity-ide', 'brain', '4c6912f5-3ccf-42f7-a3c2-a6816a145fb8', 'unused_images.md');

async function main() {
  const items = await prisma.menuItem.findMany();
  
  const files = fs.readdirSync('../frontend/public/images');
  const usedImages = items.map(i => i.image?.replace('/images/', '')).filter(Boolean);
  
  // Filter out used images, gemini images, and duplicate patterns (-2 or -(2))
  const unused = files.filter(f => {
    if (usedImages.includes(f)) return false;
    if (f.startsWith('gemini')) return false;
    if (f.includes('-2.webp') || f.includes('-(2).webp')) return false;
    return true;
  });
  
  let md = `# Unused Images (Cleaned)\n\nThese are the unique images currently sitting in your \`/images\` folder that are NOT mapped to any menu item yet. (I have hidden all the duplicate backup photos like \`-2\` to make this list easier to check!)\n\n`;
  for (const f of unused) {
    md += `- \`${f}\`\n`;
  }
  
  console.log(md);
}

main().catch(console.error).finally(() => prisma.$disconnect());
