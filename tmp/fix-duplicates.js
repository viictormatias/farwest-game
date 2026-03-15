const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = 'c:/Users/Victor/Documents/GitHub/far-west';
const PUBLIC_DIR = path.join(ROOT, 'public/images/items');
const UNUSED_ROOT = path.join(ROOT, 'IMAGENS-NAO-USADAS');

function md5(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buf).digest('hex');
}

function classify(filePath) {
  const name = path.basename(filePath).toLowerCase();
  const full = filePath.toLowerCase();

  if (name.includes('relic') || full.includes('relic') || name.includes('medallion') || name.includes('coin') || name.includes('crate') || name.includes('box')) return 'relic';
  if (full.includes('weapon') || full.includes('rifle') || full.includes('revolver') || full.includes('pistol') || full.includes('gun') || full.includes('sawed') || full.includes('escopeta') || full.includes('carabina')) return 'weapon';
  if (full.includes('shield') || full.includes('buckler') || full.includes('bandolier') || full.includes('bracer')) return 'shield';
  if (full.includes('helmet') || full.includes('hat') || full.includes('mask') || full.includes('chapeu')) return 'helmet';
  if (full.includes('chest') || full.includes('coat') || full.includes('vest') || full.includes('poncho') || full.includes('duster') || full.includes('jaqueta')) return 'chest';
  if (full.includes('glove') || full.includes('luva')) return 'gloves';
  if (full.includes('legs') || full.includes('pants') || full.includes('calca') || full.includes('calça') || full.includes('chaps') || full.includes('greaves')) return 'legs';
  if (full.includes('boot') || full.includes('bota')) return 'boots';

  if (full.includes('outfit') || full.includes('armor') || full.includes('clothing')) return 'generic_clothing';
  return 'generic';
}

// Build hash map of current public items
const publicFiles = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.webp'));
const byHash = new Map();
const publicHashes = new Set();

for (const f of publicFiles) {
  const fp = path.join(PUBLIC_DIR, f);
  const h = md5(fp);
  publicHashes.add(h);
  const list = byHash.get(h) || [];
  list.push(f);
  byHash.set(h, list);
}

// Collect duplicates
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

// Build pool of unused unique images
const pools = {
  weapon: [],
  shield: [],
  helmet: [],
  chest: [],
  gloves: [],
  legs: [],
  boots: [],
  relic: [],
  generic_clothing: [],
  generic: []
};

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.webp')) {
      const h = md5(full);
      if (publicHashes.has(h)) continue;
      const cat = classify(full);
      pools[cat].push({ path: full, hash: h });
      publicHashes.add(h);
    }
  }
}
scan(UNUSED_ROOT);

const needed = duplicates.reduce((sum, d) => sum + (d.files.length - 1), 0);
const available = Object.values(pools).reduce((sum, list) => sum + list.length, 0);

if (available < needed) {
  console.log(`INSUFFICIENT_POOL ${available} < ${needed}`);
}

function takeFromPool(cat) {
  if (pools[cat] && pools[cat].length > 0) return pools[cat].shift();
  return null;
}

function getCategoryForItemFilename(name) {
  const lower = name.toLowerCase();
  if (lower.includes('relic')) return 'relic';
  if (lower.includes('weapon')) return 'weapon';
  if (lower.includes('shield')) return 'shield';
  if (lower.includes('helmet')) return 'helmet';
  if (lower.includes('chest')) return 'chest';
  if (lower.includes('gloves')) return 'gloves';
  if (lower.includes('legs')) return 'legs';
  if (lower.includes('boots')) return 'boots';
  // base item names
  if (lower.includes('gloves')) return 'gloves';
  if (lower.includes('pants')) return 'legs';
  if (lower.includes('boots')) return 'boots';
  return 'generic_clothing';
}

const log = [];
for (const group of duplicates) {
  const keep = group.files[0];
  const replace = group.files.slice(1);
  for (const target of replace) {
    const cat = getCategoryForItemFilename(target);
    let pick = takeFromPool(cat);
    if (!pick && cat !== 'generic_clothing') pick = takeFromPool('generic_clothing');
    if (!pick) pick = takeFromPool('generic');
    if (!pick) {
      log.push(`NO_SOURCE_FOR ${target}`);
      continue;
    }
    const dest = path.join(PUBLIC_DIR, target);
    fs.copyFileSync(pick.path, dest);
    log.push(`REPLACED ${target} <= ${pick.path}`);
  }
}

fs.writeFileSync(path.join(ROOT, 'tmp/duplicate-fix-log.txt'), log.join('\n'));
console.log(`DONE ${log.length}`);
