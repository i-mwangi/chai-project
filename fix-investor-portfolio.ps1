# Fix for Investor Portfolio Display Issues
# Issues Fixed:
# 1. Health score showing as undefined
# 2. Location tag (blue/purple bar) not displaying

$filePath = "frontend/js/investor-portal.js"

# Read the file
$content = Get-Content $filePath -Raw

# Define the old code pattern to find
$oldPattern = @'
            const gainLoss = holding.currentWorth - holding.totalInvestment;
            const gainLossClass = gainLoss >= 0 ? 'text-success' : 'text-danger';
            const gainLossPercent = ((gainLoss / holding.totalInvestment) * 100).toFixed(1);

            return `
                <div class="list-item">
                    <div class="list-item-header">
                        <h4>${holding.groveName}</h4>
                        <div class="holding-value">
                            <span class="current-value">$${holding.currentWorth.toFixed(2)}</span>
                            <span class="${gainLossClass}">
                                ${gainLoss >= 0 ? '+' : ''}$${gainLoss.toFixed(2)} (${gainLossPercent}%)
                            </span>
                        </div>
                    </div>
                    <div class="list-item-content">
'@

# Define the new code with health score and location
$newCode = @'
            const gainLoss = holding.currentWorth - holding.totalInvestment;
            const gainLossClass = gainLoss >= 0 ? 'text-success' : 'text-danger';
            const gainLossPercent = ((gainLoss / holding.totalInvestment) * 100).toFixed(1);
            
            // Get health score and location from holding data
            const healthScore = holding.currentHealthScore || holding.healthScore || 0;
            const location = holding.location || 'Unknown';
            const coffeeVariety = holding.coffeeVariety || 'Unknown';

            return `
                <div class="list-item">
                    <div class="list-item-header">
                        <h4>${holding.groveName}</h4>
                        <div class="holding-value">
                            <span class="current-value">$${holding.currentWorth.toFixed(2)}</span>
                            <span class="${gainLossClass}">
                                ${gainLoss >= 0 ? '+' : ''}$${gainLoss.toFixed(2)} (${gainLossPercent}%)
                            </span>
                        </div>
                    </div>
                    <div class="grove-meta" style="margin: 10px 0; display: flex; gap: 8px; align-items: center;">
                        <span class="variety-tag">${coffeeVariety}</span>
                        <span class="location-tag">${location}</span>
                        <div class="health-indicator">
                            <span class="health-score ${this.getHealthClass(healthScore)}">
                                ${healthScore}
                            </span>
                            <small>Health Score</small>
                        </div>
                    </div>
                    <div class="list-item-content">
'@

# Perform the replacement
if ($content -match [regex]::Escape($oldPattern.Substring(0, 100))) {
    $content = $content.Replace($oldPattern, $newCode)
    Set-Content -Path $filePath -Value $content -NoNewline
    Write-Host "✅ Successfully patched investor-portal.js" -ForegroundColor Green
    Write-Host "   - Added health score display"
    Write-Host "   - Added location tag (purple bar)"
    Write-Host "   - Added coffee variety tag"
} else {
    Write-Host "❌ Could not find the exact code to replace." -ForegroundColor Red
    Write-Host "   The file may have already been patched or has different formatting."
}
