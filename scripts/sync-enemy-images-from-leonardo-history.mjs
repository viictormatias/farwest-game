import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const ENV_PATH = path.join(ROOT, '.env.local')
const ENEMIES_DIR = path.join(ROOT, 'public', 'images', 'enemies')
const MAX_PAGES = 8
const PAGE_SIZE = 50

function normalize(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
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

async function fetchEnemies() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data, error } = await supabase
    .from('npc_enemies')
    .select('id,name,level')
    .order('level', { ascending: true })
  if (error) throw error
  return data || []
}

async function getLeonardoUser(apiKey) {
  const res = await fetch('https://cloud.leonardo.ai/api/rest/v1/me', {
    headers: { accept: 'application/json', authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(`me ${res.status}`)
  const json = await res.json()
  const userId = json?.user_details?.[0]?.user?.id
  if (!userId) throw new Error('user id not found in /me')
  return userId
}

async function fetchGenerationPage(apiKey, userId, offset, limit) {
  const url = `https://cloud.leonardo.ai/api/rest/v1/generations/user/${userId}?offset=${offset}&limit=${limit}`
  const res = await fetch(url, {
    headers: { accept: 'application/json', authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(`generations ${res.status} offset=${offset}`)
  const json = await res.json()
  return json.generations || []
}

function findBestByEnemy(enemies, generations) {
  const byEnemy = new Map()
  const enemyMatchers = enemies.map((enemy) => {
    const clean = normalize(enemy.name)
    const tokens = clean.split(' ').filter((t) => t.length >= 3)
    return { enemy, clean, tokens }
  })

  for (const gen of generations) {
    const prompt = normalize(gen.prompt || '')
    const imageUrl = gen.generated_images?.[0]?.url
    if (!prompt || !imageUrl) continue

    for (const { enemy, clean, tokens } of enemyMatchers) {
      const fullMatch = prompt.includes(clean)
      const tokenHits = tokens.filter((t) => prompt.includes(t)).length
      const softMatch = tokenHits >= Math.min(3, tokens.length)
      if (!fullMatch && !softMatch) continue

      const prev = byEnemy.get(enemy.id)
      const createdAt = new Date(gen.createdAt || 0).getTime() || 0
      if (!prev || createdAt > prev.createdAt) {
        byEnemy.set(enemy.id, { createdAt, imageUrl, promptRaw: gen.prompt || '' })
      }
    }
  }

  return byEnemy
}

async function downloadTo(url, outPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(outPath, buf)
}

async function main() {
  await loadEnvLocal()
  await fs.mkdir(ENEMIES_DIR, { recursive: true })

  const apiKey = process.env.LEONARDO_API_KEY
  if (!apiKey) throw new Error('LEONARDO_API_KEY missing')

  const enemies = await fetchEnemies()
  const userId = await getLeonardoUser(apiKey)

  const allGenerations = []
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const offset = page * PAGE_SIZE
    const batch = await fetchGenerationPage(apiKey, userId, offset, PAGE_SIZE)
    if (!batch.length) break
    allGenerations.push(...batch)
    if (batch.length < PAGE_SIZE) break
  }

  const best = findBestByEnemy(enemies, allGenerations)
  let synced = 0
  let missing = 0

  for (const enemy of enemies) {
    const hit = best.get(enemy.id)
    if (!hit) {
      missing += 1
      console.log(`MISS ${enemy.name}`)
      continue
    }
    const outPath = path.join(ENEMIES_DIR, `${enemy.id}.png`)
    await downloadTo(hit.imageUrl, outPath)
    synced += 1
    console.log(`SYNC ${enemy.name} -> ${enemy.id}.png`)
  }

  console.log(`done synced=${synced} missing=${missing} generations_scanned=${allGenerations.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
