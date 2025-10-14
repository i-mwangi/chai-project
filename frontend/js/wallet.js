/**
 * Wallet Connection and Management
 * Handles Hedera wallet connections and user authentication
 */

class WalletManager {
    constructor() {
        this.isConnected = false;
        this.accountId = null;
        this.userType = null; // 'farmer' or 'investor'
        this.demoMode = true; // Enable demo mode by default
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

    connectWallet() {
        // In demo mode, simulate wallet connection
        if (this.demoMode) {
            this.showLoading('Connecting wallet...');
            
            setTimeout(() => {
                // Generate a random account ID for demo
                const accountId = `0.0.${Math.floor(100000 + Math.random() * 900000)}`;
                
                // Set the account ID
                this.accountId = accountId;
                
                // Default to investor unless specified otherwise
                let userType = 'investor'; // Default to investor
                
                // Check if user type is already set in localStorage (from demo helper)
                const storedUserType = localStorage.getItem('userType');
                if (storedUserType) {
                    userType = storedUserType;
                }
                
                this.userType = userType;
                
                // Save to localStorage
                localStorage.setItem('connectedAccount', accountId);
                localStorage.setItem('userType', userType);
                
                // Mark as connected
                this.isConnected = true;
                
                // Update UI
                this.updateUI();
                this.hideLoading();
                
                // Show success message
                this.showToast('Wallet connected successfully!', 'success');
                
                // Update navigation
                this.updateNavigation();
                
                // Notify other components
                this.notifyWalletConnected();
                
                // Auto-switch to appropriate view based on user type
                if (window.viewManager) {
                    if (this.userType === 'farmer') {
                        window.viewManager.switchView('farmer');
                    } else {
                        window.viewManager.switchView('investor');
                    }
                }
            }, 1500);
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

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 10000);
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

    notifyWalletConnected() {
        // Dispatch custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('walletConnected', {
            detail: {
                accountId: this.accountId,
                userType: this.userType
            }
        }));
    }
}

// Create global wallet manager instance
window.walletManager = new WalletManager();