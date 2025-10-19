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
        this.setupBalanceListeners();
    }

    setupBalanceListeners() {
        // Listen for balance updates from the balance poller
        if (window.balancePoller) {
            // Listen for token balance updates
            window.balancePoller.addListener('tokenBalances', (balances) => {
                this.handleTokenBalanceUpdate(balances);
            });

            // Listen for USDC balance updates
            window.balancePoller.addListener('usdcBalance', (balance) => {
                this.handleUSDCBalanceUpdate(balance);
            });

            // Listen for LP token balance updates
            window.balancePoller.addListener('lpBalances', (balances) => {
                this.handleLPBalanceUpdate(balances);
            });

            // Listen for pending distributions
            window.balancePoller.addListener('pendingDistributions', (distributions) => {
                this.handlePendingDistributionsUpdate(distributions);
            });
        }
    }

    handleTokenBalanceUpdate(balances) {
        // Update portfolio display if on portfolio section
        if (this.currentSection === 'portfolio' && this.portfolio) {
            // Refresh portfolio data
            const investorAddress = window.walletManager.getAccountId();
            if (investorAddress) {
                this.loadPortfolio(investorAddress);
            }
        }
    }

    handleUSDCBalanceUpdate(balance) {
        // Update USDC balance display
        const usdcBalanceEl = document.getElementById('investorUSDCBalance');
        if (usdcBalanceEl) {
            usdcBalanceEl.textContent = `${balance.toLocaleString()} USDC`;
        }
    }

    handleLPBalanceUpdate(balances) {
        // Update LP token displays if on lending section
        if (this.currentSection === 'lending') {
            const investorAddress = window.walletManager.getAccountId();
            if (investorAddress) {
                this.loadLendingPools(investorAddress);
            }
        }
    }

    handlePendingDistributionsUpdate(distributions) {
        // Update earnings display if on earnings section
        if (this.currentSection === 'earnings') {
            const investorAddress = window.walletManager.getAccountId();
            if (investorAddress) {
                this.loadEarnings(investorAddress);
            }
        }
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
            yieldFilter.addEventListener('input', () => {
                // Update the displayed value
                const valueDisplay = document.getElementById('yieldFilterValue');
                if (valueDisplay) {
                    valueDisplay.textContent = parseFloat(yieldFilter.value).toFixed(1);
                }
                this.applyFilters();
            });
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
                case 'lending':
                    await this.loadLendingPools(investorAddress);
                    await this.loadLoanData(investorAddress);
                    break;
                case 'transactions':
                    await this.loadTransactionHistory(investorAddress);
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
        
        // Re-attach event listener to ensure it works
        locationFilter.removeEventListener('change', this.applyFiltersHandler);
        this.applyFiltersHandler = () => this.applyFilters();
        locationFilter.addEventListener('change', this.applyFiltersHandler);
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

        container.innerHTML = groves.map(grove => {
            const healthScore = grove.healthScore || grove.currentHealthScore || 0;
            return `
            <div class="marketplace-card">
                <div class="grove-header">
                    <h4>${grove.groveName}</h4>
                    <div class="health-indicator">
                        <span class="health-score ${this.getHealthClass(healthScore)}">
                            ${healthScore}
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
                    <button class="btn btn-secondary grove-details-btn" data-grove-id="${grove.id}">
                        View Details
                    </button>
                    <button class="btn btn-primary grove-invest-btn" data-grove-id="${grove.id}">
                        Invest Now
                    </button>
                </div>
            </div>
        `;
        }).join('');

        // Add event listeners for buttons using event delegation
        const detailButtons = container.querySelectorAll('.grove-details-btn');
        const investButtons = container.querySelectorAll('.grove-invest-btn');
        
        console.log(`[InvestorPortal] Attaching listeners to ${detailButtons.length} detail buttons and ${investButtons.length} invest buttons`);
        
        detailButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const groveId = e.currentTarget.dataset.groveId;
                console.log(`[InvestorPortal] View Details clicked for grove: ${groveId}`);
                this.viewGroveDetails(groveId);
            });
        });

        investButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const groveId = e.currentTarget.dataset.groveId;
                console.log(`[InvestorPortal] Invest Now clicked for grove: ${groveId}`);
                this.showPurchaseModal(groveId);
            });
        });
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
        console.log(`[InvestorPortal] showPurchaseModal called with groveId: ${groveId}`);
        const grove = this.availableGroves.find(g => g.id == groveId);
        if (!grove) {
            console.error(`[InvestorPortal] Grove not found for purchase: ${groveId}`);
            return;
        }

        console.log(`[InvestorPortal] Opening purchase modal for grove:`, grove.groveName);
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
            console.log('[InvestorPortal] Purchase form submitted!');
            await this.handleTokenPurchase(groveId, parseInt(tokenAmountInput.value));
            document.body.removeChild(modal);
        });
    }

    viewGroveDetails(groveId) {
        console.log(`[InvestorPortal] viewGroveDetails called with groveId: ${groveId}`);
        console.log(`[InvestorPortal] Available groves:`, this.availableGroves.map(g => g.id));
        const grove = this.availableGroves.find(g => g.id == groveId);
        if (!grove) {
            console.error(`[InvestorPortal] Grove not found: ${groveId}`);
            window.walletManager.showToast('Grove not found', 'error');
            return;
        }

        console.log(`[InvestorPortal] Opening details for grove:`, grove.groveName);
        
        try {
            // Create detailed grove modal
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h4>Grove Details: ${grove.groveName}</h4>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="grove-details-grid">
                        <div class="detail-section">
                            <h5>Basic Information</h5>
                            <div class="detail-list">
                                <div class="detail-row">
                                    <span class="label">Grove Name:</span>
                                    <span class="value">${grove.groveName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Location:</span>
                                    <span class="value">${grove.location}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Coffee Variety:</span>
                                    <span class="value">${grove.coffeeVariety}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Number of Trees:</span>
                                    <span class="value">${grove.treeCount}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Expected Yield per Tree:</span>
                                    <span class="value">${grove.expectedYieldPerTree} kg/year</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h5>Investment Information</h5>
                            <div class="detail-list">
                                <div class="detail-row">
                                    <span class="label">Health Score:</span>
                                    <span class="value">
                                        <span class="health-score ${this.getHealthClass(grove.healthScore)}">
                                            ${grove.healthScore}
                                        </span>
                                    </span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Tokens Available:</span>
                                    <span class="value">${grove.tokensAvailable}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Price per Token:</span>
                                    <span class="value">$${grove.pricePerToken.toFixed(2)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Projected Annual Return:</span>
                                    <span class="value">${grove.projectedAnnualReturn}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-secondary modal-close">Close</button>
                        <button class="btn btn-primary" onclick="investorPortal.showPurchaseModal('${grove.id}'); document.body.removeChild(this.closest('.modal'));">
                            Invest Now
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        console.log(`[InvestorPortal] Modal appended to body`);

        // Close modal handlers
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                console.log(`[InvestorPortal] Closing modal via close button`);
                document.body.removeChild(modal);
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log(`[InvestorPortal] Closing modal via backdrop click`);
                document.body.removeChild(modal);
            }
        });
        
            console.log(`[InvestorPortal] Modal event listeners attached`);
        } catch (error) {
            console.error(`[InvestorPortal] Error creating modal:`, error);
            window.walletManager.showToast('Error displaying grove details', 'error');
        }
    }

    viewHoldingDetails(groveId) {
        console.log(`[InvestorPortal] viewHoldingDetails called for grove: ${groveId}`);
        const holding = this.portfolio?.holdings.find(h => h.groveId == groveId);
        if (!holding) {
            console.error(`[InvestorPortal] Holding not found for grove: ${groveId}`);
            window.walletManager.showToast('Holding not found', 'error');
            return;
        }

        console.log(`[InvestorPortal] Found holding:`, holding);
        const grove = this.availableGroves.find(g => g.id == holding.groveId);
        if (!grove) {
            window.walletManager.showToast('Grove not found', 'error');
            return;
        }

        // Create detailed holding modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h4>Holding Details: ${grove.groveName}</h4>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="holding-details-grid">
                        <div class="detail-section">
                            <h5>Basic Information</h5>
                            <div class="detail-list">
                                <div class="detail-row">
                                    <span class="label">Grove Name:</span>
                                    <span class="value">${grove.groveName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Location:</span>
                                    <span class="value">${grove.location}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Coffee Variety:</span>
                                    <span class="value">${grove.coffeeVariety}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Number of Trees:</span>
                                    <span class="value">${grove.treeCount}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Expected Yield per Tree:</span>
                                    <span class="value">${grove.expectedYieldPerTree} kg/year</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h5>Investment Information</h5>
                            <div class="detail-list">
                                <div class="detail-row">
                                    <span class="label">Health Score:</span>
                                    <span class="value">
                                        <span class="health-score ${this.getHealthClass(grove.healthScore)}">
                                            ${grove.healthScore}
                                        </span>
                                    </span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Tokens Available:</span>
                                    <span class="value">${grove.tokensAvailable}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Price per Token:</span>
                                    <span class="value">$${grove.pricePerToken.toFixed(2)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Projected Annual Return:</span>
                                    <span class="value">${grove.projectedAnnualReturn}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h5>Your Holding</h5>
                            <div class="detail-list">
                                <div class="detail-row">
                                    <span class="label">Number of Tokens:</span>
                                    <span class="value">${holding.tokenAmount || 0}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Investment Value:</span>
                                    <span class="value">$${((holding.purchasePrice || 0) * (holding.tokenAmount || 0)).toFixed(2)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Annual Earnings:</span>
                                    <span class="value">$${0.00}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-secondary modal-close">Close</button>
                        <button class="btn btn-primary holding-sell-from-details-btn" data-grove-id="${grove.id}" data-token-amount="${holding.tokenAmount || 0}">
                            List for Sale
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

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

        // Sell button handler
        const sellBtn = modal.querySelector('.holding-sell-from-details-btn');
        if (sellBtn) {
            sellBtn.addEventListener('click', (e) => {
                const groveId = e.currentTarget.dataset.groveId;
                const tokenAmount = parseInt(e.currentTarget.dataset.tokenAmount);
                document.body.removeChild(modal);
                this.listForSale(groveId, tokenAmount);
            });
        }
}

async handleTokenPurchase(groveId, tokenAmount) {
    const investorAddress = window.walletManager.getAccountId();
    
    console.log(`[InvestorPortal] ===== PURCHASE STARTING =====`);
    console.log(`[InvestorPortal] Grove ID: ${groveId}`);
    console.log(`[InvestorPortal] Token Amount: ${tokenAmount}`);
    console.log(`[InvestorPortal] Investor Address: ${investorAddress}`);
    
    if (!investorAddress) {
        console.error('[InvestorPortal] ERROR: No investor address!');
        window.walletManager.showToast('Please connect your wallet first', 'error');
        return;
    }
    
    window.walletManager.showLoading('Processing token purchase...');

    try {
        console.log(`[InvestorPortal] Calling API...`);
        const response = await window.coffeeAPI.purchaseTokens(groveId, tokenAmount, investorAddress);
        console.log(`[InvestorPortal] API Response:`, response);

        if (response.success) {
            console.log(`[InvestorPortal] ✅ Purchase successful! Holding ID: ${response.data?.holdingId}`);
            window.walletManager.showToast(`Successfully purchased ${tokenAmount} tokens!`, 'success');
            
            // Refresh balances after transaction within 5 seconds
            if (window.balancePoller && response.transactionHash) {
                await window.balancePoller.refreshAfterTransaction(response.transactionHash, ['usdc', 'token']);
            }
            
            // Reload portfolio
            console.log(`[InvestorPortal] Reloading portfolio...`);
            await this.loadPortfolio(investorAddress);
            
            // Reload available groves to show updated token counts
            console.log(`[InvestorPortal] Reloading available groves...`);
            await this.loadAvailableGroves();
        } else {
            console.error(`[InvestorPortal] ❌ Purchase failed:`, response.error);
            throw new Error(response.error || 'Failed to purchase tokens');
        }
    } catch (error) {
        console.error('[InvestorPortal] ❌ Token purchase error:', error);
        window.walletManager.showToast('Failed to purchase tokens: ' + error.message, 'error');
    } finally {
        window.walletManager.hideLoading();
        console.log(`[InvestorPortal] ===== PURCHASE COMPLETE =====`);
    }
}

    async loadPortfolio(investorAddress) {
        console.log(`[InvestorPortal] Loading portfolio for investor: ${investorAddress}`);
        window.walletManager.showLoading('Loading portfolio...');

        try {
            const response = await window.coffeeAPI.getPortfolio(investorAddress);
            console.log(`[InvestorPortal] Portfolio response:`, response);

            if (response.success) {
                this.portfolio = response.portfolio;
                console.log(`[InvestorPortal] Portfolio loaded:`, this.portfolio);
                console.log(`[InvestorPortal] Holdings count:`, this.portfolio.holdings?.length || 0);
                this.renderPortfolioStats();
                this.renderPortfolioChart();
                this.renderHoldings();
            } else {
                console.error(`[InvestorPortal] Failed to load portfolio:`, response.error);
            }
        } catch (error) {
            console.error(`[InvestorPortal] Error loading portfolio:`, error);
        } finally {
            window.walletManager.hideLoading();
        }
    }

    renderPortfolioStats() {
        if (!this.portfolio) return;

        const totalInvestment = this.portfolio.totalInvestment || 0;
        const currentValue = this.portfolio.currentValue || 0;
        const totalReturns = this.portfolio.totalReturns || 0;
        const roi = this.portfolio.roi || 0;

        document.getElementById('totalInvestment').textContent = `$${totalInvestment.toFixed(2)}`;
        document.getElementById('currentValue').textContent = `$${currentValue.toFixed(2)}`;
        document.getElementById('totalReturns').textContent = `$${totalReturns.toFixed(2)}`;
        document.getElementById('roi').textContent = `${roi.toFixed(1)}%`;
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
                    data: holdings.map(h => {
                        const purchasePrice = h.purchasePrice || 0;
                        const tokenAmount = h.tokenAmount || 0;
                        return purchasePrice * tokenAmount;
                    }),
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
                            label: function (context) {
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

        // Add event listeners for holding action buttons
        const detailsButtons = container.querySelectorAll('.holding-details-btn');
        const sellButtons = container.querySelectorAll('.holding-sell-btn');

        console.log(`[InvestorPortal] Attaching listeners to ${detailsButtons.length} details buttons and ${sellButtons.length} sell buttons`);

        detailsButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const groveId = e.currentTarget.dataset.groveId;
                console.log(`[InvestorPortal] View holding details clicked for grove: ${groveId}`);
                this.viewHoldingDetails(groveId);
            });
        });

        sellButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const groveId = e.currentTarget.dataset.groveId;
                const tokenAmount = parseInt(e.currentTarget.dataset.tokenAmount);
                console.log(`[InvestorPortal] List for sale clicked for grove: ${groveId}, tokens: ${tokenAmount}`);
                this.listForSale(groveId, tokenAmount);
            });
        });

        console.log(`[InvestorPortal] Holdings rendered with event listeners attached`);
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
        window.walletManager.showLoading('Loading earnings data...');

        try {
            // Fetch earnings data
            const earningsResponse = await window.coffeeAPI.getHolderEarnings(investorAddress);

            // Fetch pending distributions
            const pendingResponse = await window.coffeeAPI.getPendingDistributions(investorAddress);

            // Fetch distribution history
            const historyResponse = await window.coffeeAPI.getDistributionHistory(investorAddress);

            if (earningsResponse.success) {
                const earningsData = earningsResponse.earnings || {};
                const pendingDistributions = pendingResponse.success ? (pendingResponse.distributions || []) : [];
                const distributionHistory = historyResponse.success ? (historyResponse.distributions || []) : [];

                // Render all earnings components
                this.renderEarningsStats(earningsData, pendingDistributions);
                this.renderPendingDistributions(pendingDistributions);
                this.renderEarningsChart(earningsData.earningsHistory || []);
                this.renderEarningsHistory(distributionHistory);
            }
        } catch (error) {
            console.error('Failed to load earnings:', error);
            window.walletManager.showToast('Failed to load earnings data', 'error');
        } finally {
            window.walletManager.hideLoading();
        }
    }

    /**
     * Render earnings statistics cards
     * @param {Object} earningsData - Earnings data object
     * @param {Array} pendingDistributions - Array of pending distributions
     */
    renderEarningsStats(earningsData, pendingDistributions) {
        // Calculate stats
        const totalEarnings = earningsData.totalEarnings || 0;
        const claimedEarnings = earningsData.claimedEarnings || 0;

        // Calculate pending earnings
        const pendingEarnings = pendingDistributions.reduce((sum, dist) => {
            return sum + (dist.shareAmount || 0);
        }, 0);

        // Calculate monthly earnings (current month)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyEarnings = (earningsData.earningsHistory || [])
            .filter(earning => {
                const earningDate = new Date(earning.date);
                return earningDate.getMonth() === currentMonth &&
                    earningDate.getFullYear() === currentYear;
            })
            .reduce((sum, earning) => sum + (earning.amount || 0), 0);

        // Update DOM elements
        document.getElementById('totalEarningsValue').textContent = `$${totalEarnings.toFixed(2)}`;
        document.getElementById('pendingEarningsValue').textContent = `$${pendingEarnings.toFixed(2)}`;
        document.getElementById('monthlyEarningsValue').textContent = `$${monthlyEarnings.toFixed(2)}`;
        document.getElementById('claimedEarningsValue').textContent = `$${claimedEarnings.toFixed(2)}`;
    }

    /**
     * Render pending distributions list
     * @param {Array} pendingDistributions - Array of pending distribution objects
     */
    renderPendingDistributions(pendingDistributions) {
        const container = document.getElementById('pendingDistributionsList');
        if (!container) return;

        if (!pendingDistributions || pendingDistributions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No pending distributions</p>
                    <small>Distributions will appear here when harvests are processed</small>
                </div>
            `;
            return;
        }

        container.innerHTML = pendingDistributions.map(distribution => `
            <div class="distribution-item">
                <div class="distribution-header">
                    <div class="distribution-info">
                        <h5>${distribution.groveName || 'Unknown Grove'}</h5>
                        <small>Harvest: ${distribution.harvestId || 'N/A'}</small>
                    </div>
                    <div class="distribution-amount">
                        <span class="amount-value">$${(distribution.shareAmount || 0).toFixed(2)}</span>
                        <small>Your share</small>
                    </div>
                </div>
                <div class="distribution-details">
                    <div class="detail-item">
                        <span class="label">Distribution Date:</span>
                        <span class="value">${new Date(distribution.distributionDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Your Tokens:</span>
                        <span class="value">${distribution.tokenBalance || 0}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Total Revenue:</span>
                        <span class="value">$${(distribution.totalRevenue || 0).toFixed(2)}</span>
                    </div>
                </div>
                <div class="distribution-actions">
                    <button class="btn btn-primary claim-earnings-btn" data-distribution-id="${distribution.distributionId}">
                        Claim Earnings
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners for claim buttons
        const claimButtons = container.querySelectorAll('.claim-earnings-btn');
        claimButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const distributionId = e.currentTarget.dataset.distributionId;
                const holderAddress = window.walletManager.getAccountId();
                console.log(`[InvestorPortal] Claiming earnings for distribution: ${distributionId}, holder: ${holderAddress}`);
                await this.claimEarnings(distributionId, holderAddress);
            });
        });
    }

    /**
     * Render earnings history with pagination
     * @param {Array} distributionHistory - Array of distribution history objects
     * @param {number} page - Current page number (default: 1)
     * @param {number} pageSize - Items per page (default: 20)
     */
    renderEarningsHistory(distributionHistory, page = 1, pageSize = 20) {
        const container = document.getElementById('earningsList');
        if (!container) return;

        if (!distributionHistory || distributionHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No earnings history yet</h4>
                    <p>Your earnings will appear here after distributions are claimed</p>
                </div>
            `;
            return;
        }

        // Sort by date (most recent first)
        const sortedHistory = [...distributionHistory].sort((a, b) => {
            return new Date(b.claimDate || b.distributionDate) - new Date(a.claimDate || a.distributionDate);
        });

        // Calculate pagination
        const totalPages = Math.ceil(sortedHistory.length / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageItems = sortedHistory.slice(startIndex, endIndex);

        // Render items
        const itemsHTML = pageItems.map(earning => {
            const isClaimed = earning.claimed || earning.status === 'claimed';
            const statusClass = isClaimed ? 'status-success' : 'status-pending';
            const statusText = isClaimed ? 'Claimed' : 'Pending';

            return `
                <div class="list-item">
                    <div class="list-item-header">
                        <div class="earning-info">
                            <h4>${earning.groveName || 'Unknown Grove'}</h4>
                            <span class="earning-status ${statusClass}">${statusText}</span>
                        </div>
                        <span class="earning-amount text-success">+$${(earning.shareAmount || earning.amount || 0).toFixed(2)}</span>
                    </div>
                    <div class="list-item-content">
                        <div class="list-item-detail">
                            <label>Date</label>
                            <span>${new Date(earning.claimDate || earning.distributionDate).toLocaleDateString()}</span>
                        </div>
                        <div class="list-item-detail">
                            <label>Harvest ID</label>
                            <span>${earning.harvestId || 'N/A'}</span>
                        </div>
                        <div class="list-item-detail">
                            <label>Your Tokens</label>
                            <span>${earning.tokenBalance || earning.tokenAmount || 0}</span>
                        </div>
                        <div class="list-item-detail">
                            <label>Per Token</label>
                            <span>$${((earning.shareAmount || earning.amount || 0) / (earning.tokenBalance || earning.tokenAmount || 1)).toFixed(4)}</span>
                        </div>
                        ${earning.transactionHash ? `
                        <div class="list-item-detail">
                            <label>Transaction</label>
                            <span class="transaction-hash">${this.formatAddress(earning.transactionHash)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Render pagination controls
        const paginationHTML = totalPages > 1 ? `
            <div class="pagination">
                <button class="btn btn-secondary" 
                        onclick="investorPortal.renderEarningsHistory(investorPortal.currentEarningsHistory, ${page - 1})"
                        ${page === 1 ? 'disabled' : ''}>
                    Previous
                </button>
                <span class="pagination-info">Page ${page} of ${totalPages}</span>
                <button class="btn btn-secondary" 
                        onclick="investorPortal.renderEarningsHistory(investorPortal.currentEarningsHistory, ${page + 1})"
                        ${page === totalPages ? 'disabled' : ''}>
                    Next
                </button>
            </div>
        ` : '';

        container.innerHTML = itemsHTML + paginationHTML;

        // Store current history for pagination
        this.currentEarningsHistory = distributionHistory;
    }

    /**
     * Claim earnings from a distribution
     * @param {string} distributionId - Distribution identifier
     * @param {string} holderAddress - Holder's wallet address
     */
    async claimEarnings(distributionId, holderAddress) {
        try {
            window.walletManager.showLoading('Claiming earnings...');

            const response = await window.coffeeAPI.claimEarnings(distributionId, holderAddress);

            if (response.success) {
                window.walletManager.showToast('Earnings claimed successfully!', 'success');
                
                // Show notification with amount
                if (window.notificationManager && response.amount) {
                    window.notificationManager.success(
                        `Successfully claimed ${response.amount} USDC from harvest distribution!`,
                        {
                            title: 'Earnings Claimed',
                            duration: 7000
                        }
                    );
                }

                // Refresh balances after transaction within 5 seconds
                if (window.balancePoller && response.transactionHash) {
                    await window.balancePoller.refreshAfterTransaction(response.transactionHash, ['usdc', 'pending']);
                }

                // Refresh earnings data
                await this.loadEarnings(holderAddress);
            } else {
                throw new Error(response.error || 'Failed to claim earnings');
            }
        } catch (error) {
            console.error('Failed to claim earnings:', error);
            window.walletManager.showToast(error.message || 'Failed to claim earnings', 'error');
        } finally {
            window.walletManager.hideLoading();
        }
    }

    renderEarningsChart(earnings) {
        const canvas = document.getElementById('earningsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (this.earningsChart) {
            this.earningsChart.destroy();
        }

        // Group earnings by month
        const monthlyEarnings = {};
        if (earnings && Array.isArray(earnings)) {
            earnings.forEach(earning => {
                const month = new Date(earning.date || earning.distributionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                monthlyEarnings[month] = (monthlyEarnings[month] || 0) + (earning.amount || earning.shareAmount || 0);
            });
        }

        // If no data, show empty state
        if (Object.keys(monthlyEarnings).length === 0) {
            const container = canvas.parentElement;
            container.innerHTML = `
                <div class="empty-state">
                    <p>No earnings data to display</p>
                    <small>Chart will appear after you receive distributions</small>
                </div>
            `;
            return;
        }

        this.earningsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(monthlyEarnings),
                datasets: [{
                    label: 'Monthly Earnings (USDC)',
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
                            callback: function (value) {
                                return '\$' + value.toFixed(2);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return 'Earnings: \$' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    formatAddress(address) {
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

    listForSale(groveId, tokenAmount) {
        window.marketplace.showListingModal(groveId, tokenAmount);
    }

    buyFromMarketplace(listingId) {
        window.marketplace.showPurchaseModal(listingId);
    }

    /**
     * Load lending pools data
     * @param {string} investorAddress - Investor's wallet address
     */
    async loadLendingPools(investorAddress) {
        window.walletManager.showLoading('Loading lending pools...');

        try {
            // Fetch lending pools data
            const poolsResponse = await window.coffeeAPI.getLendingPools();

            if (poolsResponse && poolsResponse.success) {
                const pools = poolsResponse.pools || [];
                this.renderLendingPools(pools);
                
                // Check for low liquidity alerts
                if (window.notificationManager) {
                    pools.forEach(pool => {
                        const utilizationRate = pool.utilizationRate || 0;
                        if (utilizationRate >= 90) {
                            window.notificationManager.warning(
                                `${pool.assetName || 'USDC'} lending pool utilization is at ${utilizationRate.toFixed(1)}%. Limited liquidity available.`,
                                {
                                    title: 'Low Liquidity Alert',
                                    autoDismiss: false,
                                    action: () => {
                                        // Switch to lending section
                                        this.switchSection('lending');
                                    },
                                    actionLabel: 'View Pools'
                                }
                            );
                        }
                    });
                }
            } else {
                // Show empty state if no pools available
                this.renderLendingPools([]);
            }

            // Fetch user's liquidity positions
            await this.loadLiquidityPositions(investorAddress);

        } catch (error) {
            console.error('Failed to load lending pools:', error);
            window.walletManager.showToast('Failed to load lending pools', 'error');
            this.renderLendingPools([]);
        } finally {
            window.walletManager.hideLoading();
        }
    }

    /**
     * Render lending pools grid
     * @param {Array} pools - Array of lending pool objects
     */
    renderLendingPools(pools) {
        const container = document.getElementById('lendingPoolsGrid');
        if (!container) return;

        if (!pools || pools.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No lending pools available</h4>
                    <p>Check back later for liquidity provision opportunities</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pools.map(pool => {
            const utilizationRate = pool.utilizationRate || 0;
            const utilizationClass = utilizationRate > 80 ? 'text-danger' : utilizationRate > 50 ? 'text-warning' : 'text-success';

            return `
                <div class="pool-card">
                    <div class="pool-header">
                        <h4>${pool.assetName || 'USDC Pool'}</h4>
                        <div class="pool-apy">
                            <span class="apy-value">${(pool.currentAPY || 0).toFixed(2)}%</span>
                            <small>APY</small>
                        </div>
                    </div>
                    
                    <div class="pool-stats">
                        <div class="stat-row">
                            <span class="label">Total Value Locked:</span>
                            <span class="value">$${(pool.totalLiquidity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div class="stat-row">
                            <span class="label">Available Liquidity:</span>
                            <span class="value">$${(pool.availableLiquidity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div class="stat-row">
                            <span class="label">Total Borrowed:</span>
                            <span class="value">$${(pool.totalBorrowed || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div class="stat-row">
                            <span class="label">Utilization Rate:</span>
                            <span class="value ${utilizationClass}">${utilizationRate.toFixed(1)}%</span>
                        </div>
                    </div>
                    
                    <div class="pool-actions">
                        <button class="btn btn-primary" onclick="investorPortal.showProvideLiquidityModal('${pool.assetAddress}')">
                            Provide Liquidity
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Load user's liquidity positions
     * @param {string} investorAddress - Investor's wallet address
     */
    async loadLiquidityPositions(investorAddress) {
        try {
            // This will be implemented when backend endpoints are ready
            // For now, show empty state
            this.renderLiquidityPositions([]);
        } catch (error) {
            console.error('Failed to load liquidity positions:', error);
            this.renderLiquidityPositions([]);
        }
    }

    /**
     * Render user's liquidity positions
     * @param {Array} positions - Array of liquidity position objects
     */
    renderLiquidityPositions(positions) {
        const container = document.getElementById('liquidityPositionsList');
        if (!container) return;

        if (!positions || positions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>You have no active liquidity positions</p>
                    <small>Provide liquidity to a pool to start earning returns</small>
                </div>
            `;
            return;
        }

        container.innerHTML = positions.map(position => {
            const currentValue = position.lpTokenBalance * position.lpTokenPrice;
            const earnings = currentValue - position.initialInvestment;
            const earningsClass = earnings >= 0 ? 'text-success' : 'text-danger';

            return `
                <div class="list-item">
                    <div class="list-item-header">
                        <h4>${position.poolName || 'USDC Pool'}</h4>
                        <div class="position-value">
                            <span class="current-value">$${currentValue.toFixed(2)}</span>
                            <span class="${earningsClass}">
                                ${earnings >= 0 ? '+' : ''}$${earnings.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <div class="list-item-content">
                        <div class="list-item-detail">
                            <label>LP Tokens</label>
                            <span>${position.lpTokenBalance.toFixed(2)}</span>
                        </div>
                        <div class="list-item-detail">
                            <label>Pool Share</label>
                            <span>${position.poolShare.toFixed(2)}%</span>
                        </div>
                        <div class="list-item-detail">
                            <label>Initial Investment</label>
                            <span>$${position.initialInvestment.toFixed(2)}</span>
                        </div>
                        <div class="list-item-detail">
                            <label>Current APY</label>
                            <span>${position.currentAPY.toFixed(2)}%</span>
                        </div>
                        <div class="list-item-detail">
                            <label>Provided Date</label>
                            <span>${new Date(position.providedDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="position-actions">
                        <button class="btn btn-warning" onclick="investorPortal.showWithdrawLiquidityModal('${position.assetAddress}', ${position.lpTokenBalance})">
                            Withdraw Liquidity
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Show provide liquidity modal
     * @param {string} assetAddress - Asset contract address
     */
    showProvideLiquidityModal(assetAddress) {
        const modal = document.getElementById('provideLiquidityModal');
        if (!modal) return;

        // Store asset address for form submission
        modal.dataset.assetAddress = assetAddress;

        // Fetch pool details and populate modal
        this.loadPoolDetailsForModal(assetAddress);

        // Show modal
        modal.classList.add('active');

        // Set up event listeners
        this.setupProvideLiquidityModal(modal);
    }

    /**
     * Load pool details for provide liquidity modal
     * @param {string} assetAddress - Asset contract address
     */
    async loadPoolDetailsForModal(assetAddress) {
        try {
            const poolStats = await window.coffeeAPI.getPoolStatistics(assetAddress);

            if (poolStats && poolStats.success) {
                const pool = poolStats.pool;
                const summaryContainer = document.getElementById('poolDetailsSummary');

                if (summaryContainer) {
                    summaryContainer.innerHTML = `
                        <div class="pool-summary">
                            <h5>${pool.assetName || 'USDC Pool'}</h5>
                            <div class="summary-stats">
                                <div class="summary-row">
                                    <span>Current APY:</span>
                                    <span class="text-success">${(pool.currentAPY || 0).toFixed(2)}%</span>
                                </div>
                                <div class="summary-row">
                                    <span>Total Liquidity:</span>
                                    <span>$${(pool.totalLiquidity || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div class="summary-row">
                                    <span>Your Current Share:</span>
                                    <span>${(pool.userPoolShare || 0).toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Failed to load pool details:', error);
        }
    }

    /**
     * Set up provide liquidity modal event listeners
     * @param {HTMLElement} modal - Modal element
     */
    setupProvideLiquidityModal(modal) {
        // Close modal handlers
        const closeButtons = modal.querySelectorAll('.modal-close');
        closeButtons.forEach(btn => {
            btn.onclick = () => {
                modal.classList.remove('active');
            };
        });

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        };

        // Amount input handler for calculations
        const amountInput = document.getElementById('liquidityAmount');
        if (amountInput) {
            amountInput.oninput = () => {
                this.updateLiquidityCalculations(modal.dataset.assetAddress);
            };
        }

        // Form submission handler
        const form = document.getElementById('provideLiquidityForm');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                await this.handleProvideLiquidity(modal.dataset.assetAddress);
                modal.classList.remove('active');
            };
        }
    }

    /**
     * Update liquidity provision calculations
     * @param {string} assetAddress - Asset contract address
     */
    async updateLiquidityCalculations(assetAddress) {
        const amountInput = document.getElementById('liquidityAmount');
        const amount = parseFloat(amountInput?.value || 0);

        if (amount <= 0) {
            document.getElementById('lpTokensToReceive').textContent = '0.00';
            document.getElementById('yourPoolShare').textContent = '0.00%';
            document.getElementById('estimatedAnnualReturn').textContent = '$0.00';
            return;
        }

        try {
            const poolStats = await window.coffeeAPI.getPoolStatistics(assetAddress);

            if (poolStats && poolStats.success) {
                const pool = poolStats.pool;

                // Calculate LP tokens (simplified - actual calculation in backend)
                const totalLiquidity = pool.totalLiquidity || 0;
                const totalLPTokens = pool.totalLPTokens || 0;
                const lpTokens = totalLiquidity === 0 ? amount : (amount / totalLiquidity) * totalLPTokens;

                // Calculate pool share
                const newTotalLPTokens = totalLPTokens + lpTokens;
                const poolShare = (lpTokens / newTotalLPTokens) * 100;

                // Calculate estimated annual return
                const apy = pool.currentAPY || 0;
                const annualReturn = amount * (apy / 100);

                // Update UI
                document.getElementById('lpTokensToReceive').textContent = lpTokens.toFixed(2);
                document.getElementById('yourPoolShare').textContent = poolShare.toFixed(2) + '%';
                document.getElementById('estimatedAnnualReturn').textContent = '$' + annualReturn.toFixed(2);
            }
        } catch (error) {
            console.error('Failed to calculate liquidity:', error);
        }
    }

    /**
     * Handle provide liquidity form submission
     * @param {string} assetAddress - Asset contract address
     */
    async handleProvideLiquidity(assetAddress) {
        const amountInput = document.getElementById('liquidityAmount');
        const amount = parseFloat(amountInput?.value || 0);

        if (amount <= 0) {
            window.walletManager.showToast('Please enter a valid amount', 'error');
            return;
        }

        try {
            window.walletManager.showLoading('Providing liquidity...');

            const result = await window.coffeeAPI.provideLiquidity(assetAddress, amount);

            if (result && result.success) {
                window.walletManager.showToast(
                    `Successfully provided ${amount} USDC liquidity!`,
                    'success'
                );

                // Refresh balances after transaction within 5 seconds
                if (window.balancePoller && result.transactionHash) {
                    await window.balancePoller.refreshAfterTransaction(result.transactionHash, ['usdc', 'lp']);
                }

                // Refresh lending pools and positions
                const investorAddress = window.walletManager.getAccountId();
                await this.loadLendingPools(investorAddress);

                // Reset form
                amountInput.value = '';
            } else {
                throw new Error(result?.error || 'Failed to provide liquidity');
            }
        } catch (error) {
            console.error('Failed to provide liquidity:', error);
            window.walletManager.showToast(
                `Failed to provide liquidity: ${error.message}`,
                'error'
            );
        } finally {
            window.walletManager.hideLoading();
        }
    }

    /**
     * Show withdraw liquidity modal
     * @param {string} assetAddress - Asset contract address
     * @param {number} maxLPTokens - Maximum LP tokens available
     */
    showWithdrawLiquidityModal(assetAddress, maxLPTokens) {
        const modal = document.getElementById('withdrawLiquidityModal');
        if (!modal) return;

        // Store asset address and max tokens for form submission
        modal.dataset.assetAddress = assetAddress;
        modal.dataset.maxLPTokens = maxLPTokens;

        // Update help text
        const helpText = document.getElementById('lpTokenAmountHelp');
        if (helpText) {
            helpText.textContent = `Available: ${maxLPTokens.toFixed(2)} LP tokens`;
        }

        // Fetch withdrawal details and populate modal
        this.loadWithdrawalDetailsForModal(assetAddress);

        // Show modal
        modal.classList.add('active');

        // Set up event listeners
        this.setupWithdrawLiquidityModal(modal);
    }

    /**
     * Load withdrawal details for withdraw liquidity modal
     * @param {string} assetAddress - Asset contract address
     */
    async loadWithdrawalDetailsForModal(assetAddress) {
        try {
            const poolStats = await window.coffeeAPI.getPoolStatistics(assetAddress);

            if (poolStats && poolStats.success) {
                const pool = poolStats.pool;
                const summaryContainer = document.getElementById('withdrawalDetailsSummary');

                if (summaryContainer) {
                    summaryContainer.innerHTML = `
                        <div class="withdrawal-summary">
                            <h5>${pool.assetName || 'USDC Pool'}</h5>
                            <div class="summary-stats">
                                <div class="summary-row">
                                    <span>Your LP Tokens:</span>
                                    <span>${(pool.userLPBalance || 0).toFixed(2)}</span>
                                </div>
                                <div class="summary-row">
                                    <span>Your Pool Share:</span>
                                    <span>${(pool.userPoolShare || 0).toFixed(2)}%</span>
                                </div>
                                <div class="summary-row">
                                    <span>Current APY:</span>
                                    <span class="text-success">${(pool.currentAPY || 0).toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Failed to load withdrawal details:', error);
        }
    }

    /**
     * Set up withdraw liquidity modal event listeners
     * @param {HTMLElement} modal - Modal element
     */
    setupWithdrawLiquidityModal(modal) {
        // Close modal handlers
        const closeButtons = modal.querySelectorAll('.modal-close');
        closeButtons.forEach(btn => {
            btn.onclick = () => {
                modal.classList.remove('active');
            };
        });

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        };

        // Max button handler
        const maxBtn = document.getElementById('withdrawMaxBtn');
        const lpTokenInput = document.getElementById('lpTokenAmount');
        if (maxBtn && lpTokenInput) {
            maxBtn.onclick = () => {
                lpTokenInput.value = modal.dataset.maxLPTokens;
                this.updateWithdrawalCalculations(modal.dataset.assetAddress);
            };
        }

        // Amount input handler for calculations
        if (lpTokenInput) {
            lpTokenInput.oninput = () => {
                this.updateWithdrawalCalculations(modal.dataset.assetAddress);
            };
        }

        // Form submission handler
        const form = document.getElementById('withdrawLiquidityForm');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                await this.handleWithdrawLiquidity(modal.dataset.assetAddress);
                modal.classList.remove('active');
            };
        }
    }

    /**
     * Update withdrawal calculations
     * @param {string} assetAddress - Asset contract address
     */
    async updateWithdrawalCalculations(assetAddress) {
        const lpTokenInput = document.getElementById('lpTokenAmount');
        const lpTokenAmount = parseFloat(lpTokenInput?.value || 0);

        if (lpTokenAmount <= 0) {
            document.getElementById('usdcToReceive').textContent = '$0.00';
            document.getElementById('accruedRewards').textContent = '$0.00';
            document.getElementById('totalWithdrawalAmount').textContent = '$0.00';
            return;
        }

        try {
            const poolStats = await window.coffeeAPI.getPoolStatistics(assetAddress);

            if (poolStats && poolStats.success) {
                const pool = poolStats.pool;

                // Calculate USDC to receive (simplified - actual calculation in backend)
                const totalLiquidity = pool.totalLiquidity || 0;
                const totalLPTokens = pool.totalLPTokens || 0;
                const usdcAmount = totalLPTokens === 0 ? 0 : (lpTokenAmount / totalLPTokens) * totalLiquidity;

                // Calculate accrued rewards (placeholder - actual calculation in backend)
                const rewards = usdcAmount * 0.02; // Assume 2% rewards for demo

                // Calculate total
                const total = usdcAmount + rewards;

                // Update UI
                document.getElementById('usdcToReceive').textContent = '$' + usdcAmount.toFixed(2);
                document.getElementById('accruedRewards').textContent = '$' + rewards.toFixed(2);
                document.getElementById('totalWithdrawalAmount').textContent = '$' + total.toFixed(2);
            }
        } catch (error) {
            console.error('Failed to calculate withdrawal:', error);
        }
    }

    /**
     * Handle withdraw liquidity form submission
     * @param {string} assetAddress - Asset contract address
     */
    async handleWithdrawLiquidity(assetAddress) {
        const lpTokenInput = document.getElementById('lpTokenAmount');
        const lpTokenAmount = parseFloat(lpTokenInput?.value || 0);

        if (lpTokenAmount <= 0) {
            window.walletManager.showToast('Please enter a valid amount', 'error');
            return;
        }

        try {
            window.walletManager.showLoading('Withdrawing liquidity...');

            const result = await window.coffeeAPI.withdrawLiquidity(assetAddress, lpTokenAmount);

            if (result && result.success) {
                window.walletManager.showToast(
                    `Successfully withdrew liquidity! Received ${result.usdcAmount} USDC`,
                    'success'
                );

                // Refresh balances after transaction within 5 seconds
                if (window.balancePoller && result.transactionHash) {
                    await window.balancePoller.refreshAfterTransaction(result.transactionHash, ['usdc', 'lp']);
                }

                // Refresh lending pools and positions
                const investorAddress = window.walletManager.getAccountId();
                await this.loadLendingPools(investorAddress);

                // Reset form
                lpTokenInput.value = '';
            } else {
                throw new Error(result?.error || 'Failed to withdraw liquidity');
            }
        } catch (error) {
            console.error('Failed to withdraw liquidity:', error);
            window.walletManager.showToast(
                `Failed to withdraw liquidity: ${error.message}`,
                'error'
            );
        } finally {
            window.walletManager.hideLoading();
        }
    }

    // ========================================================================
    // Loan Management Methods
    // ========================================================================

    /**
     * Load loan data and update UI
     * @param {string} investorAddress - Investor's wallet address
     */
    async loadLoanData(investorAddress) {
        try {
            // Get portfolio value for collateral calculation
            const portfolioResponse = await window.coffeeAPI.getPortfolio(investorAddress);

            if (portfolioResponse && portfolioResponse.success) {
                const portfolio = portfolioResponse.portfolio;
                const holdingsValue = portfolio.currentValue || 0;

                // Calculate max loan amount (holdings value / 1.25)
                const maxLoanAmount = holdingsValue / 1.25;

                // Update loan availability UI
                document.getElementById('holdingsValue').textContent = `$${holdingsValue.toFixed(2)}`;
                document.getElementById('maxLoanAmount').textContent = `$${maxLoanAmount.toFixed(2)}`;

                // Enable/disable take loan button based on holdings
                const takeLoanBtn = document.getElementById('takeLoanBtn');
                if (takeLoanBtn) {
                    if (holdingsValue > 0) {
                        takeLoanBtn.disabled = false;
                        takeLoanBtn.onclick = () => this.showTakeLoanModal();
                    } else {
                        takeLoanBtn.disabled = true;
                    }
                }
            }

            // Check for active loan
            await this.loadActiveLoan(investorAddress);

        } catch (error) {
            console.error('Failed to load loan data:', error);
        }
    }

    /**
     * Load active loan details
     * @param {string} investorAddress - Investor's wallet address
     */
    async loadActiveLoan(investorAddress) {
        try {
            // Get loan details from API
            const loanResponse = await window.coffeeAPI.getLoanDetails(investorAddress, 'USDC');

            if (loanResponse && loanResponse.success && loanResponse.loan) {
                const loan = loanResponse.loan;

                // Show active loan container
                const activeLoanContainer = document.getElementById('activeLoanContainer');
                if (activeLoanContainer) {
                    activeLoanContainer.style.display = 'block';
                }

                // Render active loan details
                this.renderActiveLoan(loan);

                // Hide take loan button
                const takeLoanBtn = document.getElementById('takeLoanBtn');
                if (takeLoanBtn) {
                    takeLoanBtn.disabled = true;
                    takeLoanBtn.textContent = 'Active Loan Exists';
                }
            } else {
                // No active loan, hide container
                const activeLoanContainer = document.getElementById('activeLoanContainer');
                if (activeLoanContainer) {
                    activeLoanContainer.style.display = 'none';
                }
            }
        } catch (error) {
            // "No active loan found" is not an error, it's expected
            if (error.message && error.message.includes('No active loan')) {
                console.log('[InvestorPortal] No active loan - this is normal');
                // Hide active loan container
                const activeLoanContainer = document.getElementById('activeLoanContainer');
                if (activeLoanContainer) {
                    activeLoanContainer.style.display = 'none';
                }
            } else {
                console.error('[InvestorPortal] Failed to load active loan:', error);
            }
        }
    }

    /**
     * Show take loan modal
     */
    showTakeLoanModal() {
        const modal = document.getElementById('takeLoanModal');
        if (!modal) return;

        // Get holdings value
        const holdingsValue = parseFloat(document.getElementById('holdingsValue').textContent.replace('$', '').replace(',', '')) || 0;
        const maxLoanAmount = holdingsValue / 1.25;

        // Update modal values
        document.getElementById('modalHoldingsValue').textContent = `$${holdingsValue.toFixed(2)}`;
        document.getElementById('modalMaxLoanAmount').textContent = `$${maxLoanAmount.toFixed(2)}`;
        document.getElementById('loanAmountHelp').textContent = `Max available: $${maxLoanAmount.toFixed(2)}`;

        // Show modal
        modal.classList.add('active');

        // Set up event listeners
        this.setupTakeLoanModal(modal, maxLoanAmount);
    }

    /**
     * Set up take loan modal event listeners
     * @param {HTMLElement} modal - Modal element
     * @param {number} maxLoanAmount - Maximum loan amount available
     */
    setupTakeLoanModal(modal, maxLoanAmount) {
        // Close modal handlers
        const closeButtons = modal.querySelectorAll('.modal-close');
        closeButtons.forEach(btn => {
            btn.onclick = () => {
                modal.classList.remove('active');
            };
        });

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        };

        // Max button handler
        const loanMaxBtn = document.getElementById('loanMaxBtn');
        const loanAmountInput = document.getElementById('loanAmount');

        if (loanMaxBtn && loanAmountInput) {
            loanMaxBtn.onclick = () => {
                loanAmountInput.value = maxLoanAmount.toFixed(2);
                this.updateLoanCalculations(maxLoanAmount);
            };
        }

        // Loan amount input handler
        if (loanAmountInput) {
            loanAmountInput.oninput = () => {
                const loanAmount = parseFloat(loanAmountInput.value) || 0;
                this.updateLoanCalculations(loanAmount);
            };
        }

        // Form submission handler
        const form = document.getElementById('takeLoanForm');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                await this.handleTakeLoan();
                modal.classList.remove('active');
            };
        }
    }

    /**
     * Update loan calculations in the modal
     * @param {number} loanAmount - Loan amount entered by user
     */
    updateLoanCalculations(loanAmount) {
        // Assume token price of $25 for calculation (should be fetched from API)
        const tokenPrice = 25;

        // Calculate collateral required (125% of loan amount)
        const collateralValue = loanAmount * 1.25;
        const collateralTokens = collateralValue / tokenPrice;

        // Calculate liquidation price (90% threshold)
        const liquidationPrice = loanAmount / (collateralTokens * 0.90);

        // Calculate repayment amount (110% of loan)
        const repaymentAmount = loanAmount * 1.10;

        // Calculate interest (10% of loan)
        const interestAmount = loanAmount * 0.10;

        // Update UI
        document.getElementById('collateralRequired').textContent = `${collateralTokens.toFixed(2)} tokens`;
        document.getElementById('liquidationPrice').textContent = `$${liquidationPrice.toFixed(2)}`;
        document.getElementById('repaymentAmount').textContent = `$${repaymentAmount.toFixed(2)}`;
        document.getElementById('interestAmount').textContent = `$${interestAmount.toFixed(2)}`;
    }

    /**
     * Handle take loan form submission
     */
    async handleTakeLoan() {
        const loanAmountInput = document.getElementById('loanAmount');
        const loanAmount = parseFloat(loanAmountInput?.value || 0);

        if (loanAmount <= 0) {
            window.walletManager.showToast('Please enter a valid loan amount', 'error');
            return;
        }

        const maxLoanAmount = parseFloat(document.getElementById('modalMaxLoanAmount').textContent.replace('$', '').replace(',', '')) || 0;

        if (loanAmount > maxLoanAmount) {
            window.walletManager.showToast('Loan amount exceeds maximum available', 'error');
            return;
        }

        try {
            window.walletManager.showLoading('Processing loan...');

            const result = await window.coffeeAPI.takeOutLoan('USDC', loanAmount);

            if (result && result.success) {
                window.walletManager.showToast(
                    `Loan approved! ${loanAmount} USDC transferred to your wallet`,
                    'success'
                );

                // Refresh balances after transaction within 5 seconds
                if (window.balancePoller && result.transactionHash) {
                    await window.balancePoller.refreshAfterTransaction(result.transactionHash, ['usdc', 'token']);
                }

                // Refresh loan data
                const investorAddress = window.walletManager.getAccountId();
                await this.loadLoanData(investorAddress);

                // Reset form
                loanAmountInput.value = '';
            } else {
                throw new Error(result?.error || 'Failed to process loan');
            }
        } catch (error) {
            console.error('Failed to take loan:', error);
            window.walletManager.showToast(
                `Failed to process loan: ${error.message}`,
                'error'
            );
        } finally {
            window.walletManager.hideLoading();
        }
    }

    /**
     * Render active loan details
     * @param {Object} loan - Loan details object
     */
    renderActiveLoan(loan) {
        const container = document.getElementById('activeLoanCard');
        if (!container) return;

        // Store loan data for repayment
        this.activeLoan = loan;

        // Calculate health factor
        const healthFactor = loan.healthFactor || 1.0;
        const healthClass = healthFactor >= 1.5 ? 'text-success' : healthFactor >= 1.2 ? 'text-warning' : 'text-danger';
        const healthStatus = healthFactor >= 1.5 ? 'Healthy' : healthFactor >= 1.2 ? 'Monitor' : 'At Risk';
        const healthBarWidth = Math.min(healthFactor * 50, 100); // Scale to 100% max

        // Determine if warning should be shown
        const showWarning = healthFactor < 1.2;
        const showCritical = healthFactor < 1.1;

        // Generate warning message
        let warningMessage = '';
        if (showCritical) {
            warningMessage = `
                <div class="loan-alert loan-alert-danger">
                    <strong>🚨 CRITICAL: Liquidation Risk!</strong>
                    <p>Your loan health factor is critically low (${healthFactor.toFixed(2)}). Your collateral may be liquidated soon. Please repay your loan or add more collateral immediately.</p>
                </div>
            `;
        } else if (showWarning) {
            warningMessage = `
                <div class="loan-alert loan-alert-warning">
                    <strong>⚠️ Warning: Low Health Factor</strong>
                    <p>Your loan health factor is below 1.2 (${healthFactor.toFixed(2)}). Consider repaying your loan or monitoring the collateral value closely to avoid liquidation.</p>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="loan-details">
                <div class="loan-header">
                    <h5>Loan Details</h5>
                    <div class="loan-status ${healthClass}">
                        <span class="status-indicator"></span>
                        ${healthStatus}
                    </div>
                </div>
                
                ${warningMessage}
                
                <div class="loan-health-monitor">
                    <div class="health-header">
                        <label>Loan Health Factor</label>
                        <span class="health-value ${healthClass}">${healthFactor.toFixed(2)}</span>
                    </div>
                    <div class="health-bar-container">
                        <div class="health-bar ${healthClass}" style="width: ${healthBarWidth}%"></div>
                    </div>
                    <div class="health-legend">
                        <span class="legend-item">
                            <span class="legend-dot text-danger"></span>
                            <small>&lt; 1.1 Critical</small>
                        </span>
                        <span class="legend-item">
                            <span class="legend-dot text-warning"></span>
                            <small>1.1 - 1.2 Warning</small>
                        </span>
                        <span class="legend-item">
                            <span class="legend-dot text-success"></span>
                            <small>&gt; 1.5 Healthy</small>
                        </span>
                    </div>
                </div>
                
                <div class="loan-stats-grid">
                    <div class="loan-stat">
                        <label>Loan Amount</label>
                        <span class="value">$${(loan.loanAmountUSDC || 0).toFixed(2)}</span>
                    </div>
                    <div class="loan-stat">
                        <label>Collateral Locked</label>
                        <span class="value">${(loan.collateralAmount || 0).toFixed(2)} tokens</span>
                    </div>
                    <div class="loan-stat">
                        <label>Repayment Amount</label>
                        <span class="value text-primary">$${(loan.repaymentAmount || 0).toFixed(2)}</span>
                    </div>
                    <div class="loan-stat">
                        <label>Liquidation Price</label>
                        <span class="value text-warning">$${(loan.liquidationPrice || 0).toFixed(2)}</span>
                    </div>
                    <div class="loan-stat">
                        <label>Current Token Price</label>
                        <span class="value">$${(loan.currentTokenPrice || 25).toFixed(2)}</span>
                    </div>
                    <div class="loan-stat">
                        <label>Loan Date</label>
                        <span class="value">${new Date(loan.loanDate).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div class="loan-actions">
                    <button class="btn btn-primary" onclick="investorPortal.showRepayLoanModal()">
                        Repay Loan
                    </button>
                </div>
            </div>
        `;

        // Show toast notification for critical health
        if (showCritical) {
            window.walletManager.showToast(
                'CRITICAL: Your loan is at risk of liquidation!',
                'error'
            );
            
            // Show persistent notification
            if (window.notificationManager) {
                window.notificationManager.error(
                    'Your loan health factor is critically low. Your collateral may be liquidated soon. Please repay your loan or add more collateral immediately.',
                    {
                        title: '🚨 Liquidation Risk',
                        autoDismiss: false,
                        action: () => {
                            this.showRepayLoanModal();
                        },
                        actionLabel: 'Repay Loan'
                    }
                );
            }
        } else if (showWarning) {
            window.walletManager.showToast(
                'Warning: Your loan health factor is low',
                'warning'
            );
            
            // Show notification with action
            if (window.notificationManager) {
                window.notificationManager.warning(
                    `Your loan health factor is ${healthFactor.toFixed(2)}. Consider adding collateral to avoid liquidation.`,
                    {
                        title: 'Loan Health Warning',
                        autoDismiss: false,
                        action: () => {
                            this.showRepayLoanModal();
                        },
                        actionLabel: 'Manage Loan'
                    }
                );
            }
        }
    }

    /**
     * Show repay loan modal
     */
    showRepayLoanModal() {
        const modal = document.getElementById('repayLoanModal');
        if (!modal || !this.activeLoan) return;

        const loan = this.activeLoan;

        // Update modal values
        document.getElementById('modalLoanAmount').textContent = `$${(loan.loanAmountUSDC || 0).toFixed(2)}`;
        document.getElementById('modalInterest').textContent = `$${((loan.loanAmountUSDC || 0) * 0.10).toFixed(2)}`;
        document.getElementById('modalTotalRepayment').textContent = `$${(loan.repaymentAmount || 0).toFixed(2)}`;
        document.getElementById('modalCollateralUnlock').textContent = `${(loan.collateralAmount || 0).toFixed(2)} tokens`;

        // Show modal
        modal.classList.add('active');

        // Set up event listeners
        this.setupRepayLoanModal(modal);
    }

    /**
     * Set up repay loan modal event listeners
     * @param {HTMLElement} modal - Modal element
     */
    setupRepayLoanModal(modal) {
        // Close modal handlers
        const closeButtons = modal.querySelectorAll('.modal-close');
        closeButtons.forEach(btn => {
            btn.onclick = () => {
                modal.classList.remove('active');
            };
        });

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        };

        // Confirm repayment button handler
        const confirmBtn = document.getElementById('confirmRepayBtn');
        if (confirmBtn) {
            confirmBtn.onclick = async () => {
                await this.handleRepayLoan();
                modal.classList.remove('active');
            };
        }
    }

    /**
     * Handle loan repayment
     */
    async handleRepayLoan() {
        if (!this.activeLoan) {
            window.walletManager.showToast('No active loan found', 'error');
            return;
        }

        try {
            window.walletManager.showLoading('Processing loan repayment...');

            const result = await window.coffeeAPI.repayLoan('USDC');

            if (result && result.success) {
                window.walletManager.showToast(
                    `Loan repaid successfully! ${this.activeLoan.collateralAmount} tokens unlocked`,
                    'success'
                );

                // Refresh balances after transaction within 5 seconds
                if (window.balancePoller && result.transactionHash) {
                    await window.balancePoller.refreshAfterTransaction(result.transactionHash, ['usdc', 'token']);
                }

                // Clear active loan
                this.activeLoan = null;

                // Refresh loan data
                const investorAddress = window.walletManager.getAccountId();
                await this.loadLoanData(investorAddress);
            } else {
                throw new Error(result?.error || 'Failed to repay loan');
            }
        } catch (error) {
            console.error('Failed to repay loan:', error);
            window.walletManager.showToast(
                `Failed to repay loan: ${error.message}`,
                'error'
            );
        } finally {
            window.walletManager.hideLoading();
        }
    }

    // Transaction History Methods
    async loadTransactionHistory(investorAddress) {
        window.walletManager.showLoading('Loading transaction history...');

        try {
            // Initialize transaction history manager if not already done
            if (!window.transactionHistoryManager) {
                const { default: TransactionHistoryManager } = await import('./transaction-history.js');
                window.transactionHistoryManager = new TransactionHistoryManager(window.coffeeAPI);
            }

            // Fetch transaction history
            await window.transactionHistoryManager.fetchTransactionHistory(investorAddress);

            // Render transaction history
            this.renderTransactionHistory();

            // Setup filter event listener
            this.setupTransactionFilters();

            window.walletManager.hideLoading();
        } catch (error) {
            console.error('Failed to load transaction history:', error);
            window.walletManager.hideLoading();
            window.walletManager.showToast('Failed to load transaction history', 'error');
        }
    }

    renderTransactionHistory() {
        const manager = window.transactionHistoryManager;
        if (!manager) return;

        // Get paginated transactions
        const { transactions, totalPages, currentPage, totalTransactions } = manager.getPaginatedTransactions();

        // Update statistics
        const stats = manager.getStatistics();
        document.getElementById('totalTransactions').textContent = stats.total;
        document.getElementById('totalVolume').textContent = `$${(stats.totalVolume / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('completedTransactions').textContent = stats.byStatus.completed || 0;
        document.getElementById('pendingTransactions').textContent = stats.byStatus.pending || 0;

        // Render transactions list
        const listContainer = document.getElementById('transactionsList');
        
        if (transactions.length === 0) {
            listContainer.innerHTML = '<div class="empty-state"><p>No transactions found</p></div>';
            return;
        }

        listContainer.innerHTML = transactions.map(tx => {
            const typeInfo = manager.getTransactionTypeInfo(tx.type);
            const statusInfo = manager.getTransactionStatusInfo(tx.status);
            
            return `
                <div class="transaction-item" data-tx-id="${tx.id}">
                    <div class="transaction-main">
                        <div class="transaction-icon" style="background-color: ${typeInfo.color}20;">
                            <span style="font-size: 1.5rem;">${typeInfo.icon}</span>
                        </div>
                        <div class="transaction-details">
                            <div class="transaction-type" style="color: ${typeInfo.color};">
                                ${typeInfo.label}
                            </div>
                            <div class="transaction-meta">
                                <span>${manager.formatTimestamp(tx.timestamp)}</span>
                                ${tx.transactionHash && tx.blockExplorerUrl ? `
                                    <a href="${tx.blockExplorerUrl}" target="_blank" class="transaction-hash">
                                        View on Explorer →
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="transaction-amount">
                        <div class="transaction-amount-value">
                            ${manager.formatAmount(tx.amount, tx.asset)}
                        </div>
                        <span class="transaction-status ${tx.status}">
                            ${statusInfo.icon} ${statusInfo.label}
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        // Render pagination
        this.renderTransactionPagination(totalPages, currentPage, totalTransactions);
    }

    renderTransactionPagination(totalPages, currentPage, totalTransactions) {
        const paginationContainer = document.getElementById('transactionsPagination');
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }

        paginationContainer.innerHTML = `
            <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
                ← Previous
            </button>
            ${pages.map(page => {
                if (page === '...') {
                    return '<span class="pagination-info">...</span>';
                }
                return `
                    <button class="pagination-btn ${page === currentPage ? 'active' : ''}" data-page="${page}">
                        ${page}
                    </button>
                `;
            }).join('')}
            <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
                Next →
            </button>
        `;

        // Add pagination click handlers
        paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                if (!isNaN(page)) {
                    window.transactionHistoryManager.getPaginatedTransactions(page);
                    this.renderTransactionHistory();
                }
            });
        });
    }

    setupTransactionFilters() {
        const filterSelect = document.getElementById('transactionTypeFilter');
        const exportBtn = document.getElementById('exportTransactionsBtn');

        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                window.transactionHistoryManager.applyFilter(e.target.value);
                this.renderTransactionHistory();
            });
        }

}
}

// Create global investor portal instance
window.investorPortal = new InvestorPortal();
