import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#0f172a"/>
  <path d="M140 250 L220 330 L370 180" stroke="#f59e0b" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>
`;

async function generate() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  const svgBuffer = Buffer.from(svgIcon);

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
    
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
    
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
  fs.writeFileSync(path.join(publicDir, 'mask-icon.svg'), svgIcon);
  
  console.log('Icons generated successfully!');
}

generate().catch(console.error);
