import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const BASE = path.join(ROOT, 'IMAGENS-NAO-USADAS', 'images', 'leonardo-history')
const ITEMS_DST = path.join(ROOT, 'public', 'images', 'items')

// Mapping: [source_folder, uuid_filename, new_descriptive_name]
const RENAMES = [
  // HATS
  ['hats', '0624eac8-dc8a-4e5a-bc5c-44fbedca6560.webp', 'golden_ornamental_mask.webp'],
  ['hats', '1f11c0a9-62e6-6670-bf05-8557b87606d4.webp', 'classic_cowboy_hat.webp'],
  ['hats', '30cb503f-96a5-4c14-a608-8887a3771024.webp', 'dark_stud_hat.webp'],
  ['hats', '5205c507-8771-4e94-b01a-066bbb862f7f.webp', 'brown_cowboy_hat.webp'],
  ['hats', 'a0a949ca-32c4-44eb-9dd4-771e56ef727c.webp', 'dark_bandit_mask.webp'],
  ['hats', 'e6e809bb-8f8e-4a84-8ec5-bef81c921e57.webp', 'sheriff_star_hat.webp'],

  // BOOTS
  ['boots', '1f11c0b6-811c-68d0-ae24-fc3951e70e30.webp', 'dark_buckle_boots.webp'],
  ['boots', '1f11c0ba-9af9-6330-890d-dad1c27cf6a6.webp', 'worn_brown_boots.webp'],
  ['boots', '31e7abe2-9b58-42c3-b772-a1bdb46df7a7.webp', 'work_leather_boots.webp'],
  ['boots', '3495054b-8ebc-4c35-b604-56bc35e46905.webp', 'black_tall_boots.webp'],
  ['boots', '52ec94bf-0dd4-4e9e-9998-dc81a12910ec.webp', 'cowboy_brown_boots.webp'],
  ['boots', '7676dcb0-4d35-4e9d-952c-c25bc77ff6e4.webp', 'embroidered_blue_boots.webp'],
  ['boots', '7a640829-4f2f-4973-b8b7-b190dc735410.webp', 'terrain_worn_boots.webp'],
  ['boots', '85fc1d25-c2ab-4b07-91fd-698ef5a0ab68.webp', 'single_cowboy_boot.webp'],
  ['boots', '9de590af-52b8-4b40-beb8-b455b4f0ea5f.webp', 'desert_cowboy_boots.webp'],
  ['boots', '9e13070c-6139-4ef4-893a-06d5aa276cf6.webp', 'star_embroidered_boots.webp'],
  ['boots', 'b8992fa4-d97c-4a98-8c1a-af48aef3c63b.webp', 'tall_light_brown_boots.webp'],
  ['boots', 'cac0d312-6671-4f3c-949c-bfecc30bd49b.webp', 'dark_faucet_boot.webp'],
  ['boots', 'da628607-faf9-4ccc-af87-85d0b907e7f1.webp', 'closeup_brown_boots.webp'],
  ['boots', 'dd588f77-6bc1-4177-848e-e931250161ac.webp', 'wood_floor_boots.webp'],
  ['boots', 'fa9112a4-b0eb-4f3b-ac0a-7392c1270d27.webp', 'desert_walking_boots.webp'],

  // CHEST
  ['chest', '1f11c0af-ebf3-62f0-902c-a54c5bfcdac2.webp', 'long_dark_duster_coat.webp'],
  ['chest', '275e3fe8-0232-47a2-b375-485bd7acb534.webp', 'brown_leather_vest.webp'],
  ['chest', '793d0a34-97d6-4cab-a4e8-33baf47a0a04.webp', 'dark_leather_vest.webp'],

  // GLOVES
  ['gloves', '1f11c0bc-cf6a-6450-b74c-405854e0fca8.webp', 'metal_leather_bracer.webp'],
  ['gloves', '5149021f-a500-4dda-84f4-9e1e6ae3346f.webp', 'leather_brown_gloves.webp'],
  ['gloves', 'b035c230-fe5c-43e6-9368-7c595f13bf03.webp', 'black_leather_gloves.webp'],
  ['gloves', 'ce70c8cf-0ffb-40e8-9840-4ae737634c55.webp', 'leather_arm_bracer.webp'],

  // PANTS
  ['pants', '1c6097f8-a4a9-4cc9-85d0-c72dcbef6078.webp', 'ammo_belt_pants.webp'],
  ['pants', 'c9501f3d-96a9-42e4-90d4-5f139fdb7e51.webp', 'simple_leather_pants.webp'],

  // OTHER → Relics
  ['other', '075d9019-aa28-4b35-afa2-f1dcc8c41f71.webp', 'wooden_star_chest_relic.webp'],
  ['other', '0ad3897d-5fce-4815-8cbf-b1feaa852cff.webp', 'wooden_crate_relic.webp'],
  ['other', '1d744a27-e4ec-4d60-91f9-e4edfb54e8de.webp', 'decorative_metal_box_relic.webp'],
  ['other', '274a728c-3f39-44eb-9a85-bdac4832b971.webp', 'circular_medallion_relic.webp'],
  ['other', '5673ccaa-e55a-41cf-8cf0-e0276640d60e.webp', 'ruby_gem_box_relic.webp'],
  ['other', '57f8b24d-a379-4472-950d-be6fa50d30f3.webp', 'metal_compass_relic.webp'],
]

let renamed = 0
for (const [folder, uuid, newName] of RENAMES) {
  const src = path.join(BASE, folder, uuid)
  const dst = path.join(BASE, folder, newName)
  try {
    await fs.copyFile(src, dst)
    // Also copy to items folder
    await fs.copyFile(src, path.join(ITEMS_DST, newName))
    renamed++
    console.log(`✓ ${folder}/${uuid} → ${newName}`)
  } catch (e) {
    console.warn(`✗ ${folder}/${uuid}: ${e.message}`)
  }
}

// Also copy Imagens pra usar items
const PRA_USAR = path.join(ROOT, 'IMAGENS-NAO-USADAS', 'images', 'Imagens pra usar')
const praUsarMap = [
  ['bandit_mask.webp', 'bandit_mask.webp'],
  ['sheriff_coat.webp', 'sheriff_coat.webp'],
  ['leather_bag.webp', 'leather_bag_relic.webp'],
]
for (const [src, dst] of praUsarMap) {
  try {
    await fs.copyFile(path.join(PRA_USAR, src), path.join(ITEMS_DST, dst))
    console.log(`✓ pra-usar/${src} → items/${dst}`)
    renamed++
  } catch (e) {
    console.warn(`✗ ${src}: ${e.message}`)
  }
}

console.log(`\nTotal: ${renamed} files renamed and copied to public/images/items/`)
