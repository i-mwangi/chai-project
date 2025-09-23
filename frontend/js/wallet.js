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

            // Check verification status based on user type
            if (userType === 'farmer') {
                await this.checkFarmerVerification();
            } else if (userType === 'investor') {
                await this.checkInvestorVerification();
            }

        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.hideLoading();
            this.showToast('Failed to connect wallet', 'error');
        }
    }

    disconnectWallet() {
        this.accountId = null;
        this.userType = null;
        this.isConnected = false;

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
        // Respect user's choice to skip verification for now
        if (localStorage.getItem('skipFarmerVerification') === 'true') return;

        try {
            const response = await window.coffeeAPI.getVerificationStatus(this.accountId);

            if (response && response.success) {
                const status = response.verification?.status || 'pending';

                if (status === 'pending') {
                    this.showToast('Please complete farmer verification to access all features', 'warning');
                    setTimeout(() => this.showFarmerOnboardingModal(response.verification), 2000);
                } else if (status === 'rejected') {
                    this.showToast('Farmer verification was rejected. Please resubmit documents.', 'error');
                    setTimeout(() => this.showFarmerOnboardingModal(response.verification), 2000);
                } else if (status === 'verified') {
                    this.showToast('Farmer verification complete!', 'success');
                }
            }
        } catch (error) {
            console.error('Failed to check verification status:', error);
            // For new farmers, show onboarding (unless skipped)
            setTimeout(() => {
                if (localStorage.getItem('skipFarmerVerification') !== 'true') {
                    this.showFarmerOnboardingModal(null);
                }
            }, 2000);
        }
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
        // Respect user's choice to skip verification for now
        if (localStorage.getItem('skipInvestorVerification') === 'true') return;

        try {
            const response = await window.coffeeAPI.getInvestorVerificationStatus(this.accountId);

            if (response && response.success) {
                const status = response.verification?.status || 'pending';

                if (status === 'pending') {
                    this.showToast('Please complete investor verification to access all features', 'warning');
                    setTimeout(() => this.showInvestorOnboardingModal(response.verification), 2000);
                } else if (status === 'rejected') {
                    this.showToast('Investor verification was rejected. Please resubmit documents.', 'error');
                    setTimeout(() => this.showInvestorOnboardingModal(response.verification), 2000);
                } else if (status === 'verified') {
                    this.showToast('Investor verification complete!', 'success');
                }
            }
        } catch (error) {
            console.error('Failed to check investor verification status:', error);
            
            // If API endpoint is not found, show a different message
            if (error.message.includes('Endpoint not found') || error.message.includes('404')) {
                console.warn('Investor verification API not available yet');
                this.showToast('Investor verification system is being set up. Full features available soon!', 'info');
                return;
            }
            
            // For other errors or new investors, show onboarding (unless skipped)
            setTimeout(() => {
                if (localStorage.getItem('skipInvestorVerification') !== 'true') {
                    this.showInvestorOnboardingModal(null);
                }
            }, 2000);
        }
    }

    showFarmerOnboardingModal(verification) {
        // Don't show if already verified
        if (verification && verification.status === 'verified') return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'farmerOnboardingModal';
        
        const status = verification?.status || 'new';
        const isRejected = status === 'rejected';
        const isPending = status === 'pending';
        
        modal.innerHTML = `
            <div class="modal-content onboarding-modal">
                <div class="modal-header">
                    <h4>🌱 Welcome to Chai Platform</h4>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="onboarding-content">
                        ${isRejected ? `
                            <div class="status-alert alert-danger">
                                <h5>⚠️ Verification Rejected</h5>
                                <p><strong>Reason:</strong> ${verification.rejectionReason}</p>
                                <p>Please resubmit your documents with the required corrections.</p>
                            </div>
                        ` : isPending ? `
                            <div class="status-alert alert-warning">
                                <h5>⏳ Verification Pending</h5>
                                <p>Your documents are being reviewed. This usually takes 1-3 business days.</p>
                                <p>Submitted on: ${new Date(verification.submissionDate).toLocaleDateString()}</p>
                            </div>
                        ` : `
                            <div class="welcome-message">
                                <h5>👋 Welcome, Coffee Farmer!</h5>
                                <p>To start using the platform, you need to complete farmer verification.</p>
                            </div>
                        `}
                        
                        <div class="onboarding-steps">
                            <h6>Required Documents:</h6>
                            <ul class="document-checklist">
                                <li>📄 <strong>Land Ownership Documents</strong><br>
                                    <small>Land title, deed, lease agreement, or property certificate</small>
                                </li>
                                <li>🆔 <strong>Government-Issued ID</strong><br>
                                    <small>National ID, passport, driver's license, or voter card</small>
                                </li>
                                <li>🌾 <strong>Farming License or Permit</strong><br>
                                    <small>Agricultural license, farming permit, or cooperative membership</small>
                                </li>
                            </ul>
                            <div class="document-requirements">
                                <small><strong>Requirements:</strong> PDF, JPG, or PNG format • Clear and legible • Current documents</small>
                            </div>
                        </div>
                        
                        <div class="onboarding-benefits">
                            <h6>After verification, you can:</h6>
                            <ul class="benefits-list">
                                <li>✅ Register your coffee groves</li>
                                <li>✅ Report harvests and track revenue</li>
                                <li>✅ Access tree health monitoring</li>
                                <li>✅ Receive payments from investors</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-secondary modal-close">Maybe Later</button>
                        <button class="btn btn-primary" onclick="window.walletManager.startVerificationProcess()">
                            ${isRejected || isPending ? 'Update Documents' : 'Start Verification'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers — allow skipping verification
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
        // Don't show if already verified
        if (verification && verification.status === 'verified') return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'investorOnboardingModal';
        
        const status = verification?.status || 'new';
        const isRejected = status === 'rejected';
        const isPending = status === 'pending';
        
        modal.innerHTML = `
            <div class="modal-content onboarding-modal">
                <div class="modal-header">
                    <h4>💰 Welcome to Chai Platform</h4>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="onboarding-content">
                        ${isRejected ? `
                            <div class="status-alert alert-danger">
                                <h5>⚠️ Verification Rejected</h5>
                                <p><strong>Reason:</strong> ${verification.rejectionReason}</p>
                                <p>Please resubmit your documents with the required corrections.</p>
                            </div>
                        ` : isPending ? `
                            <div class="status-alert alert-warning">
                                <h5>⏳ Verification Pending</h5>
                                <p>Your documents are being reviewed. This usually takes 1-3 business days.</p>
                                <p>Submitted on: ${new Date(verification.submissionDate).toLocaleDateString()}</p>
                            </div>
                        ` : `
                            <div class="welcome-message">
                                <h5>👋 Welcome, Coffee Investor!</h5>
                                <p>To start investing in coffee groves, you need to complete investor verification.</p>
                            </div>
                        `}
                        
                        <div class="onboarding-steps">
                            <h6>Required Documents:</h6>
                            <ul class="document-checklist">
                                <li>🆔 <strong>Government-Issued ID</strong><br>
                                    <small>National ID, passport, driver's license, or state ID</small>
                                </li>
                                <li>🏦 <strong>Proof of Address</strong><br>
                                    <small>Utility bill, bank statement, or lease agreement (last 3 months)</small>
                                </li>
                                <li>💼 <strong>Financial Information</strong><br>
                                    <small>Bank statement, income verification, or investment account statement</small>
                                </li>
                            </ul>
                            <div class="document-requirements">
                                <small><strong>Requirements:</strong> PDF, JPG, or PNG format • Clear and legible • Current documents</small>
                            </div>
                        </div>
                        
                        <div class="onboarding-benefits">
                            <h6>After verification, you can:</h6>
                            <ul class="benefits-list">
                                <li>✅ Invest in coffee grove tokens</li>
                                <li>✅ Receive revenue distributions</li>
                                <li>✅ Trade tokens on secondary market</li>
                                <li>✅ Access detailed grove analytics</li>
                                <li>✅ Track investment performance</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-secondary modal-close">Maybe Later</button>
                        <button class="btn btn-primary" onclick="window.walletManager.startInvestorVerificationProcess()">
                            ${isRejected || isPending ? 'Update Documents' : 'Start Verification'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers — allow skipping verification
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