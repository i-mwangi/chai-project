// Fixed renderHoldings method
// Copy this and replace the existing renderHoldings method in investor-portal.js

renderHoldings() {
    console.log(`[InvestorPortal] Rendering holdings...`);
    const container = document.getElementById('holdingsList');
    if (!container || !this.portfolio) {
        console.log(`[InvestorPortal] No container or portfolio`);
        return;
    }

    console.log(`[InvestorPortal] Holdings to render:`, this.portfolio.holdings.length);

    if (this.portfolio.holdings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h4>No investments yet</h4>
                <p>Browse available groves to start investing</p>
                <button class="btn btn-primary" onclick="investorPortal.switchSection('browse')">
                    Browse Groves
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = this.portfolio.holdings.map(holding => {
        // Calculate values from available data
        const purchasePrice = holding.purchasePrice || 0;
        const tokenAmount = holding.tokenAmount || 0;
        const totalInvestment = purchasePrice * tokenAmount;
        const currentValue = purchasePrice; // For now, same as purchase price
        const currentWorth = currentValue * tokenAmount;
        const earnings = 0; // No earnings yet
        
        const gainLoss = currentWorth - totalInvestment;
        const gainLossClass = gainLoss >= 0 ? 'text-success' : 'text-danger';
        const gainLossPercent = totalInvestment > 0 ? ((gainLoss / totalInvestment) * 100).toFixed(1) : '0.0';
        
        // Get health score and location from holding data
        const healthScore = holding.currentHealthScore || holding.healthScore || 0;
        const location = holding.location || 'Unknown';
        const coffeeVariety = holding.coffeeVariety || 'Unknown';

        return `
            <div class="list-item">
                <div class="list-item-header">
                    <h4>${holding.groveName}</h4>
                    <div class="holding-value">
                        <span class="current-value">$${currentWorth.toFixed(2)}</span>
                        <span class="${gainLossClass}">
                            ${gainLoss >= 0 ? '+' : ''}$${Math.abs(gainLoss).toFixed(2)} (${gainLossPercent}%)
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
                    <div class="list-item-detail">
                        <label>Tokens Owned</label>
                        <span>${tokenAmount}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Purchase Price</label>
                        <span>$${purchasePrice.toFixed(2)}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Current Price</label>
                        <span>$${currentValue.toFixed(2)}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Total Investment</label>
                        <span>$${totalInvestment.toFixed(2)}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Total Earnings</label>
                        <span class="text-success">$${earnings.toFixed(2)}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Purchase Date</label>
                        <span>${new Date(holding.purchaseDate).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="holding-actions">
                    <button class="btn btn-secondary holding-details-btn" data-grove-id="${holding.groveId}">
                        View Details
                    </button>
                    <button class="btn btn-warning holding-sell-btn" data-grove-id="${holding.groveId}" data-token-amount="${tokenAmount}">
                        List for Sale
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Add event listeners for holding buttons
    const detailsButtons = container.querySelectorAll('.holding-details-btn');
    const sellButtons = container.querySelectorAll('.holding-sell-btn');

    detailsButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const groveId = e.currentTarget.dataset.groveId;
            this.viewHoldingDetails(groveId);
        });
    });

    sellButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const groveId = e.currentTarget.dataset.groveId;
            const tokenAmount = parseInt(e.currentTarget.dataset.tokenAmount);
            this.listForSale(groveId, tokenAmount);
        });
    });

    console.log(`[InvestorPortal] Holdings rendered successfully`);
}
