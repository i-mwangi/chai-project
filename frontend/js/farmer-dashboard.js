/**
 * Farmer Dashboard Management
 * Handles all farmer-specific functionality including grove management,
 * harvest reporting, revenue tracking, and tree health monitoring
 */

class FarmerDashboard {
    constructor() {
        console.log('FarmerDashboard constructor called');
        this.currentSection = 'groves';
        this.groves = [];
        this.harvests = [];
        this.map = null;
        this.mapMarker = null;
        this.isSubmittingHarvest = false;
        // Performance: Data caching system
        this.dataCache = {
            groves: { data: null, timestamp: 0, ttl: 300000 }, // 5 min cache
            harvests: { data: null, timestamp: 0, ttl: 300000 },
            revenue: { data: null, timestamp: 0, ttl: 300000 },
            treeHealth: { data: null, timestamp: 0, ttl: 300000 }
        };
        this.verificationChecked = false;
        this.verificationStatus = null;
        this.init();
    }

    
    // Performance: Check if cached data is still valid
    isCacheValid(cacheKey) {
        const cache = this.dataCache[cacheKey];
        if (!cache || !cache.data) return false;
        const now = Date.now();
        return (now - cache.timestamp) < cache.ttl;
    }

    // Performance: Get cached data
    getCachedData(cacheKey) {
        if (this.isCacheValid(cacheKey)) {
            console.log(`✅ Using cached data for ${cacheKey}`);
            return this.dataCache[cacheKey].data;
        }
        return null;
    }

    // Performance: Set cached data
    setCachedData(cacheKey, data) {
        this.dataCache[cacheKey] = {
            data: data,
            timestamp: Date.now(),
            ttl: this.dataCache[cacheKey].ttl
        };
    }

    // Performance: Clear specific cache
    clearCache(cacheKey) {
        if (cacheKey) {
            this.dataCache[cacheKey] = { data: null, timestamp: 0, ttl: this.dataCache[cacheKey].ttl };
        } else {
            // Clear all caches
            Object.keys(this.dataCache).forEach(key => {
                this.dataCache[key].data = null;
                this.dataCache[key].timestamp = 0;
            });
        }
    }

    // Performance: Debounce helper
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    removeEventListeners() {
        // Simplified approach - no need to remove if using event delegation
        console.log('Event listener cleanup skipped (using delegation)');
    }

    init() {
        this.setupEventListeners();
        this.setupMap();
        // Render skip-verification banner if user previously skipped
        this.renderSkipVerificationBanner();
    }

    async renderSkipVerificationBanner() {
        // Performance: Check once and cache result
        if (this.verificationChecked) {
            if (this.verificationStatus) return;
        }

        const accountId = window.walletManager?.getAccountId();

        // Don't show banner if no account is connected
        if (!accountId) {
            return;
        }

        let hasSkipped = false;

        try {
            // Single check - localStorage first (fastest)
            if (localStorage.getItem('skipFarmerVerification') === 'true') {
                hasSkipped = true;
            }
        } catch (error) {
            console.error('Error checking verification status:', error);
        }

        // Cache the result
        this.verificationChecked = true;
        this.verificationStatus = hasSkipped;

        // Remove existing banner
        const existing = document.querySelector('.verification-skip-banner');
        if (existing) {
            existing.remove();
        }

        // Only show banner if user has NOT skipped verification
        if (hasSkipped) {
            return;
        }

        // Create and show the skip verification banner
        const banner = document.createElement('div');
        banner.className = 'verification-skip-banner';
        banner.innerHTML = `
            <div class="banner-inner">
                <span>⚠️ Complete farmer verification to access all features, or skip for now.</span>
                <button class="btn btn-primary" id="skipVerificationBtn">Skip Verification</button>
                <button class="btn btn-secondary" id="dismissBannerBtn">Dismiss</button>
            </div>
        `;

        // Insert banner at top of farmer dashboard container
        const dashboard = document.querySelector('.farmer-dashboard');
        if (dashboard) {
            dashboard.prepend(banner);
        }

        // Handle skip verification button click
        const skipBtn = document.getElementById('skipVerificationBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', async () => {
                await this.handleSkipVerification();
            });
        }

        // Handle dismiss button click
        const dismissBtn = document.getElementById('dismissBannerBtn');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                banner.remove();
            });
        }
    }

    async handleSkipVerification() {
        const accountId = window.walletManager?.getAccountId();

        if (!accountId) {
            this.showNotification('No account connected', 'error');
            return;
        }

        try {
            // Update settings on server
            if (window.coffeeAPI && typeof window.coffeeAPI.updateUserSettings === 'function') {
                const response = await window.coffeeAPI.updateUserSettings(accountId, {
                    skipFarmerVerification: true
                });

                if (response && response.success) {
                    // Update localStorage
                    localStorage.setItem('skipFarmerVerification', 'true');

                    // Remove the banner
                    const banner = document.querySelector('.verification-skip-banner');
                    if (banner) {
                        banner.remove();
                    }

                    // Show success notification
                    this.showNotification('Verification skipped successfully', 'success');
                } else {
                    throw new Error(response?.error || 'Failed to update settings');
                }
            } else {
                throw new Error('API method not available');
            }
        } catch (error) {
            console.error('Error skipping verification:', error);
            this.showNotification('Failed to update settings. Please try again.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Use existing toast notification if available
        if (window.walletManager && typeof window.walletManager.showToast === 'function') {
            window.walletManager.showToast(message, type);
        } else {
            // Fallback to console
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    setupEventListeners() {
        // Remove this line as it's causing issues
        // this.removeEventListeners();

        console.log('🔧 Setting up farmer dashboard event listeners...');

        // Use event delegation for better reliability
        const farmerDashboard = document.querySelector('.farmer-dashboard');
        if (!farmerDashboard) {
            console.warn('Farmer dashboard not found, skipping event setup');
            return;
        }

        // Event delegation for Add Grove button
        farmerDashboard.addEventListener('click', (e) => {
            if (e.target.id === 'addGroveBtn' || e.target.closest('#addGroveBtn')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('📝 Add Grove button clicked');
                this.showGroveModal();
            }
            
            // Event delegation for Add Harvest button
            if (e.target.id === 'addHarvestBtn' || e.target.closest('#addHarvestBtn')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🌾 Add Harvest button clicked');
                this.showHarvestModal();
            }
            
            // Event delegation for withdraw max button
            if (e.target.id === 'withdrawMaxBtn' || e.target.closest('#withdrawMaxBtn')) {
                e.preventDefault();
                e.stopPropagation();
                this.handleWithdrawMax();
            }
            
            // Event delegation for modal close buttons
            if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
                e.preventDefault();
                e.stopPropagation();
                this.closeModals();
            }
        });

        // Form submissions
        const groveForm = document.getElementById('groveForm');
        if (groveForm) {
            groveForm.removeEventListener('submit', this.boundHandleGroveSubmit);
            this.boundHandleGroveSubmit = (e) => this.handleGroveSubmit(e);
            groveForm.addEventListener('submit', this.boundHandleGroveSubmit);
        }

        const harvestForm = document.getElementById('harvestForm');
        if (harvestForm) {
            harvestForm.removeEventListener('submit', this.boundHandleHarvestSubmit);
            this.boundHandleHarvestSubmit = (e) => this.handleHarvestSubmit(e);
            harvestForm.addEventListener('submit', this.boundHandleHarvestSubmit);
        }

        const withdrawalForm = document.getElementById('farmerWithdrawalForm');
        if (withdrawalForm) {
            withdrawalForm.removeEventListener('submit', this.boundHandleWithdrawalSubmit);
            this.boundHandleWithdrawalSubmit = (e) => this.handleWithdrawalSubmit(e);
            withdrawalForm.addEventListener('submit', this.boundHandleWithdrawalSubmit);
        }

        console.log('✅ Farmer dashboard event listeners setup complete');
    }

    setupMap() {
        console.log('🗺️ Setting up map...');

        const groveMap = document.getElementById('groveMap');
        if (!groveMap) {
            console.warn('Grove map not found, skipping setup');
            return;
        }

        const map = L.map(groveMap).setView([0, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add a marker when clicking on the map
        map.on('click', (e) => {
            console.log('📍 Map clicked at', e.latlng);
            this.handleMapClick(e);
        });

        console.log('✅ Map setup complete');
    }

    renderSkipVerificationBanner() {
        const skipVerification = localStorage.getItem('skipFarmerVerification');
        if (skipVerification !== 'true') {
            console.log('Verification not skipped, showing banner');
            this.showSkipVerificationBanner();
        } else {
            console.log('Verification skipped, banner not shown');
        }
    }

    showSkipVerificationBanner() {
        const banner = document.createElement('div');
        banner.className = 'verification-skip-banner';
        banner.innerHTML = `
            <p>It looks like you've skipped verification. <button id="skipVerification">Re-verify</button></p>
        `;
        document.body.appendChild(banner);

        const skipButton = document.getElementById('skipVerification');
        if (skipButton) {
            skipButton.addEventListener('click', () => {
                this.removeSkipVerificationBanner();
            });
        }
    }

    removeSkipVerificationBanner() {
        const banner = document.querySelector('.verification-skip-banner');
        if (banner) {
            banner.remove();
        }
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('open');
        });
    }

    showGroveModal() {
        const modal = document.getElementById('groveModal');
        if (modal) {
            modal.classList.add('open');
            this.populateCoffeeVarieties();
        }
    }

    showHarvestModal() {
        const modal = document.getElementById('harvestModal');
        if (modal) {
            modal.classList.add('open');
        }
    }

    handleWithdrawMax() {
        const withdrawalForm = document.getElementById('farmerWithdrawalForm');
        if (withdrawalForm) {
            const withdrawalAmount = document.getElementById('withdrawalAmount');
            if (withdrawalAmount) {
                withdrawalAmount.value = 'MAX';
            }
            withdrawalForm.submit();
        }
    }

    async handleGroveSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const groveData = {
            name: formData.get('groveName'),
            location: {
                lat: parseFloat(formData.get('latitude')),
                lng: parseFloat(formData.get('longitude'))
            },
            variety: formData.get('coffeeVariety'),
            area: parseFloat(formData.get('area')),
            yield: parseFloat(formData.get('yield')),
            owner: formData.get('owner'),
            qualityGrade: formData.get('qualityGrade'),
            salePrice: parseFloat(formData.get('salePrice')),
            notes: formData.get('notes')
        };

        try {
            if (window.coffeeAPI && typeof window.coffeeAPI.addGrove === 'function') {
                const response = await window.coffeeAPI.addGrove(groveData);

                if (response && response.success) {
                    this.showNotification('Grove added successfully', 'success');
                    this.closeModals();
                    this.setupMap();
                } else {
                    throw new Error(response?.error || 'Failed to add grove');
                }
            } else {
                throw new Error('API method not available');
            }
        } catch (error) {
            console.error('Error adding grove:', error);
            this.showNotification('Failed to add grove. Please try again.', 'error');
        }
    }

    async handleHarvestSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const harvestData = {
            groveName: formData.get('groveName'),
            harvestDate: formData.get('harvestDate'),
            quantity: parseFloat(formData.get('quantity')),
            qualityGrade: formData.get('qualityGrade'),
            salePrice: parseFloat(formData.get('salePrice')),
            notes: formData.get('notes')
        };

        try {
            if (window.coffeeAPI && typeof window.coffeeAPI.addHarvest === 'function') {
                const response = await window.coffeeAPI.addHarvest(harvestData);

                if (response && response.success) {
                    this.showNotification('Harvest added successfully', 'success');
                    this.closeModals();
                } else {
                    throw new Error(response?.error || 'Failed to add harvest');
                }
            } else {
                throw new Error('API method not available');
            }
        } catch (error) {
            console.error('Error adding harvest:', error);
            this.showNotification('Failed to add harvest. Please try again.', 'error');
        }
    }

    async handleWithdrawalSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const withdrawalData = {
            amount: formData.get('withdrawalAmount'),
            owner: formData.get('owner'),
            notes: formData.get('notes')
        };

        try {
            if (window.coffeeAPI && typeof window.coffeeAPI.withdrawFarmerFunds === 'function') {
                const response = await window.coffeeAPI.withdrawFarmerFunds(withdrawalData);

                if (response && response.success) {
                    this.showNotification('Withdrawal successful', 'success');
                    this.closeModals();
                } else {
                    throw new Error(response?.error || 'Failed to withdraw funds');
                }
            } else {
                throw new Error('API method not available');
            }
        } catch (error) {
            console.error('Error withdrawing funds:', error);
            this.showNotification('Failed to withdraw funds. Please try again.', 'error');
        }
    }

    handleMapClick(e) {
        const latitudeInput = document.getElementById('latitude');
        const longitudeInput = document.getElementById('longitude');

        if (latitudeInput && longitudeInput) {
            latitudeInput.value = e.latlng.lat.toFixed(6);
            longitudeInput.value = e.latlng.lng.toFixed(6);
        }
    }

    updateQualityGradeDisplay() {
        const qualityGradeSlider = document.getElementById('qualityGrade');
        const qualityGradeDisplay = document.getElementById('qualityGradeDisplay');

        if (qualityGradeSlider && qualityGradeDisplay) {
            qualityGradeDisplay.textContent = qualityGradeSlider.value;
        }
    }

    validateSalePrice() {
        const salePriceInput = document.getElementById('salePrice');
        const salePriceFeedback = document.getElementById('salePriceFeedback');

        if (salePriceInput && salePriceFeedback) {
            const salePrice = parseFloat(salePriceInput.value);

            if (isNaN(salePrice) || salePrice <= 0) {
                salePriceFeedback.textContent = 'Please enter a valid price.';
            } else {
                salePriceFeedback.textContent = '';
            }
        }
    }

    populateCoffeeVarieties() {
        const coffeeVarietySelect = document.getElementById('coffeeVariety');

        if (coffeeVarietySelect) {
            coffeeVarietySelect.innerHTML = '';

            const varieties = ['Arabica', 'Robusta', 'Liberica', 'Excelsa'];

            varieties.forEach(variety => {
                const option = document.createElement('option');
                option.value = variety;
                option.textContent = variety;
                coffeeVarietySelect.appendChild(option);
            });
        }
    }

    searchLocation() {
        const locationInput = document.getElementById('locationSearchInput');

        if (locationInput) {
            const query = locationInput.value;

            if (query) {
                // Perform geocoding search
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            const result = data[0];
                            const lat = parseFloat(result.lat);
                            const lon = parseFloat(result.lon);

                            // Update map view
                            if (this.map) {
                                this.map.setView([lat, lon], 13);
                            }

                            // Update form fields
                            const latitudeInput = document.getElementById('latitude');
                            const longitudeInput = document.getElementById('longitude');

                            if (latitudeInput && longitudeInput) {
                                latitudeInput.value = lat.toFixed(6);
                                longitudeInput.value = lon.toFixed(6);
                            }

                            // Add marker
                            if (this.mapMarker) {
                                this.map.removeLayer(this.mapMarker);
                            }

                            this.mapMarker = L.marker([lat, lon]).addTo(this.map);
                        } else {
                            console.warn('No results found for location search');
                        }
                    })
                    .catch(error => {
                        console.error('Error searching location:', error);
                    });
            }
        }
    }

    // Add other methods as needed...
}

// Create global farmer dashboard instance
window.farmerDashboard = new FarmerDashboard();
console.log('FarmerDashboard initialized');