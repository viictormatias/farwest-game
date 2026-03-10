import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const ENV_PATH = path.join(ROOT, '.env.local')
const ITEMS_DIR = path.join(ROOT, 'public', 'images', 'items')
const ENEMIES_DIR = path.join(ROOT, 'public', 'images', 'enemies')
const HISTORY_DIR = path.join(ROOT, 'public', 'images', 'leonardo-history')
const METADATA_DIR = path.join(ROOT, 'artifacts')

const MAX_PAGES = 30
const PAGE_SIZE = 50
const DOWNLOAD_ALL_HISTORY = true

const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary']
const TYPES = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'shield']
const TYPE_TOKENS = {
  weapon: ['arma', 'weapon', 'rifle', 'revolver', 'escopeta', 'carabina'],
  helmet: ['chapeu', 'hat', 'helmet', 'cabeca'],
  chest: ['casaco', 'coat', 'chest', 'torso', 'poncho', 'trenchcoat'],
  gloves: ['luvas', 'gloves'],
  legs: ['perneiras', 'calcas', 'pants', 'legs', 'chaps'],
  boots: ['botas', 'boots'],
  shield: ['bracadeira', 'shield', 'arm', 'guard', 'buckler', 'bandolier']
}

const SET_KEY_TO_NAME = {
  pistoleiro_estrada: 'Pistoleiro da Estrada',
  forasteiro_po: 'Forasteiro do Po',
  garimpeiro_cobre: 'Garimpeiro de Cobre',
  rastreador_canyon: 'Rastreador de Canyon',
  mercenario_fronteira: 'Mercenario da Fronteira',
  pregador_cinzento: 'Pregador Cinzento',
  cacador_recompensas: 'Cacador de Recompensas',
  bandoleiro_sombrio: 'Bandoleiro Sombrio',
  guarda_velha: 'Guarda Velha',
  duelista_carmesim: 'Duelista Carmesim',
  guardiao_aco: 'Guardiao de Aco',
  xama_tormenta: 'Xama da Tormenta',
  xerife_lendario: 'Xerife Lendario',
  fantasma_deserto: 'Fantasma do Deserto',
  lobo_tempestade: 'Lobo da Tempestade',
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

function tokensOf(text) {
  return normalize(text).split(' ').filter((t) => t.length >= 3)
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

async function getLeonardoUser(apiKey) {
  const res = await fetch('https://cloud.leonardo.ai/api/rest/v1/me', {
    headers: { accept: 'application/json', authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(`Leonardo /me failed: ${res.status}`)
  const json = await res.json()
  const user = json?.user_details?.[0]?.user
  if (!user?.id) throw new Error('Leonardo user id not found')
  return user
}

async function fetchGenerationPage(apiKey, userId, offset, limit) {
  const url = `https://cloud.leonardo.ai/api/rest/v1/generations/user/${userId}?offset=${offset}&limit=${limit}`
  const res = await fetch(url, {
    headers: { accept: 'application/json', authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(`generations page failed: ${res.status} offset=${offset}`)
  const json = await res.json()
  return json.generations || []
}

async function fetchAllGenerations(apiKey, userId) {
  const out = []
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const offset = page * PAGE_SIZE
    const batch = await fetchGenerationPage(apiKey, userId, offset, PAGE_SIZE)
    if (!batch.length) break
    out.push(...batch)
    if (batch.length < PAGE_SIZE) break
  }
  return out
}

async function downloadImage(url, outPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download failed: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(outPath, buf)
}

async function fetchEnemies() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data, error } = await supabase
    .from('npc_enemies')
    .select('id,name')
    .order('level', { ascending: true })
  if (error) throw error
  return data || []
}

async function buildItemTargets() {
  const targets = []
  const files = await fs.readdir(ITEMS_DIR)
  const seen = new Set()

  for (const file of files) {
    if (!file.endsWith('_realistic.png')) continue
    const stem = file.replace(/\.png$/i, '')
    const id = stem.replace(/_realistic$/i, '')
    if (seen.has(id)) continue
    seen.add(id)
    const parts = id.split('_')
    const rarityIdx = parts.findIndex((p) => RARITIES.includes(p))
    if (rarityIdx > 0 && rarityIdx < parts.length - 1) {
      const key = parts.slice(0, rarityIdx).join('_')
      const type = parts[parts.length - 1]
      if (SET_KEY_TO_NAME[key] && TYPES.includes(type)) {
        const setTokens = tokensOf(SET_KEY_TO_NAME[key])
        const typeTokens = TYPE_TOKENS[type] || []
        targets.push({
          kind: 'item',
          id,
          outPath: path.join(ITEMS_DIR, `${id}_realistic.png`),
          coreTokens: setTokens,
          supportTokens: typeTokens,
        })
        continue
      }
    }

    // fallback for legacy items by id tokenization
    const fallback = tokensOf(id.replace(/_/g, ' '))
    targets.push({
      kind: 'item',
      id,
      outPath: path.join(ITEMS_DIR, `${id}_realistic.png`),
      coreTokens: fallback.slice(0, 3),
      supportTokens: fallback,
    })
  }
  return targets
}

function bestMatchForTarget(target, generations) {
  let best = null
  for (const gen of generations) {
    const prompt = normalize(gen.prompt || '')
    const url = gen.generated_images?.[0]?.url
    if (!prompt || !url) continue

    const coreHits = target.coreTokens.filter((t) => prompt.includes(t)).length
    const supportHits = target.supportTokens.filter((t) => prompt.includes(t)).length
    const minCore = Math.max(1, Math.min(2, target.coreTokens.length))

    if (coreHits < minCore) continue

    const score = coreHits * 10 + supportHits
    const createdAt = new Date(gen.createdAt || 0).getTime() || 0

    if (!best || score > best.score || (score === best.score && createdAt > best.createdAt)) {
      best = { score, createdAt, url, generationId: gen.id || null, prompt: gen.prompt || '' }
    }
  }
  return best
}

async function fileExists(fp) {
  try {
    const st = await fs.stat(fp)
    return st.size > 1024
  } catch {
    return false
  }
}

async function main() {
  await loadEnvLocal()
  await fs.mkdir(HISTORY_DIR, { recursive: true })
  await fs.mkdir(METADATA_DIR, { recursive: true })

  const apiKey = process.env.LEONARDO_API_KEY
  if (!apiKey) throw new Error('LEONARDO_API_KEY missing')

  const user = await getLeonardoUser(apiKey)
  const generations = await fetchAllGenerations(apiKey, user.id)
  const metadataPath = path.join(METADATA_DIR, `leonardo-history-${user.username}.json`)
  await fs.writeFile(metadataPath, JSON.stringify(generations, null, 2), 'utf8')

  let historyDownloaded = 0
  if (DOWNLOAD_ALL_HISTORY) {
    for (const gen of generations) {
      const url = gen.generated_images?.[0]?.url
      if (!url) continue
      const id = gen.id || gen.generationId || Math.random().toString(36).slice(2)
      const outPath = path.join(HISTORY_DIR, `${id}.jpg`)
      if (await fileExists(outPath)) continue
      try {
        await downloadImage(url, outPath)
        historyDownloaded += 1
      } catch {
        // continue
      }
    }
  }

  const itemTargets = await buildItemTargets()
  const enemies = await fetchEnemies()
  const enemyTargets = enemies.map((enemy) => ({
    kind: 'enemy',
    id: enemy.id,
    outPath: path.join(ENEMIES_DIR, `${enemy.id}.png`),
    coreTokens: tokensOf(enemy.name).slice(0, 4),
    supportTokens: tokensOf(enemy.name),
  }))

  let itemsSynced = 0
  let itemsNoMatch = 0
  for (const target of itemTargets) {
    const hit = bestMatchForTarget(target, generations)
    if (!hit) {
      itemsNoMatch += 1
      continue
    }
    try {
      await downloadImage(hit.url, target.outPath)
      itemsSynced += 1
    } catch {
      // continue
    }
  }

  let enemiesSynced = 0
  let enemiesNoMatch = 0
  for (const target of enemyTargets) {
    const hit = bestMatchForTarget(target, generations)
    if (!hit) {
      enemiesNoMatch += 1
      continue
    }
    try {
      await downloadImage(hit.url, target.outPath)
      enemiesSynced += 1
    } catch {
      // continue
    }
  }

  console.log(
    JSON.stringify(
      {
        user: user.username,
        userId: user.id,
        generationsScanned: generations.length,
        metadataPath,
        historyDownloaded,
        itemsTargets: itemTargets.length,
        itemsSynced,
        itemsNoMatch,
        enemiesTargets: enemyTargets.length,
        enemiesSynced,
        enemiesNoMatch,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
