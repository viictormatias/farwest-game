import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const ITEMS_DIR = path.join(ROOT, 'public', 'images', 'items')
const ENEMIES_DIR = path.join(ROOT, 'public', 'images', 'enemies')
const IDS_ARG = process.argv.find((arg) => arg.startsWith('--ids='))
const ONLY_IDS = IDS_ARG
  ? new Set(IDS_ARG.split('=')[1].split(',').map((s) => s.trim()).filter(Boolean))
  : null
const FORCE = process.argv.includes('--force')

const envRaw = await fs.readFile(path.join(ROOT, '.env.local'), 'utf8')
for (const line of envRaw.split(/\r?\n/)) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx === -1) continue
  const key = trimmed.slice(0, idx).trim()
  const value = trimmed.slice(idx + 1).trim()
  if (!process.env[key]) process.env[key] = value
}

const API_KEY = process.env.LEONARDO_API_KEY
if (!API_KEY) throw new Error('Missing LEONARDO_API_KEY')

const NEGATIVE = 'cartoon, anime, illustration, painting, text, watermark, blurry, lowres, deformed, fantasy armor, medieval'

const SET_ITEMS = [
  { id: 'xama_tormenta_epic_weapon', dir: ITEMS_DIR, prompt: 'Super realistic Wild West mystic rifle with ritual engravings and crow feathers tied to the stock. Cinematic lighting, studio black background. Isolated object. Photorealistic, HDR, 8k quality.' },
  { id: 'xama_tormenta_epic_helmet', dir: ITEMS_DIR, prompt: 'Super realistic Wild West shaman hat with hanging crow feathers and small amulets. Cinematic lighting, studio black background. Isolated object. Photorealistic, HDR, 8k quality.' },
  { id: 'xama_tormenta_epic_chest', dir: ITEMS_DIR, prompt: 'Super realistic Wild West leather coat engraved with mystic protection symbols. Cinematic lighting, studio black background. Isolated object. Photorealistic, HDR, 8k quality.' },
  { id: 'xama_tormenta_epic_gloves', dir: ITEMS_DIR, prompt: 'Super realistic Wild West thin leather gloves for ritual precision, fine stitching. Cinematic lighting, studio black background. Isolated object. Photorealistic, HDR, 8k quality.' },
  { id: 'xama_tormenta_epic_legs', dir: ITEMS_DIR, prompt: 'Super realistic Wild West mystic fabric and light leather pants with ritual markings. Cinematic lighting, studio black background. Isolated object. Photorealistic, HDR, 8k quality.' },
  { id: 'xama_tormenta_epic_boots', dir: ITEMS_DIR, prompt: 'Super realistic Wild West silent lightweight leather boots. Cinematic lighting, studio black background. Isolated object. Photorealistic, HDR, 8k quality.' },
  { id: 'xama_tormenta_epic_shield', dir: ITEMS_DIR, prompt: 'Super realistic Wild West forearm bracer with embedded ritual gemstones. Cinematic lighting, studio black background. Isolated object. Photorealistic, HDR, 8k quality.' },
  { id: 'fantasma_deserto_legendary_weapon', dir: ITEMS_DIR, prompt: 'Super realistic Wild West revolver wrapped in faded desert camouflage cloth, sand trail. Cinematic lighting, studio black background. Isolated object. Photorealistic, HDR, 8k quality.' },
  { id: 'fantasma_deserto_legendary_helmet', dir: ITEMS_DIR, prompt: 'Super realistic Wild West hat with partial face veil, desert sand tones. Cinematic lighting, studio black background. Isolated object. Photorealistic, HDR, 8k quality.' },
  { id: 'fantasma_deserto_legendary_chest', dir: ITEMS_DIR, prompt: 'Super realistic Wild West flowing desert cape that blends with sand, matte fabric. Cinematic lighting, studio black background. Isolated object. Photorealistic, HDR, 8k quality.' },
  { id: 'fantasma_deserto_legendary_gloves', dir: ITEMS_DIR, prompt: 'Super realistic Wild West lightweight desert duelist gloves wrapped in sand-worn cloth, matte leather, silent precision aesthetic. Cinematic lighting, studio black background. Isolated object. Photorealistic, HDR, 8k quality.' },
  { id: 'fantasma_deserto_legendary_legs', dir: ITEMS_DIR, prompt: 'Super realistic Wild West agile desert pants with layered sand-colored cloth, light leather reinforcement, worn folds and stealth silhouette. Cinematic lighting, studio black background. Isolated object. Photorealistic, HDR, 8k quality.' },
  { id: 'fantasma_deserto_legendary_boots', dir: ITEMS_DIR, prompt: 'Super realistic Wild West lightweight matte desert boots with wrapped gaiters, dust-covered leather and stealth movement design. Cinematic lighting, studio black background. Isolated object. Photorealistic, HDR, 8k quality.' },
  { id: 'fantasma_deserto_legendary_shield', dir: ITEMS_DIR, prompt: 'Super realistic Wild West lightweight matte forearm guard, non-reflective dark surface. Cinematic lighting, studio black background. Isolated object. Photorealistic, HDR, 8k quality.' },
]

const ENEMIES = [
  { id: 'larapio_de_saloon', dir: ENEMIES_DIR, prompt: 'Super realistic Wild West saloon thief, scrawny man with a dirty face, shifty eyes, torn vest, hiding a knife behind his back. Cinematic dramatic lighting, dark saloon background. Portrait bust shot. Photorealistic, HDR, 8k quality.' },
  { id: 'bandido_de_estrada', dir: ENEMIES_DIR, prompt: 'Super realistic Wild West road bandit, masked outlaw with dusty clothes, bandana over face, holding a rusty revolver. Cinematic lighting, desert road background. Portrait bust shot. Photorealistic, HDR, 8k quality.' },
  { id: 'saqueador_ardil', dir: ENEMIES_DIR, prompt: 'Super realistic Wild West cunning raider, wiry man with a sly grin, leather armor, dual knives. Cinematic lighting, rocky canyon background. Portrait bust shot. Photorealistic, HDR, 8k quality.' },
  { id: 'desperado_solitario', dir: ENEMIES_DIR, prompt: 'Super realistic Wild West lone desperado, tall gunslinger with a weathered duster coat, wide-brimmed hat casting shadow over his scarred face, dual revolvers at his hips. Cinematic lighting, dusty town background. Portrait bust shot. Photorealistic, HDR, 8k quality.' },
  { id: 'xerife_renegado', dir: ENEMIES_DIR, prompt: 'Super realistic Wild West renegade sheriff, corrupt lawman with a tarnished badge, cold eyes, heavy mustache, shotgun resting on his shoulder. Cinematic lighting, jailhouse background. Portrait bust shot. Photorealistic, HDR, 8k quality.' },
  { id: 'pistoleiro_lendario', dir: ENEMIES_DIR, prompt: 'Super realistic Wild West legendary gunslinger, iconic figure with silver-engraved revolvers, black hat, intense stare, long dark coat billowing. Cinematic lighting, sunset duel background. Portrait bust shot. Photorealistic, HDR, 8k quality.' },
]

const ALL = [...SET_ITEMS, ...ENEMIES]
const QUEUE = ONLY_IDS ? ALL.filter((item) => ONLY_IDS.has(item.id)) : ALL

async function generateOne(item) {
  const suffix = item.dir === ENEMIES_DIR ? '' : '_realistic'
  const outPath = path.join(item.dir, `${item.id}${suffix}.png`)

  if (!FORCE) {
    try {
      const existing = await fs.stat(outPath)
      if (existing.size > 1024) {
        console.log(`SKIP (exists): ${item.id}`)
        return true
      }
      console.log(`RETRY (invalid file): ${item.id}`)
    } catch {}
  }

  console.log(`Generating: ${item.id}...`)

  const submitRes = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      height: 512,
      width: 512,
      modelId: '5c232a9e-9061-4777-980a-ddc8e65647c6',
      prompt: item.prompt,
      negative_prompt: NEGATIVE,
      num_images: 1,
      alchemy: false,
      photoReal: false,
    }),
  })

  if (!submitRes.ok) {
    const body = await submitRes.text()
    console.error(`FAIL submit ${item.id}: ${submitRes.status} ${body}`)
    return false
  }

  const submitJson = await submitRes.json()
  const generationId = submitJson.sdGenerationJob.generationId
  console.log(`  Submitted, ID: ${generationId}. Polling...`)

  let imageUrl = null
  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const pollRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
      headers: { accept: 'application/json', authorization: `Bearer ${API_KEY}` },
    })
    if (!pollRes.ok) continue
    const pollJson = await pollRes.json()
    const generation = pollJson.generations_by_pk
    if (generation.status === 'COMPLETE') {
      imageUrl = generation.generated_images[0].url
      break
    }
    if (generation.status === 'FAILED') {
      console.error(`  FAILED generation ${generationId}`)
      return false
    }
  }

  if (!imageUrl) {
    console.error(`  TIMEOUT ${generationId}`)
    return false
  }

  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) {
    console.error(`  Download failed ${imageUrl}`)
    return false
  }

  const buf = Buffer.from(await imgRes.arrayBuffer())
  await fs.writeFile(outPath, buf)
  console.log(`  Saved: ${outPath}`)
  return true
}

await fs.mkdir(ITEMS_DIR, { recursive: true })
await fs.mkdir(ENEMIES_DIR, { recursive: true })

let success = 0
let fail = 0
for (const item of QUEUE) {
  const ok = await generateOne(item)
  if (ok) success++
  else fail++
  await new Promise((resolve) => setTimeout(resolve, 500))
}

console.log(`\nDone. Success: ${success}, Failed: ${fail}`)
