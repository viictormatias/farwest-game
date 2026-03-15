import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const USED_DIR = './public/images/items';
const PENDING_DIR = './IMAGENS-NAO-USADAS';

// Target Sets
const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const SLOTS = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'shield'];
const ARCHETYPES = {
    'pistoleiro_estrada': 'agile', 'forasteiro_po': 'lawman', 'garimpeiro_cobre': 'tank',
    'rastreador_canyon': 'lawman', 'mercenario_fronteira': 'tank', 'pregador_cinzento': 'lawman',
    'cacador_recompensas': 'agile', 'bandoleiro_sombrio': 'agile', 'guarda_velha': 'tank',
    'duelista_carmesim': 'agile', 'guardiao_aco': 'tank', 'xama_tormenta': 'lawman',
    'xerife_lendario': 'lawman', 'fantasma_deserto': 'agile', 'lobo_tempestade': 'tank'
};

const usedHashes = new Set();
if (fs.existsSync(USED_DIR)) {
    const list = fs.readdirSync(USED_DIR);
    for (const f of list) {
        if (!f.endsWith('.webp')) continue;
        const buf = fs.readFileSync(path.join(USED_DIR, f));
        usedHashes.add(crypto.createHash('md5').update(buf).digest('hex'));
    }
}

const allPendingFiles = [];
function scanAll(dir) {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            scanAll(fullPath);
        } else if (f.match(/\.(webp|jpg|png|jpeg)$/i)) {
            allPendingFiles.push(fullPath);
        }
    }
}
scanAll(PENDING_DIR);

let exactMatches = 0;
const genericPending = [];

// 1. Exact Match Priority
for (const p of allPendingFiles) {
    const base = path.basename(p); // e.g., bandoleiro_sombrio_rare_boots_realistic.webp
    const expectedDest = path.join(USED_DIR, base);
    
    // Check if destiny exists and is missing in public
    if (!fs.existsSync(expectedDest)) {
        // Is it part of the expected sets or items.ts list?
        // Since it's in unused but matches exactly a needed name, copy it.
        // Actually, let's just copy it if it looks like an item item_id_realistic.webp
        if (base.includes('_realistic') || base.includes('boots') || base.includes('chest') || base.includes('weapon') || base.includes('helmet') || base.includes('gloves') || base.includes('legs') || base.includes('shield')) {
            const buf = fs.readFileSync(p);
            const hash = crypto.createHash('md5').update(buf).digest('hex');
            if (!usedHashes.has(hash)) {
                fs.copyFileSync(p, expectedDest);
                usedHashes.add(hash);
                exactMatches++;
                continue;
            }
        }
    }
    
    // Fallback to generic pool
    genericPending.push(p);
}

console.log(`Matched ${exactMatches} exact file names.`);

// 2. Generic Classification
const pools = {
    weapon_agile: [], weapon_tank: [], weapon_lawman: [],
    helmet: [], chest: [], gloves: [], legs: [], boots: [], shield: [],
    generic_weapon: [], generic_clothing: []
};

function classifyFile(filePath) {
    const full = filePath.toLowerCase();
    if (full.includes('revolver') || full.includes('pistol') || full.includes('agile')) return 'weapon_agile';
    if (full.includes('shotgun') || full.includes('escopeta') || full.includes('tank')) return 'weapon_tank';
    if (full.includes('rifle') || full.includes('carabina') || full.includes('lawman') || full.includes('sniper')) return 'weapon_lawman';
    if (full.includes('weapon') || full.includes('arma') || full.includes('gun')) return 'generic_weapon';

    if (full.includes('boot') || full.includes('shoe') || full.includes('bota')) return 'boots';
    if (full.includes('glove') || full.includes('luva') || full.includes('hand')) return 'gloves';
    if (full.includes('hat') || full.includes('helmet') || full.includes('chapeu') || full.includes('head')) return 'helmet';
    if (full.includes('chest') || full.includes('coat') || full.includes('shirt') || full.includes('torso') || full.includes('colete') || full.includes('jaqueta')) return 'chest';
    if (full.includes('leg') || full.includes('pant') || full.includes('calça') || full.includes('calca')) return 'legs';
    if (full.includes('shield') || full.includes('escudo') || full.includes('belt') || full.includes('buckle')) return 'shield';
    
    if (full.includes('cloth') || full.includes('armor') || full.includes('vest') || full.includes('outfit')) return 'generic_clothing';
    return null;
}

for (const p of genericPending) {
    const buf = fs.readFileSync(p);
    const hash = crypto.createHash('md5').update(buf).digest('hex');
    if (usedHashes.has(hash)) continue;
    const cat = classifyFile(p);
    if (cat) {
        pools[cat].push({ path: p, hash, used: false });
        usedHashes.add(hash);
    }
}

// 3. Fill Missing Slots
const missingSlots = [];
for (const set in ARCHETYPES) {
    for (const rarity of RARITIES) {
        for (const slot of SLOTS) {
            const expectFile = path.join(USED_DIR, `${set}_${rarity}_${slot}_realistic.webp`);
            if (!fs.existsSync(expectFile)) {
                let poolName = slot === 'weapon' ? `weapon_${ARCHETYPES[set]}` : slot;
                missingSlots.push({ set, rarity, slot, poolName, expectFile });
            }
        }
    }
}

console.log(`\nRemaining empty slots to fill via generic matching: ${missingSlots.length}`);

function popFromPool(category) {
    const list = pools[category];
    if(!list) return null;
    for (let i = 0; i < list.length; i++) {
        if (!list[i].used) {
            list[i].used = true;
            return list[i].path;
        }
    }
    return null;
}

let genericMatches = 0;
for (const missing of missingSlots) {
    let sourcePath = popFromPool(missing.poolName);
    if (!sourcePath && missing.slot === 'weapon') sourcePath = popFromPool('generic_weapon');
    if (!sourcePath && missing.slot !== 'weapon') sourcePath = popFromPool('generic_clothing');
    
    if (sourcePath) {
        fs.copyFileSync(sourcePath, missing.expectFile);
        genericMatches++;
    }
}

console.log(`Generic images filled: ${genericMatches}`);

// 4. Update the ITEM base items missing `image_url`?
// The user says "muitas imagens sobrando em pastas... tente encaixa-las nos respectivos itens correspondentes".
// Let's check BASE_ITEMS in items.ts if any is missing.
// I will output a simple report.
console.log(`\nTotal items filled overall in this run: ${exactMatches + genericMatches}`);
