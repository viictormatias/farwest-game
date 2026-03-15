const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIR = './public/images/items';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.webp'));
const byHash = new Map();

for (const f of files) {
  const buf = fs.readFileSync(path.join(DIR, f));
  const hash = crypto.createHash('md5').update(buf).digest('hex');
  const list = byHash.get(hash) || [];
  list.push(f);
  byHash.set(hash, list);
}

const duplicates = [];
for (const [hash, list] of byHash.entries()) {
  if (list.length > 1) {
    duplicates.push({ hash, files: list.sort() });
  }
}

if (duplicates.length === 0) {
  console.log('NO_DUPLICATES');
  process.exit(0);
}

const out = duplicates.map(d => `HASH ${d.hash}\n  - ${d.files.join('\n  - ')}\n`).join('\n');
fs.writeFileSync('tmp/duplicate-items.txt', out);
console.log(`DUPLICATES ${duplicates.length}`);
