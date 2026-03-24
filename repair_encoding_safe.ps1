$filePath = "C:\Users\ppaul\Downloads\pmj---educacional (1)\src\pages\ConfiguracoesPage.tsx"
$content = Get-Content -Raw -Encoding utf8 $filePath

$content = $content.Replace("Ã¡", "á")
$content = $content.Replace("Ã©", "é")
$content = $content.Replace("Ã³", "ó")
$content = $content.Replace("Ãº", "ú")
$content = $content.Replace("Ã­", "í")
$content = $content.Replace("Ã§", "ç")
$content = $content.Replace("Ã£", "ã")
$content = $content.Replace("Ãµ", "õ")
$content = $content.Replace("Ãª", "ê")
$content = $content.Replace("Ã´", "ô")
$content = $content.Replace("Ã‰", "É")
$content = $content.Replace("Ã“", "Ó")
$content = $content.Replace("Ãš", "Ú")
$content = $content.Replace("Ã‡", "Ç")

Set-Content -Path $filePath -Value $content -Encoding utf8 -NoNewline
Write-Host "Success repairing characters without spaces framed setups."
