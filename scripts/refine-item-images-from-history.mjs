import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const ARTIFACTS_DIR = path.join(ROOT, 'artifacts')
const ITEMS_DIR = path.join(ROOT, 'public', 'images', 'items')

const SETS = [
  { key: 'pistoleiro_estrada', name: 'Pistoleiro da Estrada' },
  { key: 'forasteiro_po', name: 'Forasteiro do Po' },
  { key: 'garimpeiro_cobre', name: 'Garimpeiro de Cobre' },
  { key: 'rastreador_canyon', name: 'Rastreador de Canyon' },
  { key: 'mercenario_fronteira', name: 'Mercenario da Fronteira' },
  { key: 'pregador_cinzento', name: 'Pregador Cinzento' },
  { key: 'cacador_recompensas', name: 'Cacador de Recompensas' },
  { key: 'bandoleiro_sombrio', name: 'Bandoleiro Sombrio' },
  { key: 'guarda_velha', name: 'Guarda Velha' },
  { key: 'duelista_carmesim', name: 'Duelista Carmesim' },
  { key: 'guardiao_aco', name: 'Guardiao de Aco' },
  { key: 'xama_tormenta', name: 'Xama da Tormenta' },
  { key: 'xerife_lendario', name: 'Xerife Lendario' },
  { key: 'fantasma_deserto', name: 'Fantasma do Deserto' },
  { key: 'lobo_tempestade', name: 'Lobo da Tempestade' },
]

const SLOT_SYNONYMS = {
  weapon: ['arma', 'weapon', 'revolver', 'rifle', 'escopeta', 'carabina'],
  helmet: ['chapeu', 'chapéu', 'helmet', 'hat', 'cabeca'],
  chest: ['casaco', 'coat', 'chest', 'torso', 'poncho'],
  gloves: ['luvas', 'gloves'],
  legs: ['perneiras', 'calcas', 'calças', 'pants', 'legs', 'chaps'],
  boots: ['botas', 'boots'],
  shield: ['bracadeira', 'braçadeira', 'shield', 'forearm', 'guard', 'buckler', 'bandolier'],
}

const RARITY_BY_SET = {
  pistoleiro_estrada: 'common',
  forasteiro_po: 'common',
  garimpeiro_cobre: 'common',
  rastreador_canyon: 'uncommon',
  mercenario_fronteira: 'uncommon',
  pregador_cinzento: 'uncommon',
  cacador_recompensas: 'rare',
  bandoleiro_sombrio: 'rare',
  guarda_velha: 'rare',
  duelista_carmesim: 'epic',
  guardiao_aco: 'epic',
  xama_tormenta: 'epic',
  xerife_lendario: 'legendary',
  fantasma_deserto: 'legendary',
  lobo_tempestade: 'legendary',
}

function normalize(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function includesAny(text, words) {
  return words.some((w) => text.includes(normalize(w)))
}

function detectSet(promptNormalized) {
  for (const set of SETS) {
    const n = normalize(set.name)
    if (promptNormalized.includes(n)) return set
  }
  return null
}

function detectSlot(promptNormalized) {
  for (const [slot, words] of Object.entries(SLOT_SYNONYMS)) {
    if (includesAny(promptNormalized, words)) return slot
  }
  return null
}

function scoreGeneration(g) {
  const p = normalize(g.prompt || '')
  let s = 0
  if (p.includes('super realistic') || p.includes('ultra realistic')) s += 5
  if (p.includes('wild west')) s += 4
  if (p.includes('isolated object')) s += 3
  if (p.includes('studio black background')) s += 3
  const width = Number(g.imageWidth || 0)
  const height = Number(g.imageHeight || 0)
  s += Math.min(6, Math.floor((width * height) / (512 * 512)))
  return s
}

async function download(url, outPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(outPath, buf)
}

async function main() {
  const historyFiles = (await fs.readdir(ARTIFACTS_DIR))
    .filter((f) => f.startsWith('leonardo-history-') && f.endsWith('.json'))
    .map((f) => path.join(ARTIFACTS_DIR, f))

  const generations = []
  for (const file of historyFiles) {
    try {
      const raw = await fs.readFile(file, 'utf8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) generations.push(...parsed)
    } catch {
      // skip invalid history file
    }
  }

  const bestByTarget = new Map()
  for (const g of generations) {
    const prompt = normalize(g.prompt || '')
    const set = detectSet(prompt)
    const slot = detectSlot(prompt)
    const url = g.generated_images?.[0]?.url
    if (!set || !slot || !url) continue

    const rarity = RARITY_BY_SET[set.key]
    const targetId = `${set.key}_${rarity}_${slot}`
    const score = scoreGeneration(g)
    const createdAt = new Date(g.createdAt || 0).getTime() || 0

    const prev = bestByTarget.get(targetId)
    if (!prev || score > prev.score || (score === prev.score && createdAt > prev.createdAt)) {
      bestByTarget.set(targetId, { url, score, createdAt, generationId: g.id || null })
    }
  }

  let updated = 0
  let missing = 0
  const missingTargets = []

  for (const set of SETS) {
    const rarity = RARITY_BY_SET[set.key]
    for (const slot of Object.keys(SLOT_SYNONYMS)) {
      const id = `${set.key}_${rarity}_${slot}`
      const hit = bestByTarget.get(id)
      if (!hit) {
        missing += 1
        missingTargets.push(id)
        continue
      }
      const outPath = path.join(ITEMS_DIR, `${id}_realistic.png`)
      await download(hit.url, outPath)
      updated += 1
    }
  }

  console.log(
    JSON.stringify(
        {
        historyFilesUsed: historyFiles.length,
        generationsScanned: generations.length,
        updated,
        missing,
        totalTargets: SETS.length * Object.keys(SLOT_SYNONYMS).length,
        matchedTargets: bestByTarget.size,
        missingTargets,
      },
      null,
      2
    )
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
