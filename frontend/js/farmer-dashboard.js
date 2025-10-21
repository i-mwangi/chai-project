
/**
 * Farmer Dashboard Management
 * Handles all farmer-specific functionality including grove management,
 * harvest reporting, revenue tracking, and tree health monitoring
 */

class FarmerDashboard {
    constructor() {
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

        // Defer initialization until the DOM is fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
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
        if (window.notificationManager) {
            switch (type) {
                case 'success': window.notificationManager.success(message); break;
                case 'error': window.notificationManager.error(message); break;
                case 'warning': window.notificationManager.warning(message); break;
                default: window.notificationManager.info(message); break;
            }
        } else {
            // Fallback to console
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    setupEventListeners() {
        // Remove this line as it's causing issues
        // this.removeEventListeners();

        console.log('🔧 Setting up farmer dashboard event listeners using delegation...');

        // Use event delegation for better reliability
        const farmerDashboard = document.querySelector('#farmerView'); // Target the main view container
        if (!farmerDashboard) {
            console.warn('Farmer dashboard not found, skipping event setup');
            return;
        }

        // Event delegation for Add Grove button
        farmerDashboard.addEventListener('click', (e) => {
            const target = e.target;
            const targetId = target.id;
            const closestBtn = target.closest('button');

            // Handle sidebar menu clicks
            const menuItem = target.closest('.menu-item');
            if (menuItem && menuItem.dataset.section) {
                this.switchSection(menuItem.dataset.section);
                return;
            }

            // Helper to check for a button match
            const isButton = (id) => targetId === id || closestBtn?.id === id;

            if (isButton('addGroveBtn')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('📝 Add Grove button clicked');
                this.showGroveModal();
                return;
            }
            
            if (isButton('addHarvestBtn')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🌾 Add Harvest button clicked');
                this.showHarvestModal();
                return;
            }
            
            if (isButton('withdrawMaxBtn')) {
                e.preventDefault();
                e.stopPropagation();
                this.handleWithdrawMax();
                return;
            }

            // Modal-specific buttons
            if (isButton('searchLocation')) {
                e.preventDefault();
                this.searchLocation();
                return;
            }

            if (isButton('goToCoordinates')) {
                e.preventDefault();
                console.log('Navigating to coordinates button clicked...');
                this.navigateToCoordinates();
                return;
            }

            // General modal close buttons
            if (target.classList.contains('modal-close') || target.closest('.modal-close')) {
                e.preventDefault();
                e.stopPropagation();
                this.closeModals();
                return;
            }
        });

        // Form submissions
        farmerDashboard.addEventListener('submit', (e) => {
            if (e.target.id === 'groveForm') {
                this.handleGroveSubmit(e);
            } else if (e.target.id === 'harvestForm') {
                this.handleHarvestSubmit(e);
            }
        });

        const withdrawalForm = document.getElementById('farmerWithdrawalForm');
        if (withdrawalForm) {
            withdrawalForm.removeEventListener('submit', this.boundHandleWithdrawalSubmit);
            this.boundHandleWithdrawalSubmit = (e) => this.handleWithdrawalSubmit(e);
            withdrawalForm.addEventListener('submit', this.boundHandleWithdrawalSubmit);
        }

        console.log('✅ Farmer dashboard event listeners setup complete');
    }

    setupMap() {
        // Only initialize the map if it doesn't already exist
        if (this.map) {
            console.log('🗺️ Map already initialized. Invalidating size.');
            // If the modal was hidden, the map needs its size re-validated
            setTimeout(() => this.map.invalidateSize(), 100);
            return;
        }
    
        console.log('🗺️ Initializing map for the first time...');
        const groveMapEl = document.getElementById('groveMap');
        if (!groveMapEl) {
            console.warn('Grove map container not found, skipping setup');
            return;
        }
    
        this.map = L.map(groveMapEl).setView([0, 0], 2);
    
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    
        // Add a marker when clicking on the map
        this.map.on('click', (e) => {
            console.log('📍 Map clicked at', e.latlng);
            this.handleMapClick(e);
        });
    
        console.log('✅ Map setup complete');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active'); // Use 'active' to match CSS
        });
    }

    // This function is no longer needed as verification is bypassed.
    async checkVerificationForSection(farmerAddress, section) {
        return true; // Always return true to allow access
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

        // Collect data only from the fields that exist in the form
        const groveData = {
            groveName: formData.get('groveName'),
            location: formData.get('location'),
            latitude: parseFloat(formData.get('latitude')),
            longitude: parseFloat(formData.get('longitude')),
            treeCount: parseInt(formData.get('treeCount')),
            coffeeVariety: formData.get('coffeeVariety'),
            expectedYieldPerTree: parseFloat(formData.get('expectedYield')),
            farmerAddress: window.walletManager?.getAccountId() // Include farmer address
        };

        try {
            // Corrected: Use the 'registerGrove' method which exists in api.js
            if (window.coffeeAPI && typeof window.coffeeAPI.registerGrove === 'function') {
                const response = await window.coffeeAPI.registerGrove(groveData);

                if (response && response.success) {
                    this.showNotification('Grove added successfully', 'success');
                    this.closeModals();
                    this.loadGroves(groveData.farmerAddress); // Refresh the groves list
                } else {
                    throw new Error(response?.error || 'Failed to register grove');
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

    showGroveModal() {
        const modal = document.getElementById('groveModal');
        if (modal) {
            modal.classList.add('active'); // Use 'active' class
            this.setupMap(); // Initialize map when modal is shown
        }
    }

    showHarvestModal() {
        const modal = document.getElementById('harvestModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    handleMapClick(e) {
        const latitudeInput = document.getElementById('latitude');
        const longitudeInput = document.getElementById('longitude');

        if (latitudeInput && longitudeInput) {
            latitudeInput.value = e.latlng.lat.toFixed(6);
            longitudeInput.value = e.latlng.lng.toFixed(6);
        }

        // Add or move the marker
        if (this.mapMarker) {
            this.mapMarker.setLatLng(e.latlng);
        } else {
            this.mapMarker = L.marker(e.latlng).addTo(this.map);
        }
        this.map.panTo(e.latlng);
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

    searchLocation() {
        const locationInput = document.getElementById('locationSearch'); // Corrected ID

        if (locationInput) {
            const query = locationInput.value;

            if (query) {
                // Show searching notification
                this.showNotification('Searching for location...', 'info');

                // Perform geocoding search
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            const result = data[0];
                            const lat = parseFloat(result.lat);
                            const lon = parseFloat(result.lon);

                            // Show success notification
                            this.showNotification('Location found!', 'success');

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
                            // Show not found notification
                            this.showNotification('Location not found. Please try a different search term.', 'warning');
                        }
                    })
                    .catch(error => {
                        console.error('Error searching location:', error);
                        this.showNotification('Error searching for location. Please check your connection.', 'error');
                    });
            }
        }
    }

    navigateToCoordinates() {
        const latInput = document.getElementById('latitude');
        const lonInput = document.getElementById('longitude');

        if (latInput && lonInput && this.map) {
            const lat = parseFloat(latInput.value);
            const lon = parseFloat(lonInput.value);

            if (!isNaN(lat) && !isNaN(lon)) {
                this.map.flyTo([lat, lon], 13);
                this.handleMapClick({ latlng: { lat, lng: lon } }); // Reuse map click handler to place marker
            } else {
                this.showNotification('Please enter valid latitude and longitude.', 'warning');
            }
        } else {
            console.warn('Map or coordinate inputs not found for navigation.');
        }
    }
    async switchSection(section) {
        if (!section) return;
        console.log(`Switching to section: ${section}`);

        this.currentSection = section;

        // Update active menu item
        document.querySelectorAll('.farmer-dashboard .menu-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        // Hide all sections
        document.querySelectorAll('.farmer-dashboard .section').forEach(sec => {
            sec.classList.remove('active');
        });

        // Show the target section
        const targetSection = document.getElementById(`${section}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
            // Load data for the new section
            await this.loadSectionData(section);
        } else {
            console.warn(`Section "${section}" not found.`);
        }
    }

    async loadSectionData(section) {
        const farmerAddress = window.walletManager?.getAccountId();
        if (!farmerAddress) {
            this.showNotification('Please connect your wallet to view farmer data.', 'warning');
            return;
        }

        // Always allow access since verification is bypassed
        try {
            switch (section) {
                case 'groves':
                    await this.loadGroves(farmerAddress);
                    break;
                case 'harvest':
                    await this.loadHarvests(farmerAddress);
                    break;
                // Add cases for other sections here
            }
        } catch (error) {
            console.error(`Failed to load data for section ${section}:`, error);
            this.showNotification(`Error loading ${section} data.`, 'error');
        }
    }

    async loadGroves(farmerAddress) {
        const container = document.getElementById('grovesGrid');
        if (!container) return;
        container.innerHTML = '<div class="loading-spinner"></div>'; // Show loader

        try {
            const response = await window.coffeeAPI.getGroves(farmerAddress);
            if (response.success) {
                this.groves = response.groves;
                this.renderGroves();
            } else {
                container.innerHTML = '<p>Could not load groves.</p>';
            }
        } catch (error) {
            container.innerHTML = '<p>Error loading groves.</p>';
        }
    }

    renderGroves() {
        const container = document.getElementById('grovesGrid');
        if (!container) return;

        if (this.groves.length === 0) {
            container.innerHTML = '<p>No groves registered yet. Click "Register New Grove" to start.</p>';
            return;
        }

        container.innerHTML = this.groves.map(grove => `
            <div class="card">
                <h4>${grove.groveName}</h4>
                <p>${grove.location}</p>
                <p>${grove.treeCount} trees</p>
            </div>
        `).join('');
    }

    async loadHarvests(farmerAddress) {
        // Placeholder to load and render harvest reports
        const container = document.getElementById('harvestList');
        if (container) container.innerHTML = '<p>Harvest reports will be shown here.</p>';
    }
    // Add other methods as needed...
}

// Create global farmer dashboard instance
window.farmerDashboard = new FarmerDashboard();