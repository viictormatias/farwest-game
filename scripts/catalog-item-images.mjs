import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const ITEMS_TS = path.join(ROOT, 'src', 'lib', 'items.ts')
const OUT_DIR = path.join(ROOT, 'artifacts')
const OUT_CSV = path.join(OUT_DIR, 'prelista-imagens-itens.csv')
const OUT_MD = path.join(OUT_DIR, 'prelista-imagens-itens.md')

const SLOT_DESC = {
  weapon: 'Arma de fogo/combate do Velho Oeste',
  helmet: 'Chapéu/cobertura de cabeça',
  chest: 'Casaco/peitoral de vestimenta',
  gloves: 'Luvas de combate/manuseio',
  legs: 'Calças/perneiras',
  boots: 'Botas',
  shield: 'Braçadeira/defesa de antebraço',
  consumable: 'Consumível',
  relic: 'Relíquia temática',
}

function csvEscape(v) {
  const s = String(v ?? '')
  if (s.includes('"') || s.includes(',') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

function normalize(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function imageSubjectFromPath(imagePath, type) {
  const base = path.basename(imagePath).replace(/\.(png|jpe?g|webp)$/i, '')
  const cleaned = normalize(base).replace(/_realistic$/, '').replace(/_/g, ' ')
  const slotHint = SLOT_DESC[type] || 'Item'
  return `${slotHint} (${cleaned})`
}

function parseSetKeysByRarity(source) {
  const out = new Map()
  const setBlockMatch = source.match(/const SETS_BY_RARITY:[\s\S]*?=\s*\{([\s\S]*?)\n\}/m)
  if (!setBlockMatch) return out
  const block = setBlockMatch[1]

  for (const rarity of ['common', 'uncommon', 'rare', 'epic', 'legendary']) {
    const rx = new RegExp(`${rarity}:\\s*\\[([\\s\\S]*?)\\]\\s*,`, 'm')
    const m = block.match(rx)
    if (!m) continue
    const keys = [...m[1].matchAll(/key:\s*'([^']+)'/g)].map((x) => x[1])
    out.set(rarity, keys)
  }
  return out
}

function parseExplicitItems(source) {
  const baseStart = source.indexOf('const BASE_ITEMS: Item[] = [')
  const aliasStart = source.indexOf('const LEGACY_ITEM_ID_ALIASES')
  if (baseStart === -1 || aliasStart === -1) return []
  const baseBlock = source.slice(baseStart, aliasStart)

  const entries = []
  const rx = /id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?type:\s*'([^']+)'[\s\S]*?description:\s*'([^']+)'[\s\S]*?image_url:\s*'([^']+)'/g
  let m
  while ((m = rx.exec(baseBlock)) !== null) {
    entries.push({
      id: m[1],
      name: m[2],
      type: m[3],
      description: m[4],
      image_url: m[5],
    })
  }
  return entries
}

function parseAliasMap(source) {
  const aliasMatch = source.match(/const LEGACY_ITEM_ID_ALIASES:[\s\S]*?=\s*\{([\s\S]*?)\n\}/m)
  if (!aliasMatch) return new Map()
  const body = aliasMatch[1]
  const map = new Map()
  for (const m of body.matchAll(/([a-zA-Z0-9_]+):\s*'([^']+)'/g)) map.set(m[1], m[2])
  return map
}

async function fileExists(p) {
  try {
    await fs.stat(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  const source = await fs.readFile(ITEMS_TS, 'utf8')
  const setKeysByRarity = parseSetKeysByRarity(source)
  const explicitItems = parseExplicitItems(source)
  const aliasMap = parseAliasMap(source)

  const rows = []

  // Generated set items (always in runtime ITEMS)
  const slotTypes = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'shield']
  for (const [rarity, keys] of setKeysByRarity.entries()) {
    for (const key of keys) {
      for (const type of slotTypes) {
        const id = `${key}_${rarity}_${type}`
        const imageUrl = `/images/items/${id}_realistic.png`
        rows.push({
          item_id: id,
          item_nome: id.replace(/_/g, ' '),
          item_tipo: type,
          item_descricao: `Item de conjunto (${rarity})`,
          imagem_atual: imageUrl,
        })
      }
    }
  }

  // Explicit items (also in runtime ITEMS) with alias remap applied
  for (const it of explicitItems) {
    const aliasId = aliasMap.get(it.id)
    const runtimeImage = aliasId ? `/images/items/${aliasId}_realistic.png` : it.image_url
    rows.push({
      item_id: it.id,
      item_nome: it.name,
      item_tipo: it.type,
      item_descricao: it.description,
      imagem_atual: runtimeImage,
    })
  }

  // Deduplicate by item_id (prefer last occurrence)
  const byId = new Map()
  for (const r of rows) byId.set(r.item_id, r)
  const finalRows = [...byId.values()].sort((a, b) => a.item_id.localeCompare(b.item_id))

  const enriched = []
  for (const r of finalRows) {
    const pngAbs = path.join(ROOT, 'public', r.imagem_atual.replace(/^\//, ''))
    const webpAbs = pngAbs.replace(/\.(png|jpe?g)$/i, '.webp')
    const hasPng = await fileExists(pngAbs)
    const hasWebp = await fileExists(webpAbs)

    let melhoria = 'nao'
    let motivo = 'Imagem alinhada ao item (conjunto/tipo consistente).'

    // Heurística: itens legados mapeados por alias podem ter arte genérica de set.
    if (!r.item_id.includes('_common_') &&
        !r.item_id.includes('_uncommon_') &&
        !r.item_id.includes('_rare_') &&
        !r.item_id.includes('_epic_') &&
        !r.item_id.includes('_legendary_') &&
        /_realistic\.png$/i.test(r.imagem_atual) &&
        r.imagem_atual.includes('/images/items/') &&
        !r.imagem_atual.includes(`${r.item_id}_realistic.png`)) {
      melhoria = 'sim'
      motivo = 'Item legado reaproveitando arte de set; pode ter imagem mais específica.'
    }

    if (!hasPng && !hasWebp) {
      melhoria = 'sim'
      motivo = 'Arquivo da imagem não encontrado no projeto.'
    }

    enriched.push({
      ...r,
      do_que_se_trata: imageSubjectFromPath(r.imagem_atual, r.item_tipo),
      arquivo_png_existe: hasPng ? 'sim' : 'nao',
      arquivo_webp_existe: hasWebp ? 'sim' : 'nao',
      pode_melhorar: melhoria,
      motivo_melhoria: motivo,
    })
  }

  await fs.mkdir(OUT_DIR, { recursive: true })

  const header = [
    'item_id',
    'item_nome',
    'item_tipo',
    'item_descricao',
    'do_que_se_trata',
    'imagem_atual',
    'arquivo_png_existe',
    'arquivo_webp_existe',
    'pode_melhorar',
    'motivo_melhoria',
  ]

  const csv = [
    header.join(','),
    ...enriched.map((r) => header.map((h) => csvEscape(r[h])).join(',')),
  ].join('\n')
  await fs.writeFile(OUT_CSV, csv, 'utf8')

  const total = enriched.length
  const improve = enriched.filter((r) => r.pode_melhorar === 'sim').length
  const ok = total - improve

  const mdLines = [
    '# Pré-lista de Imagens de Itens',
    '',
    `- Total de itens catalogados: **${total}**`,
    `- Itens com imagem aceitável no estado atual: **${ok}**`,
    `- Itens marcados para possível melhoria: **${improve}**`,
    '',
    '## Arquivos gerados',
    `- CSV completo: \`${path.relative(ROOT, OUT_CSV).replace(/\\/g, '/')}\``,
    '',
    '## Amostra (primeiros 30)',
    '',
    '| item_id | tipo | do_que_se_trata | imagem_atual | pode_melhorar | motivo |',
    '|---|---|---|---|---|---|',
    ...enriched.slice(0, 30).map((r) =>
      `| ${r.item_id} | ${r.item_tipo} | ${r.do_que_se_trata} | ${r.imagem_atual} | ${r.pode_melhorar} | ${r.motivo_melhoria} |`
    ),
    '',
  ]
  await fs.writeFile(OUT_MD, mdLines.join('\n'), 'utf8')

  console.log(JSON.stringify({ total, ok, improve, outCsv: OUT_CSV, outMd: OUT_MD }, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
