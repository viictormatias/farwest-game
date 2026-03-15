const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = 'c:/Users/Victor/Documents/GitHub/far-west';
const DIR = path.join(ROOT, 'public/images/items');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.webp')).sort();
const byHash = new Map();

for (const f of files) {
  const fp = path.join(DIR, f);
  const buf = fs.readFileSync(fp);
  const hash = crypto.createHash('md5').update(buf).digest('hex');
  const list = byHash.get(hash) || [];
  list.push(f);
  byHash.set(hash, list);
}

const toRemove = [];
for (const list of byHash.values()) {
  if (list.length > 1) {
    const keep = list[0];
    for (const f of list.slice(1)) toRemove.push(f);
  }
}

const logPath = path.join(ROOT, 'tmp/duplicates-removed.txt');
if (toRemove.length === 0) {
  fs.writeFileSync(logPath, 'NO_DUPLICATES');
  console.log('NO_DUPLICATES');
  process.exit(0);
}

for (const f of toRemove) {
  fs.unlinkSync(path.join(DIR, f));
}

fs.writeFileSync(logPath, toRemove.join('\n'));
console.log(`REMOVED ${toRemove.length}`);
