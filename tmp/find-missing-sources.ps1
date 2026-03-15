$root = 'c:\Users\Victor\Documents\GitHub\far-west'
$missing = Get-Content (Join-Path $root 'tmp\missing-items.txt')
$all = Get-ChildItem -Recurse -File (Join-Path $root 'IMAGENS-NAO-USADAS') | Group-Object Name -AsHashTable -AsString
$found = @()
foreach ($name in $missing) {
  if ($all.ContainsKey($name)) {
    $paths = $all[$name] | Select-Object -ExpandProperty FullName
    $found += ($name + ' -> ' + ($paths -join '; '))
  }
}
$outPath = Join-Path $root 'tmp\missing-found-sources.txt'
if ($found.Count -eq 0) { '' | Set-Content $outPath } else { $found | Set-Content $outPath }
