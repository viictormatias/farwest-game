$ErrorActionPreference = 'Stop'
$root = 'c:\Users\Victor\Documents\GitHub\far-west'
$publicItems = Join-Path $root 'public\images\items'
$leonardo = Join-Path $root 'IMAGENS-NAO-USADAS\images\leonardo-history'
$tempGallery = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery'

$copies = @(
  @{ src = Join-Path $tempGallery 'items-existing__cloth_boots_realistic.webp'; dest = Join-Path $publicItems 'cloth_boots_realistic.webp' },
  @{ src = Join-Path $tempGallery 'items-existing__mercenary_boots_realistic.webp'; dest = Join-Path $publicItems 'mercenary_boots_realistic.webp' },
  @{ src = Join-Path $tempGallery 'items-existing__iron_boots_realistic.webp'; dest = Join-Path $publicItems 'iron_boots_realistic.webp' },
  @{ src = Join-Path $tempGallery 'items-existing__ranger_boots_realistic.webp'; dest = Join-Path $publicItems 'ranger_boots_realistic.webp' },
  @{ src = Join-Path $tempGallery 'items-existing__raven_boots_realistic.webp'; dest = Join-Path $publicItems 'raven_boots_realistic.webp' },
  @{ src = Join-Path $tempGallery 'items-existing__lined_pants_realistic.webp'; dest = Join-Path $publicItems 'lined_pants_realistic.webp' },
  @{ src = Join-Path $tempGallery 'items-existing__duelist_gloves_realistic.webp'; dest = Join-Path $publicItems 'duelist_gloves_realistic.webp' },

  @{ src = Join-Path $leonardo 'gloves\leather_brown_gloves.webp'; dest = Join-Path $publicItems 'leather_brown_gloves.webp' },
  @{ src = Join-Path $leonardo 'gloves\leather_arm_bracer.webp'; dest = Join-Path $publicItems 'leather_arm_bracer.webp' },
  @{ src = Join-Path $leonardo 'gloves\black_leather_gloves.webp'; dest = Join-Path $publicItems 'black_leather_gloves.webp' },
  @{ src = Join-Path $leonardo 'gloves\metal_leather_bracer.webp'; dest = Join-Path $publicItems 'metal_leather_bracer.webp' },

  @{ src = Join-Path $leonardo 'pants\simple_leather_pants.webp'; dest = Join-Path $publicItems 'simple_leather_pants.webp' },
  @{ src = Join-Path $leonardo 'pants\ammo_belt_pants.webp'; dest = Join-Path $publicItems 'ammo_belt_pants.webp' },

  @{ src = Join-Path $leonardo 'other\decorative_metal_box_relic.webp'; dest = Join-Path $publicItems 'decorative_metal_box_relic.webp' },
  @{ src = Join-Path $leonardo 'other\circular_medallion_relic.webp'; dest = Join-Path $publicItems 'circular_medallion_relic.webp' },
  @{ src = Join-Path $leonardo 'other\metal_compass_relic.webp'; dest = Join-Path $publicItems 'metal_compass_relic.webp' },
  @{ src = Join-Path $leonardo 'other\wooden_star_chest_relic.webp'; dest = Join-Path $publicItems 'wooden_star_chest_relic.webp' },

  @{ src = Join-Path $leonardo 'boots\bota-duelista.webp'; dest = Join-Path $publicItems 'duelista_carmesim_epic_boots_realistic.webp' },
  @{ src = Join-Path $leonardo 'boots\bota-xerife.webp'; dest = Join-Path $publicItems 'xerife_lendario_legendary_boots_realistic.webp' },
  @{ src = Join-Path $leonardo 'boots\bota-tank.webp'; dest = Join-Path $publicItems 'guardiao_aco_epic_boots_realistic.webp' },
  @{ src = Join-Path $leonardo 'boots\bota-lendaria.webp'; dest = Join-Path $publicItems 'lobo_tempestade_legendary_boots_realistic.webp' },
  @{ src = Join-Path $leonardo 'boots\desert_walking_boots.webp'; dest = Join-Path $publicItems 'fantasma_deserto_legendary_boots_realistic.webp' },
  @{ src = Join-Path $leonardo 'boots\terrain_worn_boots.webp'; dest = Join-Path $publicItems 'rastreador_canyon_uncommon_boots_realistic.webp' },

  @{ src = Join-Path $leonardo 'hats\sheriff_star_hat.webp'; dest = Join-Path $publicItems 'xerife_lendario_legendary_helmet_realistic.webp' },
  @{ src = Join-Path $leonardo 'hats\dark_bandit_mask.webp'; dest = Join-Path $publicItems 'bandoleiro_sombrio_rare_helmet_realistic.webp' },
  @{ src = Join-Path $leonardo 'hats\dark_stud_hat.webp'; dest = Join-Path $publicItems 'guardiao_aco_epic_helmet_realistic.webp' },
  @{ src = Join-Path $leonardo 'hats\golden_ornamental_mask.webp'; dest = Join-Path $publicItems 'fantasma_deserto_legendary_helmet_realistic.webp' },

  @{ src = Join-Path $leonardo 'chest\long_dark_duster_coat.webp'; dest = Join-Path $publicItems 'guarda_velha_rare_chest_realistic.webp' },
  @{ src = Join-Path $leonardo 'chest\dark_leather_vest.webp'; dest = Join-Path $publicItems 'bandoleiro_sombrio_rare_chest_realistic.webp' },
  @{ src = Join-Path $leonardo 'chest\brown_leather_vest.webp'; dest = Join-Path $publicItems 'rastreador_canyon_uncommon_chest_realistic.webp' }
)

foreach ($c in $copies) {
  if (!(Test-Path $c.src)) { Write-Host "Missing source: $($c.src)"; continue }
  if (Test-Path $c.dest) { continue }
  Copy-Item -Path $c.src -Destination $c.dest
}

# Organize leonardo-history items into subfolders
$bootDir = Join-Path $leonardo 'boots'
$chestDir = Join-Path $leonardo 'chest'
$glovesDir = Join-Path $leonardo 'gloves'
$hatsDir = Join-Path $leonardo 'hats'
$otherDir = Join-Path $leonardo 'other'
$pantsDir = Join-Path $leonardo 'pants'

$mk = @(
  (Join-Path $bootDir 'simples'),
  (Join-Path $bootDir 'tank'),
  (Join-Path $bootDir 'duelista'),
  (Join-Path $bootDir 'xerife'),
  (Join-Path $bootDir 'lendaria'),
  (Join-Path $bootDir 'outros'),
  (Join-Path $chestDir 'comum'),
  (Join-Path $chestDir 'rare'),
  (Join-Path $chestDir 'epic'),
  (Join-Path $glovesDir 'comum'),
  (Join-Path $glovesDir 'uncommon'),
  (Join-Path $glovesDir 'rare'),
  (Join-Path $glovesDir 'epic'),
  (Join-Path $hatsDir 'comum'),
  (Join-Path $hatsDir 'bandido'),
  (Join-Path $hatsDir 'armored'),
  (Join-Path $hatsDir 'lendario'),
  (Join-Path $hatsDir 'xerife'),
  (Join-Path $otherDir 'relics'),
  (Join-Path $pantsDir 'comum'),
  (Join-Path $pantsDir 'rare'),
  (Join-Path $leonardo 'misc\unknown')
)
$mk | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ | Out-Null }

$bootMoves = @{
  'bota-simples.webp' = 'simples'
  'bota-simples2.webp' = 'simples'
  'bota-simples3.webp' = 'simples'
  'work_leather_boots.webp' = 'simples'
  'terrain_worn_boots.webp' = 'simples'
  'desert_walking_boots.webp' = 'simples'
  'tall_light_brown_boots.webp' = 'simples'
  'wood_floor_boots.webp' = 'simples'
  'closeup_brown_boots.webp' = 'simples'
  'single_cowboy_boot.webp' = 'simples'
  'bota-ferro.webp' = 'tank'
  'bota-tank.webp' = 'tank'
  'bota-duelista.webp' = 'duelista'
  'bota-duelista2.webp' = 'duelista'
  'bota-xerife.webp' = 'xerife'
  'bota-lendaria.webp' = 'lendaria'
  'bota-lendaria2.webp' = 'lendaria'
  'bota-lendaria3.webp' = 'lendaria'
  'embroidered_blue_boots.webp' = 'lendaria'
  'star_embroidered_boots.webp' = 'lendaria'
  'dark_faucet_boot.webp' = 'outros'
  'bota.webp' = 'outros'
  'bota2.webp' = 'outros'
}
foreach ($kv in $bootMoves.GetEnumerator()) {
  $src = Join-Path $bootDir $kv.Key
  if (Test-Path $src) {
    Move-Item -Path $src -Destination (Join-Path $bootDir $kv.Value)
  }
}

$chestMoves = @{
  'brown_leather_vest.webp' = 'comum'
  'dark_leather_vest.webp' = 'rare'
  'long_dark_duster_coat.webp' = 'epic'
}
foreach ($kv in $chestMoves.GetEnumerator()) {
  $src = Join-Path $chestDir $kv.Key
  if (Test-Path $src) {
    Move-Item -Path $src -Destination (Join-Path $chestDir $kv.Value)
  }
}

$gloveMoves = @{
  'leather_brown_gloves.webp' = 'comum'
  'leather_arm_bracer.webp' = 'uncommon'
  'black_leather_gloves.webp' = 'rare'
  'metal_leather_bracer.webp' = 'epic'
}
foreach ($kv in $gloveMoves.GetEnumerator()) {
  $src = Join-Path $glovesDir $kv.Key
  if (Test-Path $src) {
    Move-Item -Path $src -Destination (Join-Path $glovesDir $kv.Value)
  }
}

$hatMoves = @{
  'brown_cowboy_hat.webp' = 'comum'
  'classic_cowboy_hat.webp' = 'comum'
  'dark_bandit_mask.webp' = 'bandido'
  'dark_stud_hat.webp' = 'armored'
  'golden_ornamental_mask.webp' = 'lendario'
  'sheriff_star_hat.webp' = 'xerife'
}
foreach ($kv in $hatMoves.GetEnumerator()) {
  $src = Join-Path $hatsDir $kv.Key
  if (Test-Path $src) {
    Move-Item -Path $src -Destination (Join-Path $hatsDir $kv.Value)
  }
}

$otherMoves = @(
  'circular_medallion_relic.webp',
  'decorative_metal_box_relic.webp',
  'metal_compass_relic.webp',
  'ruby_gem_box_relic.webp',
  'wooden_crate_relic.webp',
  'wooden_star_chest_relic.webp'
)
foreach ($name in $otherMoves) {
  $src = Join-Path $otherDir $name
  if (Test-Path $src) {
    Move-Item -Path $src -Destination (Join-Path $otherDir 'relics')
  }
}

$pantsMoves = @{
  'simple_leather_pants.webp' = 'comum'
  'ammo_belt_pants.webp' = 'rare'
}
foreach ($kv in $pantsMoves.GetEnumerator()) {
  $src = Join-Path $pantsDir $kv.Key
  if (Test-Path $src) {
    Move-Item -Path $src -Destination (Join-Path $pantsDir $kv.Value)
  }
}

# Move unknown root files into misc
$unknown = @(
  '1f11c0a3-c7fd-6fa0-a25e-47fa6415636c.jpg',
  '1f11c0a3-c7fd-6fa0-a25e-47fa6415636c.webp',
  '7e065efe-881b-4c3b-8caf-7f5c592d1344.jpg',
  '7e065efe-881b-4c3b-8caf-7f5c592d1344.webp'
)
foreach ($name in $unknown) {
  $src = Join-Path $leonardo $name
  if (Test-Path $src) {
    Move-Item -Path $src -Destination (Join-Path $leonardo 'misc\unknown')
  }
}
