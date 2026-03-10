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

const TYPES = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'shield']

const TYPE_TEMPLATE_CANDIDATES = {
  weapon: [
    'lobo_tempestade_legendary_weapon_realistic.png',
    'xama_tormenta_epic_weapon_realistic.png',
    'fantasma_deserto_legendary_weapon_realistic.png',
  ],
  helmet: [
    'lobo_tempestade_legendary_helmet_realistic.png',
    'xama_tormenta_epic_helmet_realistic.png',
    'fantasma_deserto_legendary_helmet_realistic.png',
  ],
  chest: [
    'lobo_tempestade_legendary_chest_realistic.png',
    'xama_tormenta_epic_chest_realistic.png',
    'fantasma_deserto_legendary_chest_realistic.png',
  ],
  gloves: [
    'lobo_tempestade_legendary_gloves_realistic.png',
    'xama_tormenta_epic_gloves_realistic.png',
    'marshal_gloves_realistic.jpg',
  ],
  legs: [
    'lobo_tempestade_legendary_legs_realistic.png',
    'xama_tormenta_epic_legs_realistic.png',
    'ghost_step_pants_realistic.jpg',
  ],
  boots: [
    'xama_tormenta_epic_boots_realistic.png',
    'raven_boots_realistic.jpg',
    'ranger_boots_realistic.jpg',
  ],
  shield: [
    'lobo_tempestade_legendary_shield_realistic.png',
    'xama_tormenta_epic_shield_realistic.png',
    'fantasma_deserto_legendary_shield_realistic.png',
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
        ids.push(`${key}_${rarity}_${type}`)
      }
    }
  }
  return ids
}

async function makeVariant({ templatePath, outputPath, seed }) {
  const hueShift = (seed % 41) - 20
  const sat = 0.9 + ((seed % 13) / 100)
  const bright = 0.93 + ((seed % 9) / 100)
  const sharpenSigma = 0.6 + ((seed % 4) * 0.2)

  await sharp(templatePath)
    .rotate()
    .modulate({ hue: hueShift, saturation: sat, brightness: bright })
    .sharpen(sharpenSigma)
    .png({ compressionLevel: 9, palette: true })
    .toFile(outputPath)
}

async function main() {
  await fs.mkdir(ITEMS_DIR, { recursive: true })

  const expected = buildExpectedIds()
  let created = 0
  let kept = 0
  let missingTemplates = 0

  for (const id of expected) {
    const outputPath = path.join(ITEMS_DIR, `${id}_realistic.png`)
    if (await fileIsValid(outputPath)) {
      kept += 1
      continue
    }

    const type = id.split('_').at(-1)
    const templatePath = await findTemplate(type)
    if (!templatePath) {
      console.warn(`[fill-missing-item-images] Missing template for type: ${type} (${id})`)
      missingTemplates += 1
      continue
    }

    const seed = hashString(id)
    await makeVariant({ templatePath, outputPath, seed })
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
