import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const ENV_PATH = path.join(ROOT, '.env.local')
const OUT_DIR = path.join(ROOT, 'public', 'images', 'items')
const IDS_ARG = process.argv.find((arg) => arg.startsWith('--ids='))
const ONLY_IDS = IDS_ARG
  ? new Set(IDS_ARG.split('=')[1].split(',').map((s) => s.trim()).filter(Boolean))
  : null

const STYLE_BIBLE = [
  'Super realistic Wild West visual language, grounded and gritty.',
  'Natural skin/leather/linen/metal/wood textures, visible wear, dust, scratches and micro-details.',
  'Dramatic low-key cinematic lighting with deep contrast and controlled highlights.',
  'Studio black background with very subtle texture and no scenery pollution.',
  'Consistent art direction with the original project assets.',
  'Photorealistic rendering, HDR, filmic color grade, fine film grain, ultra-detailed, 8k quality.',
  'No fantasy ornaments, no sci-fi shapes, no cartoon look, no stylized painterly brushwork.',
].join(' ')

const NEGATIVE_PROMPT = [
  'cartoon', 'anime', 'illustration', 'painting', 'concept art',
  'low poly', '3d render look', 'plastic material', 'toy',
  'fantasy armor', 'medieval fantasy', 'sci-fi',
  'neon cyberpunk', 'oversaturated colors',
  'text', 'letters', 'watermark', 'logo', 'signature',
  'blurry', 'lowres', 'artifact', 'deformed',
].join(', ')

const TYPE_CONTEXT = {
  weapon: 'Hero prop shot of a western weapon, gunmetal and oiled wood emphasized.',
  shield: 'Standalone defensive accessory only, mounted on mannequin torso or display stand, no person visible.',
  chest: 'Western garment as the main subject, fabric and stitching in focus.',
  helmet: 'Standalone headgear only on neutral wooden stand, no human face visible.',
  gloves: 'Close-up on hands wearing the gloves, leather grain and seams highly detailed.',
  legs: 'Framing with the pants/chaps in action-ready stance, cloth folds and abrasion marks visible.',
  boots: 'Framing focused on boots, cracked leather and worn metal details highlighted.',
}

const ITEMS = [
  { id: 'lobo_tempestade_legendary_weapon', name: 'Escopeta do Lobo da Tempestade', type: 'weapon', description: 'Arma forjada nas tormentas de sal, metal corroido e madeira pesada.' },
  { id: 'lobo_tempestade_legendary_helmet', name: 'Chapeu do Lobo da Tempestade', type: 'helmet', description: 'Chapeu pesado com marcas de sal e vento.' },
  { id: 'lobo_tempestade_legendary_chest', name: 'Casaco do Lobo da Tempestade', type: 'chest', description: 'Casaco reforcado para aguentar tempestades e chumbo.' },
  { id: 'lobo_tempestade_legendary_gloves', name: 'Luvas do Lobo da Tempestade', type: 'gloves', description: 'Luvas de couro grosso com protetores metalicos.' },
  { id: 'lobo_tempestade_legendary_legs', name: 'Perneiras do Lobo da Tempestade', type: 'legs', description: 'Perneiras pesadas com reforco de metal escovado.' },
  { id: 'lobo_tempestade_legendary_boots', name: 'Botas do Lobo da Tempestade', type: 'boots', description: 'Botas ferradas para terrenos crueis.' },
  { id: 'lobo_tempestade_legendary_shield', name: 'Bracadeira do Lobo da Tempestade', type: 'shield', description: 'Escudo de braco feito de metal de naufragio.' },
  { id: 'xama_tormenta_epic_weapon', name: 'Carabina do Xama da Tormenta', type: 'weapon', description: 'Rifle mistico com entalhes rituais e penas.' },
  { id: 'xama_tormenta_epic_helmet', name: 'Chapeu do Xama da Tormenta', type: 'helmet', description: 'Chapeu com amuletos e penas de corvo penduradas.' },
  { id: 'xama_tormenta_epic_chest', name: 'Casaco do Xama da Tormenta', type: 'chest', description: 'Casaco de couro gravado com simbolos de protecao.' },
  { id: 'xama_tormenta_epic_gloves', name: 'Luvas do Xama da Tormenta', type: 'gloves', description: 'Luvas finas para precisao ritual.' },
  { id: 'xama_tormenta_epic_legs', name: 'Perneiras do Xama da Tormenta', type: 'legs', description: 'Calcas de tecido mistico e couro leve.' },
  { id: 'xama_tormenta_epic_boots', name: 'Botas do Xama da Tormenta', type: 'boots', description: 'Botas silenciosas e leves.' },
  { id: 'xama_tormenta_epic_shield', name: 'Bracadeira do Xama da Tormenta', type: 'shield', description: 'Bracadeira com pedras rituais incrustadas.' },
  { id: 'fantasma_deserto_legendary_weapon', name: 'Revolver do Fantasma do Deserto', type: 'weapon', description: 'Pistola envolta em panos de camuflagem, rastro de areia.' },
  { id: 'fantasma_deserto_legendary_helmet', name: 'Chapeu do Fantasma do Deserto', type: 'helmet', description: 'Chapeu com veu parcial para esconder o rosto.' },
  { id: 'fantasma_deserto_legendary_chest', name: 'Casaco do Fantasma do Deserto', type: 'chest', description: 'Capa esvoacante que se mistura com a areia.' },
  { id: 'fantasma_deserto_legendary_gloves', name: 'Luvas do Fantasma do Deserto', type: 'gloves', description: 'Luvas leves envoltas em tecido arenoso para saques silenciosos.' },
  { id: 'fantasma_deserto_legendary_legs', name: 'Perneiras do Fantasma do Deserto', type: 'legs', description: 'Perneiras de couro leve e tecido do deserto para mobilidade extrema.' },
  { id: 'fantasma_deserto_legendary_boots', name: 'Botas do Fantasma do Deserto', type: 'boots', description: 'Botas foscas feitas para correr sobre a areia sem deixar rastro.' },
  { id: 'fantasma_deserto_legendary_shield', name: 'Bracadeira do Fantasma do Deserto', type: 'shield', description: 'Protecao leve e fosca para nao refletir a luz.' },
]

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

function buildRealisticPrompt(item) {
  return [
    'Super realistic western item render for a Wild West RPG asset.',
    `Item name: ${item.name}.`,
    `Item description: ${item.description}.`,
    TYPE_CONTEXT[item.type] || 'Hero prop shot with western framing.',
    'The subject is centered, dominant in frame, physically plausible and battle-worn.',
    'Lighting: key light from left, soft rim light from right, deep shadows shaping form.',
    'Material fidelity: worn leather, heavy linen, tarnished steel, aged wood, dust and trail grime.',
    'Background: deep black with subtle texture, no distracting elements.',
    STYLE_BIBLE,
  ].join(' ')
}

async function generateImage({ apiKey, prompt, negativePrompt }) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt: `${prompt}. Negative prompt: ${negativePrompt}` }],
      parameters: { sampleCount: 1, aspectRatio: '1:1', outputMimeType: 'image/png' },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Gemini API Error ${response.status}: ${errorBody}`)
  }

  const data = await response.json()
  const bytesBase64 = data.predictions?.[0]?.bytesBase64
  if (!bytesBase64) throw new Error('No image bytes returned from Gemini API')
  return Buffer.from(bytesBase64, 'base64')
}

async function main() {
  await loadEnvLocal()
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not found in .env.local')

  await fs.mkdir(OUT_DIR, { recursive: true })
  const queue = ONLY_IDS ? ITEMS.filter((item) => ONLY_IDS.has(item.id)) : ITEMS

  for (const item of queue) {
    const outPath = path.join(OUT_DIR, `${item.id}_realistic.png`)
    try {
      const existing = await fs.stat(outPath)
      if (existing.size > 1024) {
        console.log(`Skipping (already exists): ${item.name}`)
        continue
      }
    } catch {}

    console.log(`Generating image for: ${item.name}...`)
    try {
      const prompt = buildRealisticPrompt(item)
      const buffer = await generateImage({ apiKey, prompt, negativePrompt: NEGATIVE_PROMPT })
      await fs.writeFile(outPath, buffer)
      console.log(`Saved: ${outPath}`)
    } catch (error) {
      console.error(`Failed for ${item.name}:`, error.message)
    }
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  console.log('Done.')
}

main().catch(console.error)
