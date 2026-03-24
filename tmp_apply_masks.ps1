$filePath = "c:\Users\ppaul\Downloads\pmj---educacional (1)\src\pages\PreRegistrationForm.tsx"
$content = [System.IO.File]::ReadAllText($filePath)

# Replace docCpf
$content = $content -replace "value=\{docCpf\}\s+onChange=\{e => setDocCpf\(e.target.value\)\}", 'value={docCpf} onChange={e => setDocCpf(maskCPF(e.target.value))} maxLength={14}'

# Replace responsavelPhone
$content = $content -replace "value=\{responsavelPhone\}\s+onChange=\{e => setResponsavelPhone\(e.target.value\)\}", 'value={responsavelPhone} onChange={e => setResponsavelPhone(maskPhone(e.target.value))} maxLength={15}'

[System.IO.File]::WriteAllText($filePath, $content)
Write-Output "Applied Masks Successfully"
