import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const ENV_PATH = path.join(ROOT, '.env.local')
const ENEMIES_DIR = path.join(ROOT, 'public', 'images', 'enemies')
const FORCE = process.argv.includes('--force')

const NEGATIVE_PROMPT = [
  'cartoon', 'anime', 'illustration', 'painting', 'concept art',
  'text', 'letters', 'watermark', 'logo', 'signature',
  'blurry', 'lowres', 'deformed face', 'extra limbs',
  'sci-fi', 'cyberpunk', 'modern city', 'futuristic armor',
].join(', ')

const LEGACY_NAME_SLUG = {
  'Larápio de Saloon': 'larapio_de_saloon',
  'Saqueador Ardil': 'saqueador_ardil',
  'Bandido de Estrada': 'bandido_de_estrada',
  'Desperado Solitário': 'desperado_solitario',
  'Xerife Renegado': 'xerife_renegado',
  'Pistoleiro Lendário': 'pistoleiro_lendario',
}

function normalizeName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function portraitPrompt(enemy) {
  const n = normalizeName(enemy.name)
  const style = enemy.level >= 20 ? 'legendary notorious outlaw' : 'frontier outlaw'
  const tone = enemy.level >= 20
    ? 'dark dramatic cinematic portrait, feared and famous gunslinger'
    : 'gritty realistic western portrait, dangerous frontier criminal'

  return [
    'Ultra realistic Wild West character portrait for a game enemy card.',
    `Character: ${n}.`,
    `Level ${enemy.level}, HP ${enemy.hp_max}, strength ${enemy.strength}, agility ${enemy.agility}, precision ${enemy.precision}.`,
    `Archetype: ${style}.`,
    tone + '.',
    'Bust portrait, shoulders up, looking at camera, centered framing.',
    'Wardrobe and props must match far-west late 1800s: hat, leather duster, holster, revolver/rifle appropriate to character.',
    'Natural skin texture, dusty clothes, worn leather, steel details.',
    'Cinematic low-key lighting with strong rim light, high detail, photorealistic.',
    'Background: blurred old western town at dusk or saloon interior, no modern objects.',
    'No text or watermark. Single person only.',
  ].join(' ')
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

async function fetchEnemies() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) throw new Error('Missing supabase envs')
  const supabase = createClient(url, anon)
  const { data, error } = await supabase
    .from('npc_enemies')
    .select('id,name,level,hp_max,strength,agility,precision')
    .order('level', { ascending: true })
  if (error) throw error
  return data || []
}

async function fileExists(fp) {
  try {
    const st = await fs.stat(fp)
    return st.size > 1024
  } catch {
    return false
  }
}

async function copyLegacyIfAvailable(enemy, outPath) {
  const slug = LEGACY_NAME_SLUG[enemy.name]
  if (!slug) return false
  const legacyPng = path.join(ENEMIES_DIR, `${slug}.png`)
  if (!(await fileExists(legacyPng))) return false
  await fs.copyFile(legacyPng, outPath)
  return true
}

async function generateWithLeonardo(apiKey, prompt) {
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
      negative_prompt: NEGATIVE_PROMPT,
      num_images: 1,
      alchemy: false,
      photoReal: false,
    }),
  })

  if (!submitRes.ok) {
    const body = await submitRes.text()
    throw new Error(`submit ${submitRes.status}: ${body}`)
  }

  const submitJson = await submitRes.json()
  const generationId = submitJson.sdGenerationJob.generationId
  const pollUrl = `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`

  let imageUrl = null
  for (let i = 0; i < 40; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2500))
    const pollRes = await fetch(pollUrl, {
      headers: { accept: 'application/json', authorization: `Bearer ${apiKey}` },
    })
    if (!pollRes.ok) continue
    const pollJson = await pollRes.json()
    const generation = pollJson.generations_by_pk
    if (generation?.status === 'COMPLETE') {
      imageUrl = generation.generated_images?.[0]?.url || null
      break
    }
    if (generation?.status === 'FAILED') {
      throw new Error(`generation failed: ${generationId}`)
    }
  }

  if (!imageUrl) throw new Error(`timeout: ${generationId}`)

  const imageRes = await fetch(imageUrl)
  if (!imageRes.ok) throw new Error(`download failed: ${imageUrl}`)
  return Buffer.from(await imageRes.arrayBuffer())
}

async function main() {
  await loadEnvLocal()
  await fs.mkdir(ENEMIES_DIR, { recursive: true })

  const apiKey = process.env.LEONARDO_API_KEY
  if (!apiKey) throw new Error('LEONARDO_API_KEY not found in .env.local')

  const enemies = await fetchEnemies()

  let ok = 0
  let copied = 0
  let skipped = 0
  let failed = 0

  for (const enemy of enemies) {
    const outPath = path.join(ENEMIES_DIR, `${enemy.id}.png`)

    if (!FORCE && (await fileExists(outPath))) {
      skipped += 1
      console.log(`SKIP ${enemy.name} (${enemy.id})`)
      continue
    }

    if (!FORCE) {
      const copiedLegacy = await copyLegacyIfAvailable(enemy, outPath)
      if (copiedLegacy) {
        copied += 1
        console.log(`COPY ${enemy.name} -> ${enemy.id}.png`)
        continue
      }
    }

    try {
      console.log(`GEN ${enemy.name} (${enemy.level})`)
      const prompt = portraitPrompt(enemy)
      const buf = await generateWithLeonardo(apiKey, prompt)
      await fs.writeFile(outPath, buf)
      ok += 1
      await new Promise((resolve) => setTimeout(resolve, 600))
    } catch (error) {
      failed += 1
      console.error(`FAIL ${enemy.name}: ${error?.message || error}`)
    }
  }

  console.log(`done ok=${ok} copied=${copied} skipped=${skipped} failed=${failed}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
