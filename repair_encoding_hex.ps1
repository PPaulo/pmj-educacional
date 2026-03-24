$filePath = "C:\Users\ppaul\Downloads\pmj---educacional (1)\src\pages\ConfiguracoesPage.tsx"
$content = Get-Content -Raw -Encoding utf8 $filePath

# Hex maps
$a_tilde = [char]195

$content = $content.Replace(($a_tilde + [char]161), "á")
$content = $content.Replace(($a_tilde + [char]169), "é")
$content = $content.Replace(($a_tilde + [char]179), "ó")
$content = $content.Replace(($a_tilde + [char]186), "ú")
$content = $content.Replace(($a_tilde + [char]173), "í")
$content = $content.Replace(($a_tilde + [char]167), "ç")
$content = $content.Replace(($a_tilde + [char]163), "ã")
$content = $content.Replace(($a_tilde + [char]181), "õ")
$content = $content.Replace(($a_tilde + [char]170), "ê")
$content = $content.Replace(($a_tilde + [char]180), "ô")
$content = $content.Replace(($a_tilde + [char]137), "É")
$content = $content.Replace(($a_tilde + [char]147), "Ó")
$content = $content.Replace(($a_tilde + [char]154), "Ú")
$content = $content.Replace(($a_tilde + [char]135), "Ç")
$content = $content.Replace(($a_tilde + [char]162), "â")
$content = $content.Replace(($a_tilde + [char]164), "ä")

# Save back
$content | Set-Content -Path $filePath -Encoding utf8 -NoNewline
Write-Host "Hex fix successful!"
