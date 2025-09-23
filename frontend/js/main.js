/**
 * Main Application Controller
 * Handles view management, navigation, and overall application state
 */

class ViewManager {
    constructor() {
        this.currentView = 'dashboard';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.loadDashboardData();
        
        // Initialize based on wallet connection
        if (window.walletManager.isWalletConnected()) {
            this.handleWalletConnected();
        }
    }

    setupNavigation() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });
    }

    switchView(view) {
        // Update active navigation button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            }
        });

        // Update active view
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
        });
        
        const targetView = document.getElementById(`${view}View`);
        if (targetView) {
            targetView.classList.add('active');
        }

        this.currentView = view;

        // Load view-specific data
        this.loadViewData(view);
    }

    async loadViewData(view) {
        try {
            switch (view) {
                case 'dashboard':
                    await this.loadDashboardData();
                    break;
                case 'farmer':
                    if (window.walletManager.isWalletConnected() && window.walletManager.getUserType() === 'farmer') {
                        if (window.farmerDashboard && typeof window.farmerDashboard.switchSection === 'function') {
                            window.farmerDashboard.switchSection('groves');
                        }
                    }
                    break;
                case 'investor':
                    if (window.walletManager.isWalletConnected() && window.walletManager.getUserType() === 'investor') {
                        if (window.investorPortal && typeof window.investorPortal.switchSection === 'function') {
                            window.investorPortal.switchSection('browse');
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${view} data:`, error);
        }
    }

    async loadDashboardData() {
        try {
            // Load platform overview data
            const [marketOverview, pricesResponse] = await Promise.all([
                window.coffeeAPI.getMarketOverview().catch(() => ({ success: false })),
                window.coffeeAPI.getCurrentPrices().catch(() => ({ success: false }))
            ]);

            // Update dashboard stats
            this.updateDashboardStats(marketOverview, pricesResponse);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    updateDashboardStats(marketOverview, pricesResponse) {
        // Mock data for dashboard stats
        const totalGrovesVal = marketOverview && marketOverview.success
            ? Number(marketOverview.totalGroves ?? marketOverview.data?.totalGroves ?? 0)
            : 47;

        const activeFarmersVal = marketOverview && marketOverview.success
            ? Number(marketOverview.activeFarmers ?? marketOverview.data?.activeFarmers ?? 0)
            : 23;

        const totalRevenueVal = marketOverview && marketOverview.success
            ? Number(marketOverview.totalRevenue ?? marketOverview.data?.totalRevenue ?? 0)
            : 125000;

        let coffeePriceVal = 4.25;
        try {
            if (pricesResponse && pricesResponse.success) {
                const prices = pricesResponse.data?.prices || pricesResponse.prices;
                if (Array.isArray(prices)) {
                    coffeePriceVal = prices.find(p => p.variety && typeof p.variety === 'string' && p.variety.toLowerCase().includes('arabica'))?.price
                        || prices[0]?.price || coffeePriceVal;
                } else if (prices && typeof prices === 'object') {
                    // object map from mock server
                    coffeePriceVal = prices.arabica ?? prices.Arabica ?? prices['arabica'] ?? Object.values(prices)[0] ?? coffeePriceVal;
                }
                coffeePriceVal = Number(coffeePriceVal || coffeePriceVal);
            }
        } catch (e) {
            coffeePriceVal = 4.25;
        }

        const stats = {
            totalGroves: totalGrovesVal,
            activeFarmers: activeFarmersVal,
            totalRevenue: totalRevenueVal,
            coffeePrice: coffeePriceVal
        };

        // Update DOM elements
        const totalGrovesEl = document.getElementById('totalGroves');
        const activeFarmersEl = document.getElementById('activeFarmers');
        const totalRevenueEl = document.getElementById('totalRevenue');
        const coffeePriceEl = document.getElementById('coffeePrice');

        if (totalGrovesEl) totalGrovesEl.textContent = stats.totalGroves;
        if (activeFarmersEl) activeFarmersEl.textContent = stats.activeFarmers;
        if (totalRevenueEl) totalRevenueEl.textContent = `$${stats.totalRevenue.toLocaleString()}`;
        if (coffeePriceEl) coffeePriceEl.textContent = `$${stats.coffeePrice}/kg`;
    }

    handleWalletConnected() {
        const userType = window.walletManager.getUserType();
        
        // Auto-switch to appropriate view
        if (userType === 'farmer') {
            this.switchView('farmer');
        } else if (userType === 'investor') {
            this.switchView('investor');
        }
    }

    showError(message) {
        window.walletManager.showToast(message, 'error');
    }

    showSuccess(message) {
        window.walletManager.showToast(message, 'success');
    }

    showWarning(message) {
        window.walletManager.showToast(message, 'warning');
    }
}

// Application initialization
class CoffeeTreeApp {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
        } catch (error) {
            console.error('Application initialization failed:', error);
        }
    }

    async start() {
        try {
            // Initialize view manager
            window.viewManager = new ViewManager();

            // Test API connection
            await this.testAPIConnection();

            console.log('Coffee Tree Platform initialized successfully');
        } catch (error) {
            console.error('Application startup failed:', error);
            this.showConnectionError();
        }
    }

    async testAPIConnection() {
        try {
            const response = await window.coffeeAPI.healthCheck();
            if (response.success) {
                console.log('API connection successful');
            }
        } catch (error) {
            console.warn('API connection failed:', error);
            // Don't throw error - app can work with mock data
        }
    }

    showConnectionError() {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'connection-error';
        errorMessage.innerHTML = `
            <div class="error-content">
                <h3>Connection Error</h3>
                <p>Unable to connect to the Coffee Tree Platform API.</p>
                <p>Please ensure the backend server is running on port 3001.</p>
                <button class="btn btn-primary" onclick="location.reload()">Retry</button>
            </div>
        `;
        
        errorMessage.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
        `;

        document.body.appendChild(errorMessage);
    }
}

// Utility functions
window.utils = {
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    formatAddress: (address) => {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    },

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Start the application
window.coffeeTreeApp = new CoffeeTreeApp();