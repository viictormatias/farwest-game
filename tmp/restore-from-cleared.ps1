$ErrorActionPreference = 'Stop'
$root = 'c:\Users\Victor\Documents\GitHub\far-west'
$publicItems = Join-Path $root 'public\images\items'
$clearedItems = Join-Path $root 'IMAGENS-NAO-USADAS\cleared_from_public\items'

# compute expected filenames
$sets = @{ 
  common = @('pistoleiro_estrada','forasteiro_po','garimpeiro_cobre');
  uncommon = @('rastreador_canyon','mercenario_fronteira','pregador_cinzento');
  rare = @('cacador_recompensas','bandoleiro_sombrio','guarda_velha');
  epic = @('duelista_carmesim','guardiao_aco','xama_tormenta');
  legendary = @('xerife_lendario','fantasma_deserto','lobo_tempestade');
}
$types = @('weapon','helmet','chest','gloves','legs','boots','shield')
$expected = @()
foreach ($rarity in $sets.Keys) {
  foreach ($key in $sets[$rarity]) {
    foreach ($type in $types) {
      $expected += "$key`_${rarity}_$type`_realistic.webp"
    }
  }
}
$existing = Get-ChildItem -Path $publicItems -Filter *.webp | Select-Object -ExpandProperty Name
$missing = $expected | Where-Object { $existing -notcontains $_ }

$copied = @()
foreach ($name in $missing) {
  $src = Join-Path $clearedItems $name
  $dest = Join-Path $publicItems $name
  if (Test-Path $src) {
    Copy-Item -Path $src -Destination $dest
    $copied += $name
  }
}

$copied | Sort-Object | Set-Content -Path (Join-Path $root 'tmp\copied-from-cleared.txt')
