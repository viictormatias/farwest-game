$ErrorActionPreference = 'Stop'
$root = 'c:\Users\Victor\Documents\GitHub\far-west'
$publicItems = Join-Path $root 'public\images\items'

$map = @(
  # Weapons
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\items\short_revolver.webp'; dest = Join-Path $publicItems 'cacador_recompensas_rare_weapon_realistic.webp'; note = 'weapon/agile' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\items\precision_rifle.webp'; dest = Join-Path $publicItems 'rastreador_canyon_uncommon_weapon_realistic.webp'; note = 'weapon/lawman' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\pra-usar__precision_rifle.webp'; dest = Join-Path $publicItems 'xama_tormenta_epic_weapon_realistic.webp'; note = 'weapon/lawman' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\items\sawed_off.webp'; dest = Join-Path $publicItems 'guardiao_aco_epic_weapon_realistic.webp'; note = 'weapon/tank' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\images\Imagens pra usar\sawed_off.webp'; dest = Join-Path $publicItems 'lobo_tempestade_legendary_weapon_realistic.webp'; note = 'weapon/tank' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\images\Imagens pra usar\precision_rifle.webp'; dest = Join-Path $publicItems 'fantasma_deserto_legendary_weapon_realistic.webp'; note = 'weapon/agile (placeholder)' },

  # Chests
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\chest__1f11c0af-ebf3-62f0-902c-a54c5bfcdac2.webp'; dest = Join-Path $publicItems 'duelista_carmesim_epic_chest_realistic.webp'; note = 'chest' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\chest__275e3fe8-0232-47a2-b375-485bd7acb534.webp'; dest = Join-Path $publicItems 'guardiao_aco_epic_chest_realistic.webp'; note = 'chest' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\chest__793d0a34-97d6-4cab-a4e8-33baf47a0a04.webp'; dest = Join-Path $publicItems 'xama_tormenta_epic_chest_realistic.webp'; note = 'chest' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\images\Imagens pra usar\sheriff_coat.webp'; dest = Join-Path $publicItems 'fantasma_deserto_legendary_chest_realistic.webp'; note = 'chest (placeholder)' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\cleared_from_public\items\long_dark_duster_coat.webp'; dest = Join-Path $publicItems 'lobo_tempestade_legendary_chest_realistic.webp'; note = 'chest' },

  # Gloves
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\gloves__1f11c0bc-cf6a-6450-b74c-405854e0fca8.webp'; dest = Join-Path $publicItems 'duelista_carmesim_epic_gloves_realistic.webp'; note = 'gloves' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\gloves__5149021f-a500-4dda-84f4-9e1e6ae3346f.webp'; dest = Join-Path $publicItems 'guarda_velha_rare_gloves_realistic.webp'; note = 'gloves' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\gloves__b035c230-fe5c-43e6-9368-7c595f13bf03.webp'; dest = Join-Path $publicItems 'guardiao_aco_epic_gloves_realistic.webp'; note = 'gloves' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\gloves__ce70c8cf-0ffb-40e8-9840-4ae737634c55.webp'; dest = Join-Path $publicItems 'xama_tormenta_epic_gloves_realistic.webp'; note = 'gloves' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\other__075d9019-aa28-4b35-afa2-f1dcc8c41f71.webp'; dest = Join-Path $publicItems 'fantasma_deserto_legendary_gloves_realistic.webp'; note = 'gloves (placeholder)' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\other__0ad3897d-5fce-4815-8cbf-b1feaa852cff.webp'; dest = Join-Path $publicItems 'lobo_tempestade_legendary_gloves_realistic.webp'; note = 'gloves (placeholder)' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\other__1d744a27-e4ec-4d60-91f9-e4edfb54e8de.webp'; dest = Join-Path $publicItems 'xerife_lendario_legendary_gloves_realistic.webp'; note = 'gloves (placeholder)' },

  # Helmet
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\cleared_from_public\items\dark_stud_hat.webp'; dest = Join-Path $publicItems 'lobo_tempestade_legendary_helmet_realistic.webp'; note = 'helmet' },

  # Shields (bracadeiras)
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\other__274a728c-3f39-44eb-9a85-bdac4832b971.webp'; dest = Join-Path $publicItems 'fantasma_deserto_legendary_shield_realistic.webp'; note = 'shield (placeholder)' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\other__5673ccaa-e55a-41cf-8cf0-e0276640d60e.webp'; dest = Join-Path $publicItems 'lobo_tempestade_legendary_shield_realistic.webp'; note = 'shield (placeholder)' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\other__57f8b24d-a379-4472-950d-be6fa50d30f3.webp'; dest = Join-Path $publicItems 'xerife_lendario_legendary_shield_realistic.webp'; note = 'shield (placeholder)' },

  # Legs
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\pants__1c6097f8-a4a9-4cc9-85d0-c72dcbef6078.webp'; dest = Join-Path $publicItems 'bandoleiro_sombrio_rare_legs_realistic.webp'; note = 'legs' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\temp-gallery\pants__c9501f3d-96a9-42e4-90d4-5f139fdb7e51.webp'; dest = Join-Path $publicItems 'cacador_recompensas_rare_legs_realistic.webp'; note = 'legs' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\cleared_from_public\items\black_tall_boots.webp'; dest = Join-Path $publicItems 'duelista_carmesim_epic_legs_realistic.webp'; note = 'legs (boots placeholder)' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\cleared_from_public\items\cowboy_brown_boots.webp'; dest = Join-Path $publicItems 'fantasma_deserto_legendary_legs_realistic.webp'; note = 'legs (boots placeholder)' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\cleared_from_public\items\dark_buckle_boots.webp'; dest = Join-Path $publicItems 'guarda_velha_rare_legs_realistic.webp'; note = 'legs (boots placeholder)' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\cleared_from_public\items\desert_cowboy_boots.webp'; dest = Join-Path $publicItems 'guardiao_aco_epic_legs_realistic.webp'; note = 'legs (boots placeholder)' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\cleared_from_public\items\single_cowboy_boot.webp'; dest = Join-Path $publicItems 'lobo_tempestade_legendary_legs_realistic.webp'; note = 'legs (boots placeholder)' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\cleared_from_public\items\worn_brown_boots.webp'; dest = Join-Path $publicItems 'mercenario_fronteira_uncommon_legs_realistic.webp'; note = 'legs (boots placeholder)' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\cleared_from_public\items\dark_faucet_boot.webp'; dest = Join-Path $publicItems 'pregador_cinzento_uncommon_legs_realistic.webp'; note = 'legs (boots placeholder)' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\cleared_from_public\items\tall_light_brown_boots.webp'; dest = Join-Path $publicItems 'xama_tormenta_epic_legs_realistic.webp'; note = 'legs (boots placeholder)' },
  @{ src = Join-Path $root 'IMAGENS-NAO-USADAS\cleared_from_public\items\terrain_worn_boots.webp'; dest = Join-Path $publicItems 'xerife_lendario_legendary_legs_realistic.webp'; note = 'legs (boots placeholder)' }
)

$log = @()
foreach ($m in $map) {
  if (!(Test-Path $m.src)) { $log += "MISSING_SRC: $($m.src)"; continue }
  if (Test-Path $m.dest) { $log += "SKIP_EXISTS: $([System.IO.Path]::GetFileName($m.dest))"; continue }
  Copy-Item -Path $m.src -Destination $m.dest
  $log += "OK: $($m.src) -> $($m.dest) [${($m.note)}]"
}

$logPath = Join-Path $root 'tmp\manual-mapping-log.txt'
$log | Set-Content $logPath

# Append mapping to MAPEAMENTO.md
$mapLines = @()
$mapLines += ''
$mapLines += '## Complemento - preenchimento manual (por nome)'
foreach ($m in $map) {
  $mapLines += "$($m.src.Replace($root + '\\','')) -> public\\images\\items\\$([System.IO.Path]::GetFileName($m.dest)) [$($m.note)]"
}
Add-Content -Path (Join-Path $root 'IMAGENS-NAO-USADAS\images\leonardo-history\MAPEAMENTO.md') -Value ($mapLines -join "`n")
