import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const ENV_PATH = path.join(ROOT, '.env.local')
const OUT_DIR = path.join(ROOT, 'public', 'classes')

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

async function generateImage({ model, apiKey, prompt }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    })
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body}`)
  }

  const json = await res.json()
  const parts = json?.candidates?.[0]?.content?.parts || []
  const inlinePart = parts.find((p) => p.inlineData?.data)
  if (!inlinePart) {
    throw new Error(`Resposta sem imagem: ${JSON.stringify(json)}`)
  }
  return {
    mimeType: inlinePart.inlineData.mimeType || 'image/png',
    data: inlinePart.inlineData.data
  }
}

async function main() {
  await loadEnvLocal()

  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY nao encontrada no .env.local')
  }

  await fs.mkdir(OUT_DIR, { recursive: true })

  const modelCandidates = [
    'gemini-3.1-flash-image-preview',
    'gemini-2.5-flash-image',
    'gemini-2.0-flash-exp-image-generation'
  ]

  const classes = [
    {
      file: 'cavaleiro.png',
      prompt:
        'Dark medieval RPG character portrait, human knight, steel plate armor, blue heraldry, dramatic rim light, realistic fantasy art, front-facing bust, clean background, no text, no watermark'
    },
    {
      file: 'nobre.png',
      prompt:
        'Dark medieval RPG character portrait, noble duelist, elegant gold and black attire with light armor, confident expression, realistic fantasy art, front-facing bust, clean background, no text, no watermark'
    },
    {
      file: 'errante.png',
      prompt:
        'Dark medieval RPG character portrait, wandering mercenary, worn leather and cloak, rugged face, realistic fantasy art, front-facing bust, clean background, no text, no watermark'
    }
  ]

  let selectedModel = null
  for (const model of modelCandidates) {
    try {
      const test = await generateImage({
        model,
        apiKey,
        prompt: 'Fantasy portrait test image, no text'
      })
      if (test?.data) {
        selectedModel = model
        break
      }
    } catch (err) {
      console.log(`Falha no modelo ${model}: ${err.message}`)
    }
  }

  if (!selectedModel) {
    throw new Error('Nenhum modelo de imagem Gemini respondeu com sucesso. Verifique API key/modelo.')
  }

  console.log(`Modelo selecionado: ${selectedModel}`)

  for (const cls of classes) {
    const result = await generateImage({
      model: selectedModel,
      apiKey,
      prompt: cls.prompt
    })

    const ext = result.mimeType.includes('jpeg') ? 'jpg' : 'png'
    const fileName = cls.file.replace(/\.(png|jpg|jpeg)$/i, `.${ext}`)
    const out = path.join(OUT_DIR, fileName)
    await fs.writeFile(out, Buffer.from(result.data, 'base64'))
    console.log(`Gerado: ${path.relative(ROOT, out)}`)
  }
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
