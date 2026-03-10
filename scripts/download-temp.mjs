import fs from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR = path.join(process.cwd(), 'public', 'images', 'items')

const IMAGES = [
  { id: 'lobo_tempestade_legendary_weapon', url: 'https://cdn.leonardo.ai/users/a9b31f89-94d4-4ddd-ab5c-141c22ec1881/generations/1f11c0a3-c7fd-6fa0-a25e-47fa6415636c/lucid-origin_Lobo_da_Tempestade_-_Escopeta_Super_realistic_Wild_West_escopeta_shotgun_metal_c-0.jpg' },
  { id: 'lobo_tempestade_legendary_helmet', url: 'https://cdn.leonardo.ai/users/a9b31f89-94d4-4ddd-ab5c-141c22ec1881/generations/1f11c0a9-62e6-6670-bf05-8557b87606d4/lucid-origin_Lobo_da_Tempestade_-_Chapeu_Super_realistic_Wild_West_heavy_hat_salt-crusted_lea-0.jpg' },
  { id: 'lobo_tempestade_legendary_chest', url: 'https://cdn.leonardo.ai/users/a9b31f89-94d4-4ddd-ab5c-141c22ec1881/generations/1f11c0af-ebf3-62f0-902c-a54c5bfcdac2/lucid-origin_Lobo_da_Tempestade_-_Casaco_Super_realistic_Wild_West_heavy_trenchcoat_reinforce-0.jpg' },
  { id: 'lobo_tempestade_legendary_gloves', url: 'https://cdn.leonardo.ai/users/a9b31f89-94d4-4ddd-ab5c-141c22ec1881/generations/1f11c0b3-9a8a-6e50-b303-9571356dc4ce/lucid-origin_Lobo_da_Tempestade_-_Luvas_Super_realistic_Wild_West_heavy_leather_gloves_metal_-0.jpg' },
  { id: 'lobo_tempestade_legendary_legs', url: 'https://cdn.leonardo.ai/users/a9b31f89-94d4-4ddd-ab5c-141c22ec1881/generations/1f11c0b6-811c-68d0-ae24-fc3951e70e30/lucid-origin_Lobo_da_Tempestade_-_Perneiras_Super_realistic_Wild_West_heavy_leather_greaves_b-0.jpg' },
  { id: 'lobo_tempestade_legendary_boots', url: 'https://cdn.leonardo.ai/users/a9b31f89-94d4-4ddd-ab5c-141c22ec1881/generations/1f11c0b9-509e-64c0-9d0a-0ac98305c479/lucid-origin_Lobo_da_Tempestade_-_Botas_Super_realistic_Wild_West_heavy_iron-clad_boots_salt-0.jpg' },
  { id: 'lobo_tempestade_legendary_shield', url: 'https://cdn.leonardo.ai/users/a9b31f89-94d4-4ddd-ab5c-141c22ec1881/generations/1f11c0bc-cf6a-6450-b74c-405854e0fca8/lucid-origin_Lobo_da_Tempestade_-_Bracadeira_Super_realistic_Wild_West_forearm_guard_made_fro-0.jpg' }
]

async function download() {
  for (const img of IMAGES) {
    const res = await fetch(img.url)
    const arrayBuffer = await res.arrayBuffer()
    const outPath = path.join(OUT_DIR, `${img.id}_realistic.png`) // Keep .png even if source is .jpg for consistency
    await fs.writeFile(outPath, Buffer.from(arrayBuffer))
    console.log(`Downloaded: ${outPath}`)
  }
}

download().catch(console.error)
