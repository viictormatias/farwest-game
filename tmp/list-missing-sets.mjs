import fs from 'node:fs'
import path from 'node:path'

const PUBLIC_ITEMS_DIR = 'c:/Users/Victor/Documents/GitHub/far-west/public/images/items'

const SETS_BY_RARITY = {
    common: ['pistoleiro_estrada', 'forasteiro_po', 'garimpeiro_cobre'],
    uncommon: ['rastreador_canyon', 'mercenario_fronteira', 'pregador_cinzento'],
    rare: ['cacador_recompensas', 'bandoleiro_sombrio', 'guarda_velha'],
    epic: ['duelista_carmesim', 'guardiao_aco', 'xama_tormenta'],
    legendary: ['xerife_lendario', 'fantasma_deserto', 'lobo_tempestade']
}

const SLOTS = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'shield']

const missing = []
for (const [rarity, themes] of Object.entries(SETS_BY_RARITY)) {
    for (const theme of themes) {
        for (const slot of SLOTS) {
            const fileName = `${theme}_${rarity}_${slot}_realistic.webp`
            if (!fs.existsSync(path.join(PUBLIC_ITEMS_DIR, fileName))) {
                missing.push(fileName)
            }
        }
    }
}

console.log('Missing Set Images:')
console.log(missing)
