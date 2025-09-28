/**
 * Investor Portal Management
 * Handles investor-specific functionality including grove browsing,
 * token purchasing, portfolio management, and marketplace trading
 */

class InvestorPortal {
    constructor() {
        this.currentSection = 'browse';
        this.availableGroves = [];
        this.portfolio = null;
        this.marketListings = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Section navigation
        document.querySelectorAll('.investor-dashboard .menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });

        // Filters
        const varietyFilter = document.getElementById('varietyFilter');
        const locationFilter = document.getElementById('locationFilter');
        const yieldFilter = document.getElementById('yieldFilter');

        if (varietyFilter) {
            varietyFilter.addEventListener('change', () => this.applyFilters());
        }
        if (locationFilter) {
            locationFilter.addEventListener('change', () => this.applyFilters());
        }
        if (yieldFilter) {
            yieldFilter.addEventListener('input', () => this.applyFilters());
        }
    }

    switchSection(section) {
        // Update active menu item
        document.querySelectorAll('.investor-dashboard .menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });

        // Update active section
        document.querySelectorAll('.investor-dashboard .section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${section}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        this.currentSection = section;

        // Load section data
        this.loadSectionData(section);
    }

    async loadSectionData(section) {
        if (!window.walletManager.requireInvestor()) return;

        const investorAddress = window.walletManager.getAccountId();

        try {
            // Verification disabled: always allow access
            if (section === 'verification') {
                this.renderInvestorVerificationStatus({ status: 'verified', demoBypass: true });
                return;
            }

            switch (section) {
                case 'browse':
                    await this.loadAvailableGroves();
                    break;
                case 'portfolio':
                    await this.loadPortfolio(investorAddress);
                    break;
                case 'marketplace':
                    await window.marketplace.loadMarketplaceData();
                    break;
                case 'earnings':
                    await this.loadEarnings(investorAddress);
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${section} data:`, error);
            window.walletManager.showToast(`Failed to load ${section} data`, 'error');
        }
    }

    async loadAvailableGroves() {
        window.walletManager.showLoading('Loading available groves...');
        
        try {
            const response = await window.coffeeAPI.getAvailableGroves();
            
            if (response.success) {
                this.availableGroves = response.groves;
                this.populateLocationFilter();
                this.renderAvailableGroves();
            }
        } finally {
            window.walletManager.hideLoading();
        }
    }

    populateLocationFilter() {
        const locationFilter = document.getElementById('locationFilter');
        if (!locationFilter) return;

        // Get unique locations
        const locations = [...new Set(this.availableGroves.map(grove => grove.location))];
        
        // Clear existing options except the first one
        locationFilter.innerHTML = '<option value="">All Locations</option>';
        
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });
    }

    renderAvailableGroves(groves = this.availableGroves) {
        const container = document.getElementById('grovesMarketplace');
        if (!container) return;

        if (groves.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No groves available</h4>
                    <p>Check back later for new investment opportunities</p>
                </div>
            `;
            return;
        }

        container.innerHTML = groves.map(grove => `
            <div class="marketplace-card">
                <div class="grove-header">
                    <h4>${grove.groveName}</h4>
                    <div class="health-indicator">
                        <span class="health-score ${this.getHealthClass(grove.healthScore)}">
                            ${grove.healthScore}
                        </span>
                        <small>Health Score</small>
                    </div>
                </div>
                
                <div class="grove-details">
                    <div class="detail-row">
                        <span class="label">Location:</span>
                        <span class="value">${grove.location}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Variety:</span>
                        <span class="value">${grove.coffeeVariety}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Trees:</span>
                        <span class="value">${grove.treeCount}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Expected Yield:</span>
                        <span class="value">${grove.expectedYieldPerTree} kg/tree</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Tokens Available:</span>
                        <span class="value">${grove.tokensAvailable}</span>
                    </div>
                </div>
                
                <div class="investment-info">
                    <div class="price-info">
                        <div class="price">$${grove.pricePerToken}</div>
                        <small>per token</small>
                    </div>
                    <div class="return-info">
                        <div class="return">${grove.projectedAnnualReturn}%</div>
                        <small>projected annual return</small>
                    </div>
                </div>
                
                <div class="grove-actions">
                    <button class="btn btn-secondary" onclick="investorPortal.viewGroveDetails('${grove.id}')">
                        View Details
                    </button>
                    <button class="btn btn-primary" onclick="investorPortal.showPurchaseModal('${grove.id}')">
                        Invest Now
                    </button>
                </div>
            </div>
        `).join('');
    }

    getHealthClass(score) {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'danger';
    }

    applyFilters() {
        const varietyFilter = document.getElementById('varietyFilter')?.value || '';
        const locationFilter = document.getElementById('locationFilter')?.value || '';
        const yieldFilter = parseFloat(document.getElementById('yieldFilter')?.value || 0);

        let filteredGroves = this.availableGroves.filter(grove => {
            const varietyMatch = !varietyFilter || grove.coffeeVariety === varietyFilter;
            const locationMatch = !locationFilter || grove.location === locationFilter;
            const yieldMatch = !yieldFilter || grove.expectedYieldPerTree >= yieldFilter;
            
            return varietyMatch && locationMatch && yieldMatch;
        });

        this.renderAvailableGroves(filteredGroves);
    }

    showPurchaseModal(groveId) {
        const grove = this.availableGroves.find(g => g.id === groveId);
        if (!grove) return;

        // Create purchase modal dynamically
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h4>Purchase Tree Tokens</h4>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="purchase-info">
                        <h5>${grove.groveName}</h5>
                        <p>${grove.location} • ${grove.coffeeVariety}</p>
                        
                        <div class="investment-summary">
                            <div class="summary-row">
                                <span>Price per token:</span>
                                <span>$${grove.pricePerToken}</span>
                            </div>
                            <div class="summary-row">
                                <span>Available tokens:</span>
                                <span>${grove.tokensAvailable}</span>
                            </div>
                            <div class="summary-row">
                                <span>Projected annual return:</span>
                                <span>${grove.projectedAnnualReturn}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <form id="purchaseForm">
                        <div class="form-group">
                            <label for="tokenAmount">Number of tokens to purchase</label>
                            <input type="number" id="tokenAmount" name="tokenAmount" 
                                   min="1" max="${grove.tokensAvailable}" required>
                        </div>
                        
                        <div class="purchase-calculation">
                            <div class="calc-row">
                                <span>Total investment:</span>
                                <span id="totalInvestment">$0.00</span>
                            </div>
                            <div class="calc-row">
                                <span>Projected annual earnings:</span>
                                <span id="projectedEarnings">$0.00</span>
                            </div>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                            <button type="submit" class="btn btn-primary">Purchase Tokens</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Set up event listeners
        const tokenAmountInput = modal.querySelector('#tokenAmount');
        const totalInvestmentSpan = modal.querySelector('#totalInvestment');
        const projectedEarningsSpan = modal.querySelector('#projectedEarnings');

        tokenAmountInput.addEventListener('input', () => {
            const amount = parseInt(tokenAmountInput.value) || 0;
            const totalInvestment = amount * grove.pricePerToken;
            const projectedEarnings = totalInvestment * (grove.projectedAnnualReturn / 100);
            
            totalInvestmentSpan.textContent = `$${totalInvestment.toFixed(2)}`;
            projectedEarningsSpan.textContent = `$${projectedEarnings.toFixed(2)}`;
        });

        // Close modal handlers
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        // Purchase form handler
        const purchaseForm = modal.querySelector('#purchaseForm');
        purchaseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleTokenPurchase(groveId, parseInt(tokenAmountInput.value));
            document.body.removeChild(modal);
        });
    }

    async handleTokenPurchase(groveId, tokenAmount) {
        const investorAddress = window.walletManager.getAccountId();

        try {
            window.walletManager.showLoading('Processing token purchase...');
            
            const response = await window.coffeeAPI.purchaseTokens(groveId, tokenAmount, investorAddress);
            
            if (response.success) {
                window.walletManager.showToast('Tokens purchased successfully!', 'success');
                
                // Refresh available groves and portfolio
                await this.loadAvailableGroves();
                if (this.currentSection === 'portfolio') {
                    await this.loadPortfolio(investorAddress);
                }
            }
        } catch (error) {
            console.error('Token purchase failed:', error);
            window.walletManager.showToast('Failed to purchase tokens', 'error');
        } finally {
            window.walletManager.hideLoading();
        }
    }

    async loadPortfolio(investorAddress) {
        window.walletManager.showLoading('Loading portfolio...');
        
        try {
            const response = await window.coffeeAPI.getPortfolio(investorAddress);
            
            if (response.success) {
                this.portfolio = response.portfolio;
                this.renderPortfolioStats();
                this.renderPortfolioChart();
                this.renderHoldings();
            }
        } finally {
            window.walletManager.hideLoading();
        }
    }

    renderPortfolioStats() {
        if (!this.portfolio) return;

        document.getElementById('totalInvestment').textContent = `$${this.portfolio.totalInvestment.toFixed(2)}`;
        document.getElementById('currentValue').textContent = `$${this.portfolio.currentValue.toFixed(2)}`;
        document.getElementById('totalReturns').textContent = `$${this.portfolio.totalReturns.toFixed(2)}`;
        document.getElementById('roi').textContent = `${this.portfolio.roi.toFixed(1)}%`;
    }

    renderPortfolioChart() {
        const canvas = document.getElementById('portfolioChart');
        if (!canvas || !this.portfolio) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.portfolioChart) {
            this.portfolioChart.destroy();
        }

        // Create pie chart showing portfolio distribution
        const holdings = this.portfolio.holdings;
        
        this.portfolioChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: holdings.map(h => h.groveName),
                datasets: [{
                    data: holdings.map(h => h.currentWorth),
                    backgroundColor: [
                        '#8B4513',
                        '#A0522D',
                        '#CD853F',
                        '#DEB887',
                        '#F4A460',
                        '#D2691E'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderHoldings() {
        const container = document.getElementById('holdingsList');
        if (!container || !this.portfolio) return;

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
                        <div class="list-item-detail">
                            <label>Tokens Owned</label>
                            <span>${holding.tokenAmount}</span>
                        </div>
                        <div class="list-item-detail">
                            <label>Purchase Price</label>
                            <span>$${holding.purchasePrice.toFixed(2)}</span>
                        </div>
                        <div class="list-item-detail">
                            <label>Current Price</label>
                            <span>$${holding.currentValue.toFixed(2)}</span>
                        </div>
                        <div class="list-item-detail">
                            <label>Total Investment</label>
                            <span>$${holding.totalInvestment.toFixed(2)}</span>
                        </div>
                        <div class="list-item-detail">
                            <label>Total Earnings</label>
                            <span class="text-success">$${holding.earnings.toFixed(2)}</span>
                        </div>
                        <div class="list-item-detail">
                            <label>Purchase Date</label>
                            <span>${new Date(holding.purchaseDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="holding-actions">
                        <button class="btn btn-secondary" onclick="investorPortal.viewHoldingDetails('${holding.groveId}')">
                            View Details
                        </button>
                        <button class="btn btn-warning" onclick="investorPortal.listForSale('${holding.groveId}', ${holding.tokenAmount})">
                            List for Sale
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadMarketplace() {
        window.walletManager.showLoading('Loading marketplace...');
        
        try {
            const response = await window.coffeeAPI.getMarketplaceListings();
            
            if (response.success) {
                this.marketListings = response.listings;
            } else {
                // Fallback to mock data for development
                this.marketListings = [
                    {
                        id: '1',
                        groveName: 'Sunrise Valley Grove',
                        sellerAddress: '0x789...',
                        tokenAmount: 10,
                        askingPrice: 28.00,
                        originalPrice: 25.00,
                        listingDate: new Date('2024-12-01').toISOString(),
                        coffeeVariety: 'Arabica',
                        location: 'Costa Rica',
                        healthScore: 85
                    },
                    {
                        id: '2',
                        groveName: 'Mountain Peak Coffee',
                        sellerAddress: '0xabc...',
                        tokenAmount: 5,
                        askingPrice: 32.00,
                        originalPrice: 30.00,
                        listingDate: new Date('2024-12-05').toISOString(),
                        coffeeVariety: 'Bourbon',
                        location: 'Colombia',
                        healthScore: 92
                    },
                    {
                        id: '3',
                        groveName: 'Highland Estate',
                        sellerAddress: '0xdef...',
                        tokenAmount: 25,
                        askingPrice: 22.50,
                        originalPrice: 20.00,
                        listingDate: new Date('2024-12-10').toISOString(),
                        coffeeVariety: 'Geisha',
                        location: 'Panama',
                        healthScore: 78
                    }
                ];
            }

            this.renderMarketplace();
            this.renderMarketplaceStats();
        } finally {
            window.walletManager.hideLoading();
        }
    }

    renderMarketplace() {
        const container = document.getElementById('marketListings');
        if (!container) return;

        if (this.marketListings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No tokens for sale</h4>
                    <p>Check back later for secondary market opportunities</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.marketListings.map(listing => {
            const priceChange = listing.askingPrice - listing.originalPrice;
            const priceChangePercent = ((priceChange / listing.originalPrice) * 100).toFixed(1);
            const priceChangeClass = priceChange >= 0 ? 'text-success' : 'text-danger';

            return `
                <div class="marketplace-card">
                    <div class="listing-header">
                        <h4>${listing.groveName}</h4>
                        <div class="listing-price">
                            <span class="price">$${listing.askingPrice.toFixed(2)}</span>
                            <small>per token</small>
                        </div>
                    </div>
                    
                    <div class="listing-details">
                        <div class="detail-row">
                            <span class="label">Tokens Available:</span>
                            <span class="value">${listing.tokenAmount}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Original Price:</span>
                            <span class="value">$${listing.originalPrice.toFixed(2)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Price Change:</span>
                            <span class="value ${priceChangeClass}">
                                ${priceChange >= 0 ? '+' : ''}$${priceChange.toFixed(2)} (${priceChangePercent}%)
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Listed:</span>
                            <span class="value">${new Date(listing.listingDate).toLocaleDateString()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Seller:</span>
                            <span class="value">${this.formatAddress(listing.sellerAddress)}</span>
                        </div>
                    </div>
                    
                    <div class="listing-actions">
                        <button class="btn btn-primary" onclick="investorPortal.buyFromMarketplace('${listing.id}')">
                            Buy Tokens
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadEarnings(investorAddress) {
        window.walletManager.showLoading('Loading earnings history...');
        
        try {
            const response = await window.coffeeAPI.getHolderEarnings(investorAddress);
            
            if (response.success) {
                const earnings = response.earnings?.earningsHistory || [];
                this.renderEarningsChart(earnings);
                this.renderEarningsList(earnings);
            }
        } finally {
            window.walletManager.hideLoading();
        }
    }

    renderEarningsChart(earnings) {
        const canvas = document.getElementById('earningsChart');
        if (!canvas || !earnings) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.earningsChart) {
            this.earningsChart.destroy();
        }

        // Group earnings by month
        const monthlyEarnings = {};
        if (earnings && Array.isArray(earnings)) {
            earnings.forEach(earning => {
                const month = new Date(earning.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                monthlyEarnings[month] = (monthlyEarnings[month] || 0) + earning.amount;
            });
        }

        this.earningsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(monthlyEarnings),
                datasets: [{
                    label: 'Monthly Earnings',
                    data: Object.values(monthlyEarnings),
                    backgroundColor: 'rgba(139, 69, 19, 0.8)',
                    borderColor: '#8B4513',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    renderEarningsList(earnings) {
        const container = document.getElementById('earningsList');
        if (!container || !earnings || !Array.isArray(earnings)) return;

        if (earnings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No earnings yet</h4>
                    <p>Earnings will appear here after harvest distributions</p>
                </div>
            `;
            return;
        }

        container.innerHTML = earnings.map(earning => `
            <div class="list-item">
                <div class="list-item-header">
                    <h4>${earning.groveName}</h4>
                    <span class="text-success">+$${earning.amount.toFixed(2)}</span>
                </div>
                <div class="list-item-content">
                    <div class="list-item-detail">
                        <label>Date</label>
                        <span>${new Date(earning.date).toLocaleDateString()}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Tokens</label>
                        <span>${earning.tokenAmount}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Per Token</label>
                        <span>$${(earning.amount / earning.tokenAmount).toFixed(4)}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Harvest ID</label>
                        <span>${earning.harvestId}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    async checkVerificationForSection(investorAddress, section) {
        // Frontend verification disabled — always allow
        return true;
    }

    showVerificationRequired(section) {
        // No-op: verification UI removed in this build. Show simple available message instead
        const sectionContainer = document.getElementById(`${section}Section`);
        if (!sectionContainer) return;
        sectionContainer.innerHTML = `<div class="info-card"><p>Feature available (verification disabled).</p></div>`;
    }

    async loadInvestorVerificationStatus(investorAddress) {
        // Verification disabled: show verified
        this.renderInvestorVerificationStatus({ status: 'verified', demoBypass: true });
    }

    renderInvestorVerificationStatus(verification) {
        const statusContainer = document.getElementById('investorVerificationStatus');
        const formContainer = document.getElementById('investorVerificationForm');

        if (!statusContainer || !formContainer) return;

        if (verification && verification.status !== 'pending') {
            // Show status
            statusContainer.innerHTML = `
                <div class="verification-status-card">
                    <h4>Verification Status</h4>
                    <div class="status-badge status-${verification.status}">
                        ${verification.status.toUpperCase()}
                    </div>
                    
                    ${verification.status === 'verified' ? `
                        <p class="text-success">Your investor credentials have been verified!</p>
                        <p>Verified on: ${new Date(verification.verificationDate).toLocaleDateString()}</p>
                        <p>You can now invest in coffee groves and access all platform features.</p>
                    ` : verification.status === 'rejected' ? `
                        <p class="text-danger">Your verification was rejected.</p>
                        <p>Reason: ${verification.rejectionReason}</p>
                        <p>Please resubmit your documents with the required corrections.</p>
                    ` : ''}
                </div>
            `;

            // Hide or show form based on status
            if (verification.status === 'verified') {
                formContainer.style.display = 'none';
            } else {
                formContainer.style.display = 'block';
            }
        } else {
            // Show pending status or form for new users
            if (verification && verification.status === 'pending') {
                statusContainer.innerHTML = `
                    <div class="verification-status-card">
                        <h4>Verification Status</h4>
                        <div class="status-badge status-pending">PENDING</div>
                        <p>Your documents are being reviewed. This usually takes 1-3 business days.</p>
                        <p>Submitted on: ${new Date(verification.submissionDate).toLocaleDateString()}</p>
                    </div>
                `;
                formContainer.style.display = 'none';
            } else {
                statusContainer.innerHTML = '';
                formContainer.style.display = 'block';
            }
        }

        // Set up form submission
        this.setupInvestorVerificationForm();
    }

    setupInvestorVerificationForm() {
        const form = document.getElementById('investorDocumentsForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleInvestorDocumentSubmission(e);
        });
    }

    async handleInvestorDocumentSubmission(e) {
        const formData = new FormData(e.target);
        const investorAddress = window.walletManager.getAccountId();

        try {
            window.walletManager.showLoading('Submitting documents...');

            // Simulate document upload (in real implementation, upload to secure storage)
            const documents = {
                identityDocument: formData.get('identityDocument')?.name || 'identity_document.pdf',
                proofOfAddress: formData.get('proofOfAddress')?.name || 'proof_of_address.pdf',
                financialInformation: formData.get('financialInformation')?.name || 'financial_info.pdf'
            };

            // Submit verification
            const response = await window.coffeeAPI.submitInvestorVerificationDocuments(
                investorAddress,
                documents
            );

            if (response.success) {
                window.walletManager.showToast('Documents submitted successfully!', 'success');
                await this.loadInvestorVerificationStatus(investorAddress);
            }
        } catch (error) {
            console.error('Document submission failed:', error);
            window.walletManager.showToast('Failed to submit documents', 'error');
        } finally {
            window.walletManager.hideLoading();
        }
    }

    viewGroveDetails(groveId) {
        const grove = this.availableGroves.find(g => g.id === groveId);
        if (!grove) return;

        window.walletManager.showToast(`Grove details for ${grove.groveName}`, 'success');
    }

    viewHoldingDetails(groveId) {
        const holding = this.portfolio?.holdings.find(h => h.groveId === groveId);
        if (!holding) return;

        window.walletManager.showToast(`Holding details for ${holding.groveName}`, 'success');
    }

    listForSale(groveId, tokenAmount) {
        window.marketplace.showListingModal(groveId, tokenAmount);
    }

    buyFromMarketplace(listingId) {
        window.marketplace.showPurchaseModal(listingId);
    }
}

// Create global investor portal instance
window.investorPortal = new InvestorPortal();