import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const ENV_PATH = path.join(ROOT, '.env.local')
const ITEMS_DIR = path.join(ROOT, 'public', 'images', 'items')

const KEEP_GOOD = new Set([
  'lobo_tempestade_legendary_weapon',
  'xama_tormenta_epic_weapon',
])

const IDS_ARG = process.argv.find((arg) => arg.startsWith('--ids='))
const PROVIDER_ARG = process.argv.find((arg) => arg.startsWith('--provider='))
const FORCE = process.argv.includes('--force')
const INCLUDE_GOOD = process.argv.includes('--include-good')

const ONLY_IDS = IDS_ARG
  ? new Set(IDS_ARG.split('=')[1].split(',').map((s) => s.trim()).filter(Boolean))
  : null
const PROVIDER = (PROVIDER_ARG?.split('=')[1] || 'auto').toLowerCase()

const SET_THEME = {
  pistoleiro_estrada: {
    setName: 'Pistoleiro da Estrada',
    weaponName: 'Revolver da Estrada',
    descriptor: 'fast-draw service revolver, worn steel, practical frontier sidearm',
  },
  forasteiro_po: {
    setName: 'Forasteiro do Po',
    weaponName: 'Revolver do Po',
    descriptor: 'dusty outlaw revolver, cloth grip wrap, sand-worn finish',
  },
  garimpeiro_cobre: {
    setName: 'Garimpeiro de Cobre',
    weaponName: 'Escopeta do Garimpeiro',
    descriptor: 'rugged miner shotgun with copper details and worn walnut stock',
  },
  rastreador_canyon: {
    setName: 'Rastreador de Canyon',
    weaponName: 'Carabina do Canyon',
    descriptor: 'scout carbine with long sight line, canyon dust, scratched blued steel',
  },
  mercenario_fronteira: {
    setName: 'Mercenario da Fronteira',
    weaponName: 'Repeater da Fronteira',
    descriptor: 'heavy repeater rifle, reinforced barrel band, battle-worn utility build',
  },
  pregador_cinzento: {
    setName: 'Pregador Cinzento',
    weaponName: 'Carabina Cinzenta',
    descriptor: 'austere engraved carbine, darkened steel, restrained religious motifs',
  },
  cacador_recompensas: {
    setName: 'Cacador de Recompensas',
    weaponName: 'Revolver do Cacador',
    descriptor: 'long-barrel bounty revolver, precision-machined cylinder, holster wear marks',
  },
  bandoleiro_sombrio: {
    setName: 'Bandoleiro Sombrio',
    weaponName: 'Escopeta Sombria',
    descriptor: 'short brutal shotgun profile, matte blackened metal, gritty outlaw look',
  },
  guarda_velha: {
    setName: 'Guarda Velha',
    weaponName: 'Carabina da Guarda Velha',
    descriptor: 'veteran service carbine, disciplined military finish, aged but maintained',
  },
  duelista_carmesim: {
    setName: 'Duelista Carmesim',
    weaponName: 'Revolver Carmesim',
    descriptor: 'high-end duel revolver, polished steel, subtle crimson leather accents',
  },
  guardiao_aco: {
    setName: 'Guardiao de Aco',
    weaponName: 'Repeater de Aco',
    descriptor: 'armored steel repeater, heavy frame, reinforced receiver and stock',
  },
  xama_tormenta: {
    setName: 'Xama da Tormenta',
    weaponName: 'Carabina da Tormenta',
    descriptor: 'ritual-carved storm carbine, talisman details, weathered sacred metal',
  },
  xerife_lendario: {
    setName: 'Xerife Lendario',
    weaponName: 'Rifle do Alto Xerife',
    descriptor: 'legendary lawman rifle with sheriff-star engravings and premium finishing',
  },
  fantasma_deserto: {
    setName: 'Fantasma do Deserto',
    weaponName: 'Revolver Fantasma',
    descriptor: 'matte desert ghost revolver, low-reflection finish, cloth dust wrap',
  },
  lobo_tempestade: {
    setName: 'Lobo da Tempestade',
    weaponName: 'Escopeta do Lobo',
    descriptor: 'stormforged heavy shotgun, salt-corroded steel and dense dark wood',
  },
}

const NEGATIVE_PROMPT = [
  'people',
  'person',
  'hands',
  'holding weapon',
  'character portrait',
  'face',
  'body',
  'outfit',
  'cowboy full body',
  'text',
  'logo',
  'watermark',
  'anime',
  'cartoon',
  'illustration',
  'painting',
  'sci-fi',
  'fantasy gun',
  'futuristic',
  'multiple weapons',
  'blurry',
  'lowres',
].join(', ')

function normalize(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

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

function parseWeaponId(itemId) {
  const normalized = normalize(itemId)
  if (!normalized.endsWith('_weapon')) return null
  const parts = normalized.split('_')
  const rarityIndex = parts.findIndex((p) =>
    ['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(p)
  )
  if (rarityIndex < 1) return null
  const setKey = parts.slice(0, rarityIndex).join('_')
  const rarity = parts[rarityIndex]
  return { setKey, rarity }
}

function buildWeaponPrompt(itemId) {
  const parsed = parseWeaponId(itemId)
  const theme = parsed ? SET_THEME[parsed.setKey] : null

  const setName = theme?.setName || 'Arsenal da Fronteira'
  const weaponName = theme?.weaponName || itemId.replace(/_/g, ' ')
  const descriptor = theme?.descriptor || 'realistic old west firearm with worn steel and wood'
  const rarity = parsed?.rarity || 'rare'

  return [
    'Super realistic Wild West weapon render for RPG item art.',
    `Set: ${setName}.`,
    `Item: ${weaponName}.`,
    `Rarity: ${rarity}.`,
    `Design intent: ${descriptor}.`,
    'Single firearm only, centered and fully visible from stock to muzzle.',
    'Isolated product shot on matte black studio background, no scenery.',
    'No hands, no person, no holster on body, no mannequin, no clothing.',
    'Materials: blued steel, oiled walnut wood, scratches, dust, honest wear.',
    'Lighting: cinematic key light from upper-left, subtle rim light, strong contrast.',
    'Photorealistic, physically plausible proportions, ultra-detailed, sharp focus, 8k.',
    'No text, no logos, no watermark.',
  ].join(' ')
}

async function generateWithLeonardo({ apiKey, prompt }) {
  const submitRes = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      height: 1024,
      width: 1024,
      modelId: '7b592283-e8a7-4c5a-9ba6-d18c31f258b9',
      prompt,
      negative_prompt: NEGATIVE_PROMPT,
      num_images: 1,
      alchemy: false,
      photoReal: false,
    }),
  })

  if (!submitRes.ok) {
    const body = await submitRes.text()
    throw new Error(`Leonardo submit ${submitRes.status}: ${body}`)
  }

  const submitJson = await submitRes.json()
  const generationId = submitJson?.sdGenerationJob?.generationId
  if (!generationId) throw new Error('Leonardo generationId missing')

  const pollUrl = `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2500))
    const pollRes = await fetch(pollUrl, {
      headers: { accept: 'application/json', authorization: `Bearer ${apiKey}` },
    })
    if (!pollRes.ok) continue
    const pollJson = await pollRes.json()
    const generation = pollJson?.generations_by_pk
    if (generation?.status === 'FAILED') throw new Error(`Leonardo generation failed: ${generationId}`)
    if (generation?.status === 'COMPLETE') {
      const url = generation?.generated_images?.[0]?.url
      if (!url) throw new Error(`Leonardo image url missing: ${generationId}`)
      const img = await fetch(url)
      if (!img.ok) throw new Error(`Leonardo download ${img.status}`)
      return Buffer.from(await img.arrayBuffer())
    }
  }

  throw new Error(`Leonardo timeout: ${generationId}`)
}

async function generateWithGemini({ apiKey, prompt }) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: `${prompt} Negative prompt: ${NEGATIVE_PROMPT}` }],
        parameters: { sampleCount: 1, aspectRatio: '1:1', outputMimeType: 'image/png' },
      }),
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Gemini ${response.status}: ${body}`)
  }
  const json = await response.json()
  const bytesBase64 = json?.predictions?.[0]?.bytesBase64
  if (!bytesBase64) throw new Error('Gemini image bytes missing')
  return Buffer.from(bytesBase64, 'base64')
}

async function generateImage({ prompt }) {
  const leonardoKey = process.env.LEONARDO_API_KEY
  const geminiKey = process.env.GOOGLE_AI_API_KEY

  if (PROVIDER === 'leonardo') {
    if (!leonardoKey) throw new Error('LEONARDO_API_KEY missing')
    return { provider: 'leonardo', buffer: await generateWithLeonardo({ apiKey: leonardoKey, prompt }) }
  }
  if (PROVIDER === 'gemini') {
    if (!geminiKey) throw new Error('GOOGLE_AI_API_KEY missing')
    return { provider: 'gemini', buffer: await generateWithGemini({ apiKey: geminiKey, prompt }) }
  }

  if (leonardoKey) {
    try {
      const buffer = await generateWithLeonardo({ apiKey: leonardoKey, prompt })
      return { provider: 'leonardo', buffer }
    } catch (error) {
      console.warn(`[auto] Leonardo falhou, fallback Gemini: ${error.message}`)
    }
  }
  if (geminiKey) {
    const buffer = await generateWithGemini({ apiKey: geminiKey, prompt })
    return { provider: 'gemini', buffer }
  }
  throw new Error('Nenhuma API key disponivel (Leonardo/Gemini).')
}

async function listWeaponIds() {
  const files = await fs.readdir(ITEMS_DIR)
  const ids = files
    .filter((f) => f.endsWith('_weapon_realistic.png'))
    .map((f) => f.replace(/_realistic\.png$/i, ''))
    .sort()
  return [...new Set(ids)]
}

async function main() {
  await loadEnvLocal()
  await fs.mkdir(ITEMS_DIR, { recursive: true })

  const allWeaponIds = await listWeaponIds()
  const filtered = allWeaponIds.filter((id) => {
    if (ONLY_IDS && !ONLY_IDS.has(id)) return false
    if (!INCLUDE_GOOD && KEEP_GOOD.has(id)) return false
    return true
  })

  if (!filtered.length) {
    console.log('Nenhuma arma para regenerar com os filtros atuais.')
    return
  }

  let ok = 0
  let fail = 0
  for (const id of filtered) {
    const outPath = path.join(ITEMS_DIR, `${id}_realistic.png`)
    if (!FORCE) {
      try {
        const st = await fs.stat(outPath)
        if (st.size > 1024) {
          console.log(`Skip existente: ${id}`)
          continue
        }
      } catch {}
    }

    const prompt = buildWeaponPrompt(id)
    process.stdout.write(`Gerando ${id}... `)
    try {
      const { provider, buffer } = await generateImage({ prompt })
      await fs.writeFile(outPath, buffer)
      console.log(`ok (${provider})`)
      ok += 1
    } catch (error) {
      console.log(`falhou (${error.message})`)
      fail += 1
    }
  }

  console.log(JSON.stringify({ provider: PROVIDER, total: filtered.length, ok, fail }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
