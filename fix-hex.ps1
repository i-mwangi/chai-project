# Read file preserving byte encoding
$content = Get-Content 'frontend\index.html' -Raw -Encoding UTF8

# Use regex with hex patterns for corrupted UTF-8 sequences
# Bell: F0 9F 94 94
$content = $content -replace '\xF0\x9F\x94\x94', ([char]0x1F514)
# Money: F0 9F 92 B0  
$content = $content -replace '\xF0\x9F\x92\xB0', ([char]0x1F4B0)
# Herb: F0 9F 8C BF
$content = $content -replace '\xF0\x9F\x8C\xBF', ([char]0x1F33F)
# Handshake: F0 9F A4 9D
$content = $content -replace '\xF0\x9F\xA4\x9D', ([char]0x1F91D)
# Globe: F0 9F 8C 8D
$content = $content -replace '\xF0\x9F\x8C\x8D', ([char]0x1F30D)
# Rocket: F0 9F 9A 80
$content = $content -replace '\xF0\x9F\x9A\x80', ([char]0x1F680)
# Arrow: E2 86 92
$content = $content -replace '\xE2\x86\x92', ([char]0x2192)
# Satellite: F0 9F 9B B0 EF B8 8F
$content = $content -replace '\xF0\x9F\x9B\xB0\xEF\xB8\x8F', ([char]0x1F6F0 + [char]0xFE0F)
# Pin: F0 9F 93 8D
$content = $content -replace '\xF0\x9F\x93\x8D', ([char]0x1F4CD)
# Check: E2 9C 93
$content = $content -replace '\xE2\x9C\x93', ([char]0x2713)
# Triangle: E2 96 BE
$content = $content -replace '\xE2\x96\xBE', ([char]0x25BE)
# Scales: E2 9A 96 EF B8 8F
$content = $content -replace '\xE2\x9A\x96\xEF\xB8\x8F', ([char]0x2696 + [char]0xFE0F)

# Save as UTF-8
$content | Set-Content 'frontend\index.html' -Encoding UTF8 -NoNewline

Write-Host "Fixed encoding!" -ForegroundColor Green
