import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const USED_DIR = './public/images/items';
const PENDING_DIR = './IMAGENS-NAO-USADAS';

// Get all used hashes to avoid duplicates
const usedHashes = new Set();
if (fs.existsSync(USED_DIR)) {
    const list = fs.readdirSync(USED_DIR);
    for (const f of list) {
        if (!f.endsWith('.webp')) continue;
        const buf = fs.readFileSync(path.join(USED_DIR, f));
        usedHashes.add(crypto.createHash('md5').update(buf).digest('hex'));
    }
}

// Map available images by type
const pools = {
    weapon_agile: [],
    weapon_tank: [],
    weapon_lawman: [],
    helmet: [],
    chest: [],
    gloves: [],
    legs: [],
    boots: [],
    shield: [],
    generic_weapon: [],
    generic_clothing: []
};

function classifyFile(filePath) {
    const name = path.basename(filePath).toLowerCase();
    const full = filePath.toLowerCase();
    
    // Check type based on filename/path keywords
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

    return null; // Unknown type
}

function scanPending(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanPending(fullPath);
        } else if (f.match(/\.(webp|png|jpg|jpeg)$/i)) {
            const buf = fs.readFileSync(fullPath);
            const hash = crypto.createHash('md5').update(buf).digest('hex');
            if (usedHashes.has(hash)) continue; // Already used
            
            const category = classifyFile(fullPath);
            if (category) {
                pools[category].push({ path: fullPath, hash, used: false });
                usedHashes.add(hash); // mark as used in unique pool
            }
        }
    }
}
scanPending(PENDING_DIR);

console.log("Mapeamento de Imagens Disponíveis:");
for (const k in pools) {
    console.log(`- ${k}: ${pools[k].length}`);
}

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

const missingSlots = [];
let totalNeeded = 0;

for (const set in ARCHETYPES) {
    for (const rarity of RARITIES) {
        for (const slot of SLOTS) {
            const expectFile = path.join(USED_DIR, `${set}_${rarity}_${slot}_realistic.webp`);
            if (!fs.existsSync(expectFile)) {
                totalNeeded++;
                let poolName = slot;
                if (slot === 'weapon') {
                    poolName = `weapon_${ARCHETYPES[set]}`;
                }
                missingSlots.push({ set, rarity, slot, poolName, expectFile });
            }
        }
    }
}

console.log(`\nSlots vazios: ${missingSlots.length}`);
let filled = 0;

function popFromPool(category) {
    const list = pools[category];
    for (let i = 0; i < list.length; i++) {
        if (!list[i].used) {
            list[i].used = true;
            return list[i].path;
        }
    }
    return null;
}

// Assign
for (const missing of missingSlots) {
    let sourcePath = popFromPool(missing.poolName);
    
    // Fallbacks
    if (!sourcePath && missing.slot === 'weapon') sourcePath = popFromPool('generic_weapon');
    if (!sourcePath && missing.slot !== 'weapon') sourcePath = popFromPool('generic_clothing');
    
    if (sourcePath) {
        // Copy file
        fs.copyFileSync(sourcePath, missing.expectFile);
        console.log(`+ Copiado ${sourcePath} -> ${path.basename(missing.expectFile)}`);
        filled++;
    }
}

console.log(`\nImagens preenchidas com sucesso: ${filled} de ${missingSlots.length} pendentes.`);
