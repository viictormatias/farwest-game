const fs = require('fs');
const sets = {
  common: ['pistoleiro_estrada','forasteiro_po','garimpeiro_cobre'],
  uncommon: ['rastreador_canyon','mercenario_fronteira','pregador_cinzento'],
  rare: ['cacador_recompensas','bandoleiro_sombrio','guarda_velha'],
  epic: ['duelista_carmesim','guardiao_aco','xama_tormenta'],
  legendary: ['xerife_lendario','fantasma_deserto','lobo_tempestade'],
};
const types = ['weapon','helmet','chest','gloves','legs','boots','shield'];
const expected = [];
for (const rarity of Object.keys(sets)) {
  for (const key of sets[rarity]) {
    for (const type of types) {
      expected.push(`${key}_${rarity}_${type}_realistic.webp`);
    }
  }
}
const existing = new Set(fs.readdirSync('public/images/items').filter(f => f.endsWith('.webp')));
const missing = expected.filter(f => !existing.has(f));
const byType = {};
for (const f of missing) {
  const type = f.split('_').slice(-2,-1)[0];
  byType[type] = byType[type] || [];
  byType[type].push(f);
}
console.log('missing total', missing.length);
for (const [type, files] of Object.entries(byType)) {
  console.log(type, files.length);
}
