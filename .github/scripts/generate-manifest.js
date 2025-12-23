const fs = require('fs');
const path = require('path');

const assetsDir = 'assets';
const manifestPath = path.join(assetsDir, 'manifest.json');

const files = fs.readdirSync(assetsDir);

const imageFiles = files.filter(file => {
  const extension = path.extname(file).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension);
});

const manifest = imageFiles.map(file => path.join(assetsDir, file).replace(/\\/g, '/'));

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`Manifest generated with ${manifest.length} images.`);
