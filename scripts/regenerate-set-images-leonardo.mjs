import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const ENV_PATH = path.join(ROOT, '.env.local')
const OUT_DIR = path.join(ROOT, 'public', 'images', 'items')
const FORCE = process.argv.includes('--force')
const IDS_ARG = process.argv.find((arg) => arg.startsWith('--ids='))
const ONLY_IDS = IDS_ARG
  ? new Set(IDS_ARG.split('=')[1].split(',').map((s) => s.trim()).filter(Boolean))
  : null

const SETS_BY_RARITY = {
  common: [
    { key: 'pistoleiro_estrada', name: 'Pistoleiro da Estrada', lore: 'Jovens pistoleiros que defendiam comboios entre vilas secas.' },
    { key: 'forasteiro_po', name: 'Forasteiro do Po', lore: 'Bando nomade de saque rapido e passos leves nas dunas.' },
    { key: 'garimpeiro_cobre', name: 'Garimpeiro de Cobre', lore: 'Mineiros armados que lutavam para proteger os veios de cobre.' },
  ],
  uncommon: [
    { key: 'rastreador_canyon', name: 'Rastreador de Canyon', lore: 'Exploradores que cacavam foras-da-lei nos canyons estreitos.' },
    { key: 'mercenario_fronteira', name: 'Mercenario da Fronteira', lore: 'Veteranos pagos a ouro para segurar muralhas e saloons.' },
    { key: 'pregador_cinzento', name: 'Pregador Cinzento', lore: 'Ordem de pregadores armados que impunham paz a forca.' },
  ],
  rare: [
    { key: 'cacador_recompensas', name: 'Cacador de Recompensas', lore: 'Lendas urbanas juram que nunca erravam um rosto procurado.' },
    { key: 'bandoleiro_sombrio', name: 'Bandoleiro Sombrio', lore: 'Quadrilha de couracas pesadas conhecida por cercos violentos.' },
    { key: 'guarda_velha', name: 'Guarda Velha', lore: 'Antigos soldados de posto avancado, disciplina acima de tudo.' },
  ],
  epic: [
    { key: 'duelista_carmesim', name: 'Duelista Carmesim', lore: 'Mestres de duelo ao amanhecer, famosos por golpes criticos.' },
    { key: 'guardiao_aco', name: 'Guardiao de Aco', lore: 'Companhia blindada que resistiu ao Cerco de Red Mesa.' },
    { key: 'xama_tormenta', name: 'Xama da Tormenta', lore: 'Guerreiros-ritualistas que uniam precisao e resistencia mental.' },
  ],
  legendary: [
    { key: 'xerife_lendario', name: 'Xerife Lendario', lore: 'Reliquias do ultimo Alto Xerife, simbolo supremo de autoridade.' },
    { key: 'fantasma_deserto', name: 'Fantasma do Deserto', lore: 'Dizem que seus usuarios surgem, atiram e somem com o vento.' },
    { key: 'lobo_tempestade', name: 'Lobo da Tempestade', lore: 'Armaduras forjadas nas tormentas de sal para guerras de atrito.' },
  ],
}

const TYPES = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'mask']

const ARCHETYPE_BY_SET_KEY = {
  pistoleiro_estrada: 'lawman',
  forasteiro_po: 'agile',
  garimpeiro_cobre: 'tank',
  rastreador_canyon: 'agile',
  mercenario_fronteira: 'tank',
  pregador_cinzento: 'lawman',
  cacador_recompensas: 'agile',
  bandoleiro_sombrio: 'tank',
  guarda_velha: 'lawman',
  duelista_carmesim: 'agile',
  guardiao_aco: 'tank',
  xama_tormenta: 'lawman',
  xerife_lendario: 'lawman',
  fantasma_deserto: 'agile',
  lobo_tempestade: 'tank',
}

const TYPE_LABEL = {
  weapon: 'arma principal',
  helmet: 'chapeu ou cabeca',
  chest: 'casaco ou torso',
  gloves: 'luvas',
  legs: 'perneiras ou calcas',
  boots: 'botas',
  mask: 'mascara/lenço/tapa-olho',
}

const TYPE_CONTEXT = {
  weapon: 'Hero prop shot of a western weapon. Show steel, wood, scratches and wear.',
  helmet: 'Standalone headgear on neutral stand. No human face.',
  chest: 'Standalone western chest garment on stand, stitched details and worn fabric visible.',
  gloves: 'Close-up of a pair of gloves as the only subject, detailed leather grain.',
  legs: 'Standalone pants/chaps on neutral support, folds and trail dust clearly visible.',
  boots: 'Pair of boots as primary subject, cracked leather and worn metal details.',
  mask: 'Standalone face accessory on display stand, no person visible.',
}

const STYLE = [
  'Super realistic Wild West item render.',
  'Cinematic low-key lighting, high contrast, grounded materials.',
  'No fantasy glow, no sci-fi design, no cartoon style.',
  'Single subject, centered, clear silhouette.',
  'Dark studio background with subtle texture.',
].join(' ')

const NEGATIVE = [
  'cartoon', 'anime', 'illustration', 'painting', 'concept art', 'low poly',
  'toy look', 'sci-fi', 'fantasy magic', 'text', 'watermark', 'logo',
  'collage', 'multiple items', 'blurry', 'deformed',
].join(', ')

async function loadEnvLocal() {
  const raw = await fs.readFile(ENV_PATH, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

function maskNameForSet(setKey, setName) {
  const archetype = ARCHETYPE_BY_SET_KEY[setKey]
  if (archetype === 'agile') return `Lenco do ${setName}`
  if (archetype === 'tank') return `Mascara do ${setName}`
  return `Tapa-Olho do ${setName}`
}

function itemName(setKey, setName, type) {
  if (type === 'weapon') return `Arma do ${setName}`
  if (type === 'mask') return maskNameForSet(setKey, setName)
  if (type === 'helmet') return `Chapeu do ${setName}`
  if (type === 'chest') return `Casaco do ${setName}`
  if (type === 'gloves') return `Luvas do ${setName}`
  if (type === 'legs') return `Perneiras do ${setName}`
  return `Botas do ${setName}`
}

function buildItems() {
  const out = []
  for (const [rarity, sets] of Object.entries(SETS_BY_RARITY)) {
    for (const set of sets) {
      for (const type of TYPES) {
        const idSuffix = type === 'mask' ? 'shield' : type
        const id = `${set.key}_${rarity}_${idSuffix}`
        out.push({
          id,
          name: itemName(set.key, set.name, type),
          rarity,
          type,
          lore: set.lore,
        })
      }
    }
  }
  return out
}

function promptFor(item) {
  return [
    `Item name: ${item.name}.`,
    `Item role: ${TYPE_LABEL[item.type]}.`,
    `Rarity tier: ${item.rarity}.`,
    `Set lore context: ${item.lore}`,
    TYPE_CONTEXT[item.type],
    STYLE,
  ].join(' ')
}

async function generateImage(apiKey, prompt) {
  const submitRes = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      height: 768,
      width: 768,
      modelId: '5c232a9e-9061-4777-980a-ddc8e65647c6',
      prompt,
      negative_prompt: NEGATIVE,
      num_images: 1,
      alchemy: false,
    }),
  })

  if (!submitRes.ok) {
    const body = await submitRes.text()
    throw new Error(`submit ${submitRes.status}: ${body}`)
  }

  const submitJson = await submitRes.json()
  const generationId = submitJson.sdGenerationJob.generationId

  let imageUrl = null
  for (let i = 0; i < 45; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2500))
    const pollRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
      headers: { accept: 'application/json', authorization: `Bearer ${apiKey}` },
    })
    if (!pollRes.ok) continue
    const pollJson = await pollRes.json()
    const generation = pollJson.generations_by_pk
    if (generation.status === 'COMPLETE') {
      imageUrl = generation.generated_images[0].url
      break
    }
    if (generation.status === 'FAILED') {
      throw new Error(`generation failed: ${generationId}`)
    }
  }

  if (!imageUrl) throw new Error(`timeout generation: ${generationId}`)
  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) throw new Error(`download failed: ${imageUrl}`)
  return Buffer.from(await imgRes.arrayBuffer())
}

async function main() {
  await loadEnvLocal()
  const apiKey = process.env.LEONARDO_API_KEY
  if (!apiKey) throw new Error('LEONARDO_API_KEY not found in .env.local')

  await fs.mkdir(OUT_DIR, { recursive: true })
  const all = buildItems()
  const queue = ONLY_IDS ? all.filter((item) => ONLY_IDS.has(item.id)) : all

  let ok = 0
  let fail = 0
  let skip = 0

  for (const item of queue) {
    const outPath = path.join(OUT_DIR, `${item.id}_realistic.png`)
    if (!FORCE) {
      try {
        const st = await fs.stat(outPath)
        if (st.size > 1024) {
          skip += 1
          console.log(`SKIP ${item.id}`)
          continue
        }
      } catch {}
    }

    try {
      console.log(`GEN ${item.id}`)
      const prompt = promptFor(item)
      const buf = await generateImage(apiKey, prompt)
      await fs.writeFile(outPath, buf)
      ok += 1
    } catch (error) {
      fail += 1
      console.error(`FAIL ${item.id}: ${error.message}`)
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  console.log(`done: ok=${ok} fail=${fail} skip=${skip}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
