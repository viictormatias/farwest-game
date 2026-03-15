import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const SRC_BASE = path.join(ROOT, 'IMAGENS-NAO-USADAS', 'images', 'leonardo-history')
const SRC_PRAR = path.join(ROOT, 'IMAGENS-NAO-USADAS', 'images', 'Imagens pra usar')
const SRC_ITEMS = path.join(ROOT, 'public', 'images', 'items')
const DST = path.join(ROOT, 'public', 'temp-gallery')

await fs.mkdir(DST, { recursive: true })

async function collectWebp(dir, label) {
  const imgs = []
  try {
    const files = await fs.readdir(dir)
    for (const f of files.filter(f => f.endsWith('.webp'))) {
      const src = path.join(dir, f)
      const dst = path.join(DST, `${label}__${f}`)
      await fs.copyFile(src, dst)
      imgs.push({ label, file: f })
    }
  } catch {}
  return imgs
}

// Collect from each subfolder
const folders = ['hats', 'boots', 'chest', 'gloves', 'pants', 'other']
const all = []
for (const folder of folders) {
  const imgs = await collectWebp(path.join(SRC_BASE, folder), folder)
  all.push(...imgs)
}

// "Imagens pra usar"
const prar = await collectWebp(SRC_PRAR, 'pra-usar')
all.push(...prar)

// Already-used item images (non-generated, non-weapons)
const existing = await fs.readdir(SRC_ITEMS).catch(() => [])
const staticItems = existing.filter(f => f.endsWith('.webp') && !f.includes('_rare_') && !f.includes('_common_') && !f.includes('_uncommon_') && !f.includes('_epic_') && !f.includes('_legendary_') && !f.match(/weapon|revolver|rifle|shotgun|dagger/i))
for (const f of staticItems) {
  const src = path.join(SRC_ITEMS, f)
  const dst = path.join(DST, `items-existing__${f}`)
  await fs.copyFile(src, dst).catch(() => {})
  all.push({ label: 'items-existing', file: f })
}

// Build HTML gallery
const rows = all.map(({ label, file }) => {
  const url = `/temp-gallery/${encodeURIComponent(label + '__' + file)}`
  return `<div style="margin:8px;text-align:center;background:#1a1008;padding:8px;border:1px solid #5a3a1a;border-radius:4px;width:160px">
    <img src="${url}" style="width:140px;height:140px;object-fit:contain;background:#0d0807" loading="lazy"/>
    <div style="color:#ccc;font-size:10px;margin-top:4px;word-break:break-all">[${label}]</div>
    <div style="color:#f2b90d;font-size:9px;word-break:break-all">${file.replace(/\.webp$/,'').substring(0,20)}</div>
  </div>`
}).join('\n')

const html = `<!DOCTYPE html>
<html>
<head><title>Image Gallery</title>
<style>body{background:#0d0807;margin:0;padding:16px;font-family:sans-serif}
h2{color:#f2b90d}
.group{margin-bottom:32px}
h3{color:#f2b90d;border-bottom:1px solid #5a3a1a;padding-bottom:4px}</style>
</head>
<body>
<h2>Item Image Gallery (${all.length} images)</h2>
<div style="display:flex;flex-wrap:wrap">
${rows}
</div>
</body></html>`

await fs.writeFile(path.join(DST, 'index.html'), html, 'utf8')
console.log(`Gallery built: ${all.length} images → public/temp-gallery/`)
