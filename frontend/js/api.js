/**
 * API Client for Coffee Tree Platform
 * Handles all communication with the backend API
 */

class CoffeeTreeAPI {
    constructor(baseURL = 'http://localhost:3002') {
        this.baseURL = baseURL;
    }

    // Utility method for making HTTP requests
    async request(endpoint, options = {}) {
        // Helper to add a timeout to fetch requests
        const fetchWithTimeout = (url, cfg, timeout = 30000) => { // Increased from 15000 to 30000 ms
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
            const response = await fetchWithTimeout(url, config, 30000); // Increased from 20000 to 30000 ms
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
}

// Create global API instance
window.coffeeAPI = new CoffeeTreeAPI();