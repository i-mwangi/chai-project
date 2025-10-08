/**
 * API Client for Coffee Tree Platform
 * Handles all communication with the backend API
 */

class CoffeeTreeAPI {
    constructor(baseURL = 'http://localhost:3002') {  // Changed from 3001 to 3002 to match server
        this.baseURL = baseURL;
    }

    // Utility method for making HTTP requests
    async request(endpoint, options = {}) {
        // Helper to add a timeout to fetch requests
        const fetchWithTimeout = (url, cfg, timeout = 60000) => { // Increased from 30000 to 60000 ms (1 minute)
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    reject(new Error('Request timed out'))
                }, timeout)

                fetch(url, cfg).then(res => {
                    clearTimeout(timer)
                    resolve(res)
                }).catch(err => {
                    clearTimeout(timer)
                    reject(err)
                })
            })
        }

        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // If user has chosen demo bypass on the frontend, forward a demo header
        try {
            if (localStorage.getItem('skipFarmerVerification') === 'true') {
                config.headers['x-demo-bypass'] = 'true'
                // Also include in body for servers that don't inspect headers
                if (config.body && typeof config.body === 'string') {
                    try {
                        const parsed = JSON.parse(config.body)
                        parsed.demoBypass = true
                        config.body = JSON.stringify(parsed)
                    } catch (e) {
                        // ignore
                    }
                } else if (config.body && typeof config.body === 'object') {
                    config.body.demoBypass = true
                }
            }
        } catch (e) {
            // ignore localStorage errors
        }

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetchWithTimeout(url, config, 60000); // Increased from 30000 to 60000 ms (1 minute)
            const data = await response.json();

            if (!response.ok) {
                const message = data?.error || data?.message || `HTTP error! status: ${response.status}`;
                const err = new Error(message);
                err.status = response.status
                throw err;
            }

            return data;
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            // Re-throw with a clearer message for UI to display
            throw new Error(error?.message || String(error));
        }
    }

    // Farmer Verification API
    async submitVerificationDocuments(farmerAddress, documents) {
        return this.request('/api/farmer-verification/submit-documents', {
            method: 'POST',
            body: {
                farmerAddress,
                documents
            }
        });
    }

    async getVerificationStatus(farmerAddress) {
        const resp = await this.request(`/api/farmer-verification/status/${farmerAddress}`);
        return { ...resp, verification: resp.data || resp.verification || null };
    }

    async getInvestorVerificationStatus(investorAddress) {
        const resp = await this.request(`/api/investor-verification/status/${investorAddress}`);
        return { ...resp, verification: resp.data || resp.verification || null };
    }

    async submitInvestorVerificationDocuments(investorAddress, documents) {
        return this.request('/api/investor-verification/submit-documents', {
            method: 'POST',
            body: {
                investorAddress,
                documents
            }
        });
    }

    async registerGroveOwnership(farmerAddress, groveName, ownershipProof) {
        // Legacy name kept for compatibility; prefer `/api/groves/register` from UI
        return this.request('/api/farmer-verification/register-grove', {
            method: 'POST',
            body: {
                farmerAddress,
                groveName,
                ownershipProof
            }
        });
    }

    async getPendingVerifications() {
        return this.request('/api/farmer-verification/pending');
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        return fetch(`${this.baseURL}/api/farmer-verification/upload`, {
            method: 'POST',
            body: formData
        }).then(response => response.json());
    }

    // Harvest Reporting API
    async reportHarvest(harvestData) {
        return this.request('/api/harvest/report', {
            method: 'POST',
            body: harvestData
        });
    }

    async getHarvestHistory(farmerAddress) {
        return this.request(`/api/harvest/history?farmerAddress=${farmerAddress}`);
    }

    async getPendingHarvests() {
        return this.request('/api/harvest/pending');
    }

    async getHarvestStats(farmerAddress) {
        return this.request(`/api/harvest/stats?farmerAddress=${farmerAddress}`);
    }

    async calculateDistribution(harvestId) {
        return this.request('/api/harvest/calculate-distribution', {
            method: 'POST',
            body: { harvestId }
        });
    }

    async recordDistribution(distributionData) {
        return this.request('/api/harvest/record-distribution', {
            method: 'POST',
            body: distributionData
        });
    }

    async getPendingDistributions() {
        return this.request('/api/harvest/pending-distributions');
    }

    async getHolderEarnings(holderAddress) {
        return this.request(`/api/harvest/holder/${holderAddress}/earnings`);
    }

    async getDistributionSummary(harvestId) {
        return this.request(`/api/harvest/${harvestId}/distribution-summary`);
    }

    async getHarvestEarnings(harvestId) {
        return this.request(`/api/harvest/${harvestId}/earnings`);
    }

    // Market Data API
    async getCurrentPrices() {
        return this.request('/api/market/prices');
    }

    async getPriceHistory(days = 30) {
        return this.request(`/api/market/price-history?days=${days}`);
    }

    async getMarketConditions() {
        return this.request('/api/market/conditions');
    }

    async validatePrice(coffeeGrade, price) {
        return this.request('/api/market/validate-price', {
            method: 'POST',
            body: { coffeeGrade, price }
        });
    }

    async getMarketAlerts(farmerAddress) {
        return this.request(`/api/market/alerts/${farmerAddress}`);
    }

    async acknowledgeAlert(alertId) {
        return this.request(`/api/market/alerts/${alertId}/acknowledge`, {
            method: 'POST'
        });
    }

    async updateNotificationPreferences(farmerAddress, preferences) {
        return this.request(`/api/market/preferences/${farmerAddress}`, {
            method: 'PUT',
            body: preferences
        });
    }

    async triggerPriceUpdate() {
        return this.request('/api/market/update-prices', {
            method: 'POST'
        });
    }

    async getMarketOverview() {
        return this.request('/api/market/overview');
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }

    // Grove management methods
    async getGroves(farmerAddress) {
        return this.request(`/api/groves?farmerAddress=${farmerAddress}`);
    }

    async registerGrove(groveData) {
        // The server exposes grove registration under the farmer-verification
        // namespace; send to that endpoint to avoid 404s.
        return this.request('/api/farmer-verification/register-grove', {
            method: 'POST',
            body: groveData
        });
    }

    async updateTreeHealth(groveId, healthData) {
        try {
            const body = {
                groveId,
                healthData
            };

            const resp = await this.request('/api/tree-monitoring/sensor-data', {
                method: 'POST',
                body
            });

            return resp;
        } catch (err) {
            console.error('Failed to update tree health:', err);
            return { success: false, error: err?.message || String(err) };
        }
    }

    async getAvailableGroves() {
        return this.request('/api/investment/available-groves');
    }

    async purchaseTokens(groveId, tokenAmount, investorAddress) {
        return this.request('/api/investment/purchase-tokens', {
            method: 'POST',
            body: { groveId, tokenAmount, investorAddress }
        });
    }

    async getPortfolio(investorAddress) {
        return this.request(`/api/investment/portfolio?investorAddress=${investorAddress}`);
    }

    // Marketplace API methods
    async getMarketplaceListings() {
        return this.request('/api/marketplace/listings');
    }

    async listTokensForSale(groveId, tokenAmount, pricePerToken, durationDays, sellerAddress) {
        return this.request('/api/marketplace/list-tokens', {
            method: 'POST',
            body: {
                groveId,
                tokenAmount,
                pricePerToken,
                durationDays,
                sellerAddress
            }
        });
    }

    async purchaseFromMarketplace(listingId, tokenAmount, buyerAddress) {
        return this.request('/api/marketplace/purchase', {
            method: 'POST',
            body: {
                listingId,
                tokenAmount,
                buyerAddress
            }
        });
    }

    async cancelListing(listingId, sellerAddress) {
        return this.request('/api/marketplace/cancel-listing', {
            method: 'POST',
            body: {
                listingId,
                sellerAddress
            }
        });
    }

    async updateListing(listingId, newPrice, newDuration, sellerAddress) {
        return this.request('/api/marketplace/update-listing', {
            method: 'POST',
            body: {
                listingId,
                newPrice,
                newDuration,
                sellerAddress
            }
        });
    }

    async getTradeHistory(userAddress = null) {
        const endpoint = userAddress 
            ? `/api/marketplace/trades?userAddress=${userAddress}`
            : '/api/marketplace/trades';
        return this.request(endpoint);
    }

    async getMarketplaceStats() {
        return this.request('/api/marketplace/stats');
    }

    async getUserListings(sellerAddress) {
        return this.request(`/api/marketplace/user-listings?sellerAddress=${sellerAddress}`);
    }

    async getHolderEarnings(holderAddress) {
        return this.request(`/api/earnings/holder?holderAddress=${holderAddress}`);
    }

    // Revenue Distribution API
    async createDistribution(harvestId, totalRevenue) {
        return this.request('/api/revenue/create-distribution', {
            method: 'POST',
            body: { harvestId, totalRevenue }
        });
    }

    async getDistributionHistory(holderAddress) {
        return this.request(`/api/revenue/distribution-history?holderAddress=${holderAddress}`);
    }

    async getPendingDistributions(holderAddress) {
        return this.request(`/api/revenue/pending-distributions?holderAddress=${holderAddress}`);
    }

    async claimEarnings(distributionId, holderAddress) {
        return this.request('/api/revenue/claim-earnings', {
            method: 'POST',
            body: { distributionId, holderAddress }
        });
    }

    async getFarmerBalance(farmerAddress) {
        return this.request(`/api/revenue/farmer-balance?farmerAddress=${farmerAddress}`);
    }

    async withdrawFarmerShare(groveId, amount, farmerAddress) {
        return this.request('/api/revenue/withdraw-farmer-share', {
            method: 'POST',
            body: { groveId, amount, farmerAddress }
        });
    }

    async getFarmerWithdrawalHistory(farmerAddress) {
        return this.request(`/api/revenue/withdrawal-history?farmerAddress=${farmerAddress}`);
    }

    // User settings (per-account key/value store)
    async saveUserSettings(accountId, settings) {
        return this.request(`/api/user/settings/${accountId}`, {
            method: 'PUT',
            body: settings
        });
    }

    async getUserSettings(accountId) {
        return this.request(`/api/user/settings/${accountId}`);
    }

    // Lending Pool API - Liquidity Provision
    async getLendingPools() {
        return this.request('/api/lending/pools');
    }

    async provideLiquidity(assetAddress, amount) {
        return this.request('/api/lending/provide-liquidity', {
            method: 'POST',
            body: { assetAddress, amount }
        });
    }

    async withdrawLiquidity(assetAddress, lpTokenAmount) {
        return this.request('/api/lending/withdraw-liquidity', {
            method: 'POST',
            body: { assetAddress, lpTokenAmount }
        });
    }

    async getPoolStatistics(assetAddress) {
        return this.request(`/api/lending/pool-stats?assetAddress=${assetAddress}`);
    }

    // Lending Pool API - Loan Management
    async calculateLoanTerms(assetAddress, loanAmount) {
        return this.request('/api/lending/calculate-loan-terms', {
            method: 'POST',
            body: { assetAddress, loanAmount }
        });
    }

    async takeOutLoan(assetAddress, loanAmount) {
        return this.request('/api/lending/take-loan', {
            method: 'POST',
            body: { assetAddress, loanAmount }
        });
    }

    async repayLoan(assetAddress) {
        return this.request('/api/lending/repay-loan', {
            method: 'POST',
            body: { assetAddress }
        });
    }

    async getLoanDetails(borrowerAddress, assetAddress) {
        return this.request(`/api/lending/loan-details?borrowerAddress=${borrowerAddress}&assetAddress=${assetAddress}`);
    }

    // Price Oracle API - Price Fetching
    async getCoffeePrices(variety, grade) {
        const params = new URLSearchParams();
        if (variety) params.append('variety', variety);
        if (grade !== undefined) params.append('grade', grade);
        return this.request(`/api/pricing/coffee-prices?${params.toString()}`);
    }

    async getSeasonalPrice(variety, grade, month) {
        return this.request('/api/pricing/seasonal-price', {
            method: 'POST',
            body: { variety, grade, month }
        });
    }

    async getAllVarietyPrices() {
        return this.request('/api/pricing/all-varieties');
    }

    async getSeasonalMultipliers() {
        return this.request('/api/pricing/seasonal-multipliers');
    }

    // Price Oracle API - Price Calculations
    async calculateProjectedRevenue(groveTokenAddress, variety, grade, yieldKg, harvestMonth) {
        return this.request('/api/pricing/projected-revenue', {
            method: 'POST',
            body: { groveTokenAddress, variety, grade, expectedYieldKg: yieldKg, harvestMonth }
        });
    }

    async validateSalePrice(variety, grade, proposedPrice) {
        return this.request('/api/pricing/validate-price', {
            method: 'POST',
            body: { variety, grade, proposedPrice }
        });
    }

    // Token Management API - Token Operations
    async mintTokens(groveId, amount) {
        return this.request('/api/admin/mint-tokens', {
            method: 'POST',
            body: { groveId, amount }
        });
    }

    async burnTokens(groveId, amount) {
        return this.request('/api/admin/burn-tokens', {
            method: 'POST',
            body: { groveId, amount }
        });
    }

    async getTokenSupply(groveId) {
        return this.request(`/api/admin/token-supply?groveId=${groveId}`);
    }

    // Token Management API - KYC Management
    async grantKYC(groveId, accountAddress) {
        return this.request('/api/admin/grant-kyc', {
            method: 'POST',
            body: { groveId, accountAddress }
        });
    }

    async revokeKYC(groveId, accountAddress) {
        return this.request('/api/admin/revoke-kyc', {
            method: 'POST',
            body: { groveId, accountAddress }
        });
    }

    async checkKYCStatus(groveId, accountAddress) {
        return this.request(`/api/admin/kyc-status?groveId=${groveId}&accountAddress=${accountAddress}`);
    }

    // Token Management API - Token Holder Management
    async getTokenHolders(groveId) {
        return this.request(`/api/admin/token-holders?groveId=${groveId}`);
    }

    async getHolderBalance(groveId, holderAddress) {
        return this.request(`/api/admin/holder-balance?groveId=${groveId}&holderAddress=${holderAddress}`);
    }

    // Balance Polling API - Additional methods for real-time updates
    async getTokenBalance(groveId, accountId) {
        return this.request(`/api/balance/token?groveId=${groveId}&accountId=${accountId}`);
    }

    async getUSDCBalance(accountId) {
        return this.request(`/api/balance/usdc?accountId=${accountId}`);
    }

    async getLPTokenBalances(accountId) {
        return this.request(`/api/balance/lp-tokens?accountId=${accountId}`);
    }

    // Transaction History API
    async getTransactionHistory(userAddress, options = {}) {
        const params = new URLSearchParams({
            userAddress,
            ...options
        });
        return this.request(`/api/transactions/history?${params.toString()}`);
    }

    async saveTransaction(transactionData) {
        return this.request('/api/transactions/save', {
            method: 'POST',
            body: transactionData
        });
    }

    async updateTransaction(transactionId, updates) {
        return this.request('/api/transactions/update', {
            method: 'PUT',
            body: {
                transactionId,
                updates
            }
        });
    }

    // Transaction History API
    async getTransactionHistory(userAddress, options = {}) {
        const params = new URLSearchParams({
            userAddress,
            ...options
        });
        return this.request(`/api/transactions/history?${params.toString()}`);
    }

    async getTransactionById(transactionId) {
        return this.request(`/api/transactions/${transactionId}`);
    }
}

// Create global API instance
window.coffeeAPI = new CoffeeTreeAPI();