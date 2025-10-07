/**
 * Wallet Connection and Management
 * Handles Hedera wallet connections and user authentication
 */

class WalletManager {
    constructor() {
        this.isConnected = false;
        this.accountId = null;
        this.userType = null; // 'farmer' or 'investor'
        this.init();
    }

    init() {
        // Check if wallet was previously connected
        const savedAccount = localStorage.getItem('connectedAccount');
        const savedUserType = localStorage.getItem('userType');
        
        if (savedAccount) {
            this.accountId = savedAccount;
            this.userType = savedUserType;
            this.isConnected = true;
            this.updateUI();
        }

        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        const connectBtn = document.getElementById('connectWallet');
        const disconnectBtn = document.getElementById('disconnectWallet');

        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectWallet());
        }

        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectWallet());
        }
    }

    async connectWallet() {
        try {
            // Show loading
            this.showLoading('Connecting wallet...');

            // For demo purposes, we'll simulate wallet connection
            // In a real implementation, this would integrate with HashPack or other Hedera wallets
            const mockAccountId = this.generateMockAccountId();
            
            // Simulate wallet connection delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Determine user type based on account (mock logic)
            const userType = this.determineUserType(mockAccountId);

            this.accountId = mockAccountId;
            this.userType = userType;
            this.isConnected = true;

            // Save to localStorage
            localStorage.setItem('connectedAccount', mockAccountId);
            localStorage.setItem('userType', userType);

            this.updateUI();
            this.hideLoading();
            
            this.showToast(`Connected as ${userType}`, 'success');

            // Start balance polling
            if (window.balancePoller) {
                window.balancePoller.startPolling();
            }

            // Initialize admin panel if user is admin
            await this.initializeAdminPanel();

            // Verification is disabled in this build (frontend no-op)
            // we intentionally skip calling the verification flows so no modal appears

        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.hideLoading();
            this.showToast('Failed to connect wallet', 'error');
        }
    }

    async initializeAdminPanel() {
        try {
            // Initialize TokenAdminManager if not already initialized
            if (!window.tokenAdminManager) {
                window.tokenAdminManager = new TokenAdminManager(window.coffeeAPI, this);
            }
            
            // Validate admin role
            const isAdmin = await window.tokenAdminManager.validateAdminRole(this.accountId);
            
            // Initialize admin panel UI
            if (window.adminPanel) {
                await window.adminPanel.initialize(window.tokenAdminManager);
            }
            
            if (isAdmin) {
                console.log('Admin panel initialized for user:', this.accountId);
            }
        } catch (error) {
            console.error('Error initializing admin panel:', error);
            // Don't throw - admin panel is optional
        }
    }

    disconnectWallet() {
        this.accountId = null;
        this.userType = null;
        this.isConnected = false;

        // Stop balance polling
        if (window.balancePoller) {
            window.balancePoller.stopPolling();
        }

        // Clear localStorage
        localStorage.removeItem('connectedAccount');
        localStorage.removeItem('userType');

        this.updateUI();
        this.showToast('Wallet disconnected', 'success');
    }

    generateMockAccountId() {
        // Generate a mock Hedera account ID (format: 0.0.xxxxx)
        const accountNum = Math.floor(Math.random() * 900000) + 100000;
        return `0.0.${accountNum}`;
    }

    determineUserType(accountId) {
        // Mock logic to determine user type based on account ID
        // In a real implementation, this might check on-chain data or user preferences
        const lastDigit = parseInt(accountId.split('.')[2]) % 10;
        return lastDigit < 5 ? 'farmer' : 'investor';
    }

    async checkFarmerVerification() {
        // Verification intentionally disabled on frontend — no-op
        return;
    }

    updateUI() {
        const connectBtn = document.getElementById('connectWallet');
        const disconnectBtn = document.getElementById('disconnectWallet');
        const walletInfo = document.getElementById('walletInfo');
        const walletAddress = document.getElementById('walletAddress');
        const walletPrompt = document.getElementById('walletPrompt');

        if (this.isConnected) {
            connectBtn?.classList.add('hidden');
            walletInfo?.classList.remove('hidden');
            walletPrompt?.classList.add('hidden');
            
            if (walletAddress) {
                walletAddress.textContent = this.formatAccountId(this.accountId);
            }

            // Update navigation based on user type
            this.updateNavigation();
        } else {
            connectBtn?.classList.remove('hidden');
            walletInfo?.classList.add('hidden');
            walletPrompt?.classList.remove('hidden');
        }
    }

    updateNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn');
        
        navBtns.forEach(btn => {
            const view = btn.dataset.view;
            
            if (view === 'farmer' && this.userType !== 'farmer') {
                btn.style.display = 'none';
            } else if (view === 'investor' && this.userType !== 'investor') {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'block';
            }
        });

        // Auto-switch to appropriate view
        if (this.userType === 'farmer') {
            window.viewManager?.switchView('farmer');
        } else if (this.userType === 'investor') {
            window.viewManager?.switchView('investor');
        }
    }

    formatAccountId(accountId) {
        if (!accountId) return '';
        
        // Show first 8 and last 4 characters for readability
        if (accountId.length > 12) {
            return `${accountId.substring(0, 8)}...${accountId.substring(accountId.length - 4)}`;
        }
        
        return accountId;
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const text = document.querySelector('.loading-text');
        
        if (overlay) {
            overlay.classList.remove('hidden');
        }
        
        if (text) {
            text.textContent = message;
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    // Utility methods for other components
    getAccountId() {
        return this.accountId;
    }

    getUserType() {
        return this.userType;
    }

    isWalletConnected() {
        return this.isConnected;
    }

    requireConnection() {
        if (!this.isConnected) {
            this.showToast('Please connect your wallet first', 'warning');
            return false;
        }
        return true;
    }

    requireFarmer() {
        if (!this.requireConnection()) return false;
        
        if (this.userType !== 'farmer') {
            this.showToast('This feature is only available for farmers', 'error');
            return false;
        }
        
        return true;
    }

    requireInvestor() {
        if (!this.requireConnection()) return false;
        
        if (this.userType !== 'investor') {
            this.showToast('This feature is only available for investors', 'error');
            return false;
        }
        
        return true;
    }

    async checkInvestorVerification() {
        // Verification intentionally disabled on frontend — no-op
        return;
    }

    showFarmerOnboardingModal(verification) {
        // Frontend verification UI disabled — don't render the modal
        return;
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', async () => {
                // mark that the user chose to skip farmer verification for now
                try {
                            localStorage.setItem('skipFarmerVerification', 'true');
                            localStorage.setItem('demoBypass', 'true');
                    // Persist to backend if possible
                    const accountId = this.accountId;
                    if (accountId && window.coffeeAPI && typeof window.coffeeAPI.saveUserSettings === 'function') {
                        await window.coffeeAPI.saveUserSettings(accountId, { skipFarmerVerification: true, demoBypass: true })
                    }
                } catch (e) {}
                this.showToast('You can complete verification later from your profile', 'info');
                document.body.removeChild(modal);
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    async startVerificationProcess() {
        // Close onboarding modal
        const modal = document.getElementById('farmerOnboardingModal');
        if (modal) {
            document.body.removeChild(modal);
        }

        // Clear skip flag since user is actively starting verification
        try {
            localStorage.removeItem('skipFarmerVerification');
            const accountId = this.accountId;
            if (accountId && window.coffeeAPI && typeof window.coffeeAPI.saveUserSettings === 'function') {
                await window.coffeeAPI.saveUserSettings(accountId, { skipFarmerVerification: false, demoBypass: false })
            }
        } catch (e) {}

        // Navigate to verification section
        if (window.viewManager) {
            window.viewManager.switchView('farmer');
        }
        
        setTimeout(() => {
            if (window.farmerDashboard && typeof window.farmerDashboard.switchSection === 'function') {
                window.farmerDashboard.switchSection('verification');
                this.showToast('Complete your verification to unlock all features', 'info');
            }
        }, 500);
    }

    showInvestorOnboardingModal(verification) {
        // Frontend verification UI disabled — don't render the modal
        return;
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', async () => {
                // mark that the user chose to skip investor verification for now
                try {
                    localStorage.setItem('skipInvestorVerification', 'true');
                    const accountId = this.accountId;
                    if (accountId && window.coffeeAPI && typeof window.coffeeAPI.saveUserSettings === 'function') {
                        await window.coffeeAPI.saveUserSettings(accountId, { skipInvestorVerification: true, demoBypass: true })
                    }
                } catch (e) {}
                this.showToast('You can complete verification later from your profile', 'info');
                document.body.removeChild(modal);
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    async startInvestorVerificationProcess() {
        // Close onboarding modal
        const modal = document.getElementById('investorOnboardingModal');
        if (modal) {
            document.body.removeChild(modal);
        }

        // Clear skip flag since user is actively starting investor verification
        try { localStorage.removeItem('skipInvestorVerification'); } catch (e) {}

        // Navigate to investor verification
        if (window.viewManager) {
            window.viewManager.switchView('investor');
        }
        
        setTimeout(() => {
            if (window.investorPortal && typeof window.investorPortal.switchSection === 'function') {
                window.investorPortal.switchSection('verification');
                this.showToast('Complete your verification to unlock all investment features', 'info');
            }
        }, 500);
    }
}

// Create global wallet manager instance
window.walletManager = new WalletManager();