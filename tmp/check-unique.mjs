import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const USED_DIR = './public/images/items';
const PENDING_DIR = './IMAGENS-NAO-USADAS';

const usedHashes = new Set();
if (fs.existsSync(USED_DIR)) {
    for (const f of fs.readdirSync(USED_DIR)) {
        if (!f.endsWith('.webp')) continue;
        const buf = fs.readFileSync(path.join(USED_DIR, f));
        usedHashes.add(crypto.createHash('md5').update(buf).digest('hex'));
    }
}
console.log(`Hashes already in use: ${usedHashes.size}`);

const unusedFiles = fs.readFileSync('tmp/all_unused.txt', 'utf8').split('\n').filter(Boolean);
const availableUnique = [];

for (let i = 0; i < unusedFiles.length; i++) {
    const f = unusedFiles[i].trim().replace(/\\/g, '/');
    if (!f.endsWith('.webp')) continue;
    try {
        const buf = fs.readFileSync(f);
        const h = crypto.createHash('md5').update(buf).digest('hex');
        if (!usedHashes.has(h)) {
            availableUnique.push({ path: f, hash: h });
            usedHashes.add(h); // mark as used so we don't count duplicates within the unused folder itself
        }
    } catch(e) {}
}

console.log(`Brand new visually UNIQUE images available: ${availableUnique.length}`);
