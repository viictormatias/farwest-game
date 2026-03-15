import fs from 'fs';
import path from 'path';

const itemsFile = 'src/lib/items.ts';
const itemsImagesDir = 'public/images/items';
const archiveDir = 'public/images/items/archives_unused';

if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
}

const content = fs.readFileSync(itemsFile, 'utf8');

// Also catch dynamic paths like `/images/items/${aliasId}_realistic.webp`
// But actually, for static analysis, we look for string literals.
// However, the items.ts now has many image_url = undefined or specific paths.

const files = fs.readdirSync(itemsImagesDir).filter(f => f.endsWith('.webp'));
let movedCount = 0;

files.forEach(file => {
    // Check if the filename (without extension) exists in the items.ts
    // We search for the filename because some paths are dynamic but use the ID.
    const nameWithoutExt = file.replace('.webp', '');
    
    // We search for the filename or the full path
    if (!content.includes(file) && !content.includes(nameWithoutExt)) {
        const oldPath = path.join(itemsImagesDir, file);
        const newPath = path.join(archiveDir, file);
        fs.renameSync(oldPath, newPath);
        console.log(`Moved unused image: ${file}`);
        movedCount++;
    }
});

console.log(`Finished. Moved ${movedCount} unused images to ${archiveDir}`);
