import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const ITEMS_DIR = path.join(ROOT, 'public', 'images', 'items')
const MIN_VALID_BYTES = 1024

const SETS_BY_RARITY = {
  common: ['pistoleiro_estrada', 'forasteiro_po', 'garimpeiro_cobre'],
  uncommon: ['rastreador_canyon', 'mercenario_fronteira', 'pregador_cinzento'],
  rare: ['cacador_recompensas', 'bandoleiro_sombrio', 'guarda_velha'],
  epic: ['duelista_carmesim', 'guardiao_aco', 'xama_tormenta'],
  legendary: ['xerife_lendario', 'fantasma_deserto', 'lobo_tempestade'],
}

const TYPES = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'mask']

const TYPE_TEMPLATE_CANDIDATES = {
  weapon: [
    'duelist_gloves_realistic.webp',    // best stand-in with visible detail
    'raven_boots_realistic.webp',
  ],
  helmet: [
    'duelist_gloves_realistic.webp',
    'cloth_boots_realistic.webp',
    'raven_boots_realistic.webp',
  ],
  chest: [
    'lined_pants_realistic.webp',
    'ranger_boots_realistic.webp',
    'raven_boots_realistic.webp',
  ],
  gloves: [
    'duelist_gloves_realistic.webp',
    'mercenary_boots_realistic.webp',
  ],
  legs: [
    'lined_pants_realistic.webp',
    'cloth_boots_realistic.webp',
    'ranger_boots_realistic.webp',
  ],
  boots: [
    'raven_boots_realistic.webp',
    'ranger_boots_realistic.webp',
    'mercenary_boots_realistic.webp',
    'iron_boots_realistic.webp',
    'cloth_boots_realistic.webp',
  ],
  mask: [
    'duelist_gloves_realistic.webp',
    'raven_boots_realistic.webp',
    'lined_pants_realistic.webp',
  ],
}

function hashString(value) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

async function fileIsValid(filePath) {
  try {
    const stats = await fs.stat(filePath)
    return stats.size > MIN_VALID_BYTES
  } catch {
    return false
  }
}

async function findTemplate(type) {
  for (const candidate of TYPE_TEMPLATE_CANDIDATES[type] || []) {
    const full = path.join(ITEMS_DIR, candidate)
    if (await fileIsValid(full)) return full
  }
  return null
}

function buildExpectedIds() {
  const ids = []
  for (const [rarity, keys] of Object.entries(SETS_BY_RARITY)) {
    for (const key of keys) {
      for (const type of TYPES) {
        const idSuffix = type === 'mask' ? 'shield' : type
        ids.push(`${key}_${rarity}_${idSuffix}`)
      }
    }
  }
  return ids
}

/**
 * Each set gets a distinct hue identity spaced evenly across the color wheel,
 * plus per-slot tweaks so within the same set the silhouette differs slightly.
 */
const SET_PALETTES = {
  // Common
  pistoleiro_estrada:    { hue:   0, sat: 0.85, bright: 0.90 },  // warm brown/red
  forasteiro_po:         { hue:  30, sat: 0.70, bright: 1.05 },  // dusty sand
  garimpeiro_cobre:      { hue:  20, sat: 1.10, bright: 0.85 },  // copper orange
  // Uncommon
  rastreador_canyon:     { hue:  10, sat: 0.80, bright: 0.88 },  // red canyon
  mercenario_fronteira:  { hue: 200, sat: 0.75, bright: 0.85 },  // steel blue
  pregador_cinzento:     { hue: 220, sat: 0.35, bright: 0.78 },  // grey/dark
  // Rare
  cacador_recompensas:   { hue:  60, sat: 0.95, bright: 0.90 },  // amber gold
  bandoleiro_sombrio:    { hue: 240, sat: 0.80, bright: 0.72 },  // dark indigo
  guarda_velha:          { hue: 180, sat: 0.55, bright: 0.80 },  // teal/army
  // Epic
  duelista_carmesim:     { hue: 350, sat: 1.20, bright: 0.88 },  // crimson red
  guardiao_aco:          { hue: 210, sat: 0.60, bright: 0.80 },  // iron blue-grey
  xama_tormenta:         { hue: 270, sat: 1.10, bright: 0.92 },  // purple storm
  // Legendary
  xerife_lendario:       { hue:  45, sat: 1.30, bright: 1.00 },  // gleaming gold
  fantasma_deserto:      { hue: 190, sat: 0.50, bright: 1.10 },  // pale ghost teal
  lobo_tempestade:       { hue: 230, sat: 0.90, bright: 0.75 },  // midnight navy
}

const TYPE_HUE_OFFSET = {
  weapon:  0,
  helmet:  5,
  chest:  -5,
  gloves: 10,
  legs:   -8,
  boots:  12,
  mask: -3,
}

async function makeVariant({ templatePath, outputPath, setKey, type }) {
  const palette = SET_PALETTES[setKey] || { hue: 0, sat: 1.0, bright: 1.0 }
  const typeOffset = TYPE_HUE_OFFSET[type] || 0

  await sharp(templatePath)
    .rotate()
    .modulate({
      hue: palette.hue + typeOffset,
      saturation: palette.sat,
      brightness: palette.bright,
    })
    .sharpen(0.8)
    .webp({ quality: 90 })
    .toFile(outputPath)
}

async function main() {
  await fs.mkdir(ITEMS_DIR, { recursive: true })

  const expected = buildExpectedIds()
  let created = 0
  let kept = 0
  let missingTemplates = 0

  for (const id of expected) {
    const outputPath = path.join(ITEMS_DIR, `${id}_realistic.webp`)
    if (await fileIsValid(outputPath)) {
      kept += 1
      continue
    }

    // id format: setKey_rarity_type  e.g. pistoleiro_estrada_common_helmet
    const parts = id.split('_')
    const rawType = parts.at(-1)
    const type = rawType === 'shield' ? 'mask' : rawType
    // setKey is everything before the last two segments (rarity + type)
    const setKey = parts.slice(0, -2).join('_')

    const templatePath = await findTemplate(type)
    if (!templatePath) {
      console.warn(`[fill-missing-item-images] Missing template for type: ${type} (${id})`)
      missingTemplates += 1
      continue
    }

    await makeVariant({ templatePath, outputPath, setKey, type })
    created += 1
    console.log(`[fill-missing-item-images] Created ${path.relative(ROOT, outputPath)}`)
  }

  console.log(
    `[fill-missing-item-images] done: created=${created}, kept=${kept}, missingTemplates=${missingTemplates}`
  )
}

main().catch((error) => {
  console.error('[fill-missing-item-images] failed')
  console.error(error)
  process.exit(1)
})
