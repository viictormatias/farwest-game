import fs from 'node:fs';
import path from 'node:path';

// Usando caminhos relativos para evitar problemas de caractere oculto no path absoluto
const SRC_DIR = './src';
const PUBLIC_DIR = './public';
const BACKUP_DIR = './IMAGENS-NAO-USADAS/audit_cleanup_final';

const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const SLOTS = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'shield'];
const SET_KEYS = [
    'pistoleiro_estrada', 'forasteiro_po', 'garimpeiro_cobre',
    'rastreador_canyon', 'mercenario_fronteira', 'pregador_cinzento',
    'cacador_recompensas', 'bandoleiro_sombrio', 'guarda_velha',
    'duelista_carmesim', 'guardiao_aco', 'xama_tormenta',
    'xerife_lendario', 'fantasma_deserto', 'lobo_tempestade'
];

function main() {
    console.log(`CWD: ${process.cwd()}`);
    const requiredPaths = new Set();

    // 1. Caminhos Dinâmicos
    for (const set of SET_KEYS) {
        for (const rarity of RARITIES) {
            for (const slot of SLOTS) {
                requiredPaths.add(`/images/items/${set}_${rarity}_${slot}_realistic.webp`);
            }
        }
    }

    // 2. Scan Codebase
    function scanDir(dir) {
        if (!fs.existsSync(dir)) return;
        const list = fs.readdirSync(dir);
        for (const file of list) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                scanDir(fullPath);
            } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const matches = content.match(/['"\/]images\/[^'"]+\.(webp|png|jpg|jpeg|svg)/gi);
                if (matches) {
                    matches.forEach(m => {
                        let cleaned = m.replace(/['"]/g, '').trim();
                        if (!cleaned.startsWith('/')) cleaned = '/' + cleaned;
                        requiredPaths.add(cleaned);
                    });
                }
            }
        }
    }
    scanDir(SRC_DIR);
    console.log(`Auditoria: Encontrados ${requiredPaths.size} caminhos no código.`);

    // 3. Listar Public
    const publicImages = [];
    function listPublic(dir) {
        if (!fs.existsSync(dir)) {
            console.error(`DIRETORIO NAO ENCONTRADO: ${dir}`);
            return;
        }
        const list = fs.readdirSync(dir);
        for (const file of list) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                listPublic(fullPath);
            } else {
                let rel = fullPath.replace('public', '').replace(/\\/g, '/');
                if (!rel.startsWith('/')) rel = '/' + rel;
                publicImages.push({ rel, full: fullPath });
            }
        }
    }
    listPublic('./public/images');

    // 4. Identificar e Mover
    console.log(`Total Public: ${publicImages.length}`);
    const unused = publicImages.filter(img => !requiredPaths.has(img.rel));
    console.log(`Unused: ${unused.length}`);

    if (unused.length > 0) {
        if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
        for (const img of unused) {
            const target = path.join(BACKUP_DIR, img.rel);
            if (!fs.existsSync(path.dirname(target))) fs.mkdirSync(path.dirname(target), { recursive: true });
            try {
                fs.renameSync(img.full, target);
            } catch (e) {
                // Ignore errors if file was moved/deleted
            }
        }
        console.log(`Limpeza concluída!`);
    }

    // 5. Fix Catalog (UTF-8)
    const catalogPath = './ITEM_CATALOG.md';
    if (fs.existsSync(catalogPath)) {
        const content = fs.readFileSync(catalogPath, 'utf8');
        fs.writeFileSync(catalogPath, content, { encoding: 'utf8' });
        console.log('Catálogo atualizado.');
    }
}

main();
