# Fix emoji encoding issues in index.html
$filePath = "frontend/index.html"

# Read the file as raw bytes and convert to UTF-8 string
$content = Get-Content $filePath -Raw -Encoding UTF8

# Replace corrupted emojis with proper ones
$replacements = @{
    'ðŸ""' = '🔔'
    'ðŸ'°' = '💰'
    'ðŸŒ¿' = '🌿'
    'ðŸ¤' = '🤝'
    'ðŸŒ' = '🌍'
    'ðŸš€' = '🚀'
    'â†'' = '→'
    'ðŸ›°ï¸' = '🛰️'
    'ðŸ"' = '📍'
}

foreach ($key in $replacements.Keys) {
    $content = $content -replace [regex]::Escape($key), $replacements[$key]
}

# Save the file with UTF-8 encoding (with BOM to ensure proper encoding)
$utf8WithBom = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText($filePath, $content, $utf8WithBom)

Write-Host "✅ Fixed emoji encoding in $filePath" -ForegroundColor Green
