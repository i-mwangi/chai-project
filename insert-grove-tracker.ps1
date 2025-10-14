# PowerShell script to insert Grove Tracker section into index.html
# This inserts the Grove Tracker between "Our Solution" and "Platform Technology"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Grove Tracker Section Inserter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Read the index.html file
$indexPath = "frontend/index.html"
$embedPath = "grove-tracker-embed-section.html"

if (-not (Test-Path $indexPath)) {
    Write-Host "Error: frontend/index.html not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $embedPath)) {
    Write-Host "Error: grove-tracker-embed-section.html not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Reading files..." -ForegroundColor Yellow

# Read the content
$indexContent = Get-Content $indexPath -Raw
$embedContent = Get-Content $embedPath -Raw

# Find the insertion point (before PLATFORM TECHNOLOGY comment)
$searchString = "            <!-- PLATFORM TECHNOLOGY -->"
$insertPoint = $indexContent.IndexOf($searchString)

if ($insertPoint -eq -1) {
    Write-Host "Error: Could not find insertion point (PLATFORM TECHNOLOGY comment)" -ForegroundColor Red
    exit 1
}

Write-Host "Found insertion point at position: $insertPoint" -ForegroundColor Green

# Check if Grove Tracker section already exists
if ($indexContent.Contains("<!-- GROVE TRACKER SECTION -->")) {
    Write-Host ""
    Write-Host "Warning: Grove Tracker section already exists in index.html!" -ForegroundColor Yellow
    Write-Host "Skipping insertion to avoid duplicates." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If you want to update it:" -ForegroundColor Cyan
    Write-Host "1. Manually remove the existing Grove Tracker section" -ForegroundColor Cyan
    Write-Host "2. Run this script again" -ForegroundColor Cyan
    exit 0
}

# Create backup
$backupPath = "frontend/index.html.backup-grove-tracker"
Write-Host "Creating backup: $backupPath" -ForegroundColor Yellow
Copy-Item $indexPath $backupPath -Force

# Insert the Grove Tracker section
$newContent = $indexContent.Substring(0, $insertPoint) + 
              "`n" + $embedContent + "`n`n" + 
              $indexContent.Substring($insertPoint)

# Write the new content with UTF-8 encoding (with BOM for better compatibility)
Write-Host "Writing updated index.html..." -ForegroundColor Yellow
[System.IO.File]::WriteAllText($indexPath, $newContent, [System.Text.UTF8Encoding]::new($true))

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Grove Tracker section has been inserted into index.html" -ForegroundColor Green
Write-Host ""
Write-Host "Location: Between 'Our Solution' and 'Platform Technology'" -ForegroundColor Cyan
Write-Host "Backup created: $backupPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3000/index.html" -ForegroundColor White
Write-Host "2. Scroll to the Grove Tracker section" -ForegroundColor White
Write-Host "3. See your embedded satellite map!" -ForegroundColor White
Write-Host ""
Write-Host "Features:" -ForegroundColor Yellow
Write-Host "- Embedded iframe with 600px height" -ForegroundColor White
Write-Host "- Even margins on both sides (max-width: 1200px)" -ForegroundColor White
Write-Host "- Full screen button to open in new tab" -ForegroundColor White
Write-Host "- Feature highlights below the map" -ForegroundColor White
Write-Host ""
