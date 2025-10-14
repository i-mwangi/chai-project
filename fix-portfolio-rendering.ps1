# PowerShell script to fix the portfolio rendering issue

$file = "frontend/js/investor-portal.js"
$content = Get-Content $file -Raw

Write-Host "Fixing portfolio rendering..." -ForegroundColor Yellow

# Fix: Change holding.currentWorth to currentWorth
$content = $content -replace '\$\{holding\.currentWorth\.toFixed\(2\)\}', '$${currentWorth.toFixed(2)}'

# Fix: Change holding.tokenAmount to tokenAmount
$content = $content -replace '<span>\$\{holding\.tokenAmount\}</span>', '<span>${tokenAmount}</span>'

# Fix: Change holding.purchasePrice to purchasePrice  
$content = $content -replace '<span>\$\{holding\.purchasePrice\.toFixed\(2\)\}</span>', '<span>$${purchasePrice.toFixed(2)}</span>'

# Fix: Change holding.currentValue to currentValue
$content = $content -replace '<span>\$\{holding\.currentValue\.toFixed\(2\)\}</span>', '<span>$${currentValue.toFixed(2)}</span>'

# Fix: Change holding.totalInvestment to totalInvestment
$content = $content -replace '<span>\$\{holding\.totalInvestment\.toFixed\(2\)\}</span>', '<span>$${totalInvestment.toFixed(2)}</span>'

# Fix: Change holding.earnings to earnings
$content = $content -replace '<span class="text-success">\$\{holding\.earnings\.toFixed\(2\)\}</span>', '<span class="text-success">$${earnings.toFixed(2)}</span>'

Set-Content $file $content -NoNewline

Write-Host "Done! Restart frontend server." -ForegroundColor Green
