import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const USED_DIR = './public/images/items';
const usedHashes = new Set();
if (fs.existsSync(USED_DIR)) {
    for (const f of fs.readdirSync(USED_DIR)) {
        if (!f.endsWith('.webp')) continue;
        const buf = fs.readFileSync(path.join(USED_DIR, f));
        usedHashes.add(crypto.createHash('md5').update(buf).digest('hex'));
    }
}

const unusedFiles = fs.readFileSync('tmp/all_unused.txt', 'utf8').split('\n').filter(Boolean);
const remaining = [];

for (let i = 0; i < unusedFiles.length; i++) {
    const f = unusedFiles[i].trim().replace(/\\/g, '/');
    if (!f.endsWith('.webp')) continue;
    try {
        const buf = fs.readFileSync(f);
        const h = crypto.createHash('md5').update(buf).digest('hex');
        if (!usedHashes.has(h)) {
            remaining.push(f);
            usedHashes.add(h);
        }
    } catch(e) {}
}

fs.writeFileSync('tmp/remaining_unique.txt', remaining.join('\n'), 'utf8');
console.log(`Remaining unique unmapped files: ${remaining.length}`);
