$root = 'c:\Users\Victor\Documents\GitHub\far-west'
$public = Get-ChildItem -Path (Join-Path $root 'public\images\items') -Filter *.webp | Select-Object -ExpandProperty Name
$unused = Get-ChildItem -Recurse -File (Join-Path $root 'IMAGENS-NAO-USADAS') -Filter *.webp | Where-Object { $public -notcontains $_.Name }
$unused | Select-Object -ExpandProperty FullName | Set-Content (Join-Path $root 'tmp\unused-not-in-public.txt')
