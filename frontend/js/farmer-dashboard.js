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
        // This is a simplified approach - in a real application, you'd want to store references to the event listeners
        // and remove them properly. For now, we'll just reattach them which should work fine.
        console.log('Removing existing event listeners (simplified approach)');
    }

// Initialize FarmerDashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.farmerDashboard = new FarmerDashboard();
        console.log('✅ FarmerDashboard initialized');
    });
} else {
    window.farmerDashboard = new FarmerDashboard();
    console.log('✅ FarmerDashboard initialized');
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

    init() {
        this.setupEventListeners();
        this.setupMap();
        // Render skip-verification banner if user previously skipped
        this.renderSkipVerificationBanner();
    }

    setupEventListeners() {
        // Remove existing event listeners to prevent duplicates
        this.removeEventListeners();

        // Add event listeners for modal close buttons
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Add event listeners for modal overlays
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                // Only close if clicking directly on the overlay, not on content
                if (e.target === overlay) {
                    this.closeModals();
                }
            });
        });

        // Add event listener for cancel button
        const cancelGroveBtn = document.getElementById('cancelGrove');
        if (cancelGroveBtn) {
            cancelGroveBtn.addEventListener('click', () => {
                this.closeModals();
            });
        }

        // Add event listener for cancel harvest button
        const cancelHarvestBtn = document.getElementById('cancelHarvest');
        if (cancelHarvestBtn) {
            cancelHarvestBtn.addEventListener('click', () => {
                this.closeModals();
            });
        }

        // Add event listener for withdraw max button
        const withdrawMaxBtn = document.getElementById('withdrawMaxBtn');
        if (withdrawMaxBtn) {
            withdrawMaxBtn.addEventListener('click', () => {
                this.handleWithdrawMax();
            });
        }

        // Add event listener for grove form submission
        const groveForm = document.getElementById('groveForm');
        if (groveForm) {
            groveForm.addEventListener('submit', (e) => {
                this.handleGroveSubmit(e);
            });
        }

        // Add event listener for harvest form submission
        const harvestForm = document.getElementById('harvestForm');
        if (harvestForm) {
            harvestForm.addEventListener('submit', (e) => {
                this.handleHarvestSubmit(e);
            });
        }

        // Add event listener for withdrawal form submission
        const withdrawalForm = document.getElementById('farmerWithdrawalForm');
        if (withdrawalForm) {
            withdrawalForm.addEventListener('submit', (e) => {
                this.handleWithdrawalSubmit(e);
            });
        }

        // Add event listener for add grove button
        const addGroveBtn = document.getElementById('addGroveBtn');
        if (addGroveBtn) {
            addGroveBtn.addEventListener('click', () => {
                this.showGroveModal();
            });
        }

        // Add event listener for add harvest button
        const addHarvestBtn = document.getElementById('addHarvestBtn');
        if (addHarvestBtn) {
            addHarvestBtn.addEventListener('click', () => {
                this.showHarvestModal();
            });
        }

        // Add event listener for location search
        const searchLocationBtn = document.getElementById('searchLocation');
        if (searchLocationBtn) {
            searchLocationBtn.addEventListener('click', () => {
                this.searchLocation();
            });
        }

        // Add event listener for go to coordinates
        const goToCoordinatesBtn = document.getElementById('goToCoordinates');
        if (goToCoordinatesBtn) {
            goToCoordinatesBtn.addEventListener('click', () => {
                this.navigateToCoordinates();
            });
        }

        // Add event listener for map clicks
        const groveMap = document.getElementById('groveMap');
        if (groveMap) {
            groveMap.addEventListener('click', (e) => {
                this.handleMapClick(e);
            });
        }

        // Add event listener for quality grade slider
        const qualityGradeSlider = document.getElementById('qualityGrade');
        if (qualityGradeSlider) {
            qualityGradeSlider.addEventListener('input', () => {
                this.updateQualityGradeDisplay();
            });
        }

        // Add event listener for sale price input
        const salePriceInput = document.getElementById('salePrice');
        if (salePriceInput) {
            salePriceInput.addEventListener('input', () => {
                this.validateSalePrice();
            });
        }

        // Add event listener for coffee variety change
        const coffeeVarietySelect = document.getElementById('coffeeVariety');
        if (coffeeVarietySelect) {
            coffeeVarietySelect.addEventListener('change', () => {
                this.updateProjectedRevenue();
            });
        }

        // Add event listener for harvest date change
        const harvestDateInput = document.getElementById('harvestDate');
        if (harvestDateInput) {
            harvestDateInput.addEventListener('change', () => {
                this.updateProjectedRevenue();
            });
        }

        // Add event listener for yield input
        const yieldInput = document.getElementById('yieldKg');
        if (yieldInput) {
            yieldInput.addEventListener('input', () => {
                this.updateProjectedRevenue();
            });
        }

        // Initialize the quality grade display
        this.updateQualityGradeDisplay();

        // Add keyboard event listener for Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });

        // Add event listeners for sidebar menu items
        document.querySelectorAll('.farmer-dashboard .menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.dataset.section;
                if (section) {
                    this.switchSection(section);
                }
            });
        });
    }

    removeEventListeners() {
        // This is a simplified approach - in a real application, you'd want to store references to the event listeners
        // and remove them properly. For now, we'll just reattach them which should work fine.
        console.log('Removing existing event listeners (simplified approach)');
    }

    setupMap() {
        // Initialize map when grove modal is opened
        const groveModal = document.getElementById('groveModal');
        if (groveModal) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (groveModal.classList.contains('active') && !this.map) {
                            setTimeout(() => this.initializeMap(), 100);
                        }
                    }
                });
            });
            observer.observe(groveModal, { attributes: true });
        }
    }

    initializeMap() {
        const mapContainer = document.getElementById('groveMap');
        if (!mapContainer || this.map) return;

        // Initialize Leaflet map
        this.map = L.map('groveMap').setView([9.7489, -83.7534], 8); // Costa Rica center

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add click handler for setting grove location
        this.map.on('click', (e) => {
            const { lat, lng } = e.latlng;

            // Update form fields
            document.getElementById('latitude').value = lat.toFixed(6);
            document.getElementById('longitude').value = lng.toFixed(6);

            // Update marker
            if (this.mapMarker) {
                this.map.removeLayer(this.mapMarker);
            }

            this.mapMarker = L.marker([lat, lng]).addTo(this.map);
        });

        // Add "Go to Coordinates" button handler
        const goToBtn = document.getElementById('goToCoordinates');
        if (goToBtn) {
            goToBtn.addEventListener('click', () => this.navigateToCoordinates());
        }

        // Add location search handler
        const searchBtn = document.getElementById('searchLocation');
        const searchInput = document.getElementById('locationSearch');
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => this.searchLocation());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchLocation();
                }
            });
        }
    }

    navigateToCoordinates() {
        const latInput = document.getElementById('latitude');
        const lngInput = document.getElementById('longitude');

        if (!latInput || !lngInput) return;

        const lat = parseFloat(latInput.value);
        const lng = parseFloat(lngInput.value);

        if (isNaN(lat) || isNaN(lng)) {
            window.notificationManager?.warning('Please enter valid latitude and longitude values');
            return;
        }

        // Validate coordinate ranges
        if (lat < -90 || lat > 90) {
            window.notificationManager?.error('Latitude must be between -90 and 90');
            return;
        }

        if (lng < -180 || lng > 180) {
            window.notificationManager?.error('Longitude must be between -180 and 180');
            return;
        }

        // Move map to coordinates
        this.map.setView([lat, lng], 13);

        // Update or create marker
        if (this.mapMarker) {
            this.map.removeLayer(this.mapMarker);
        }

        this.mapMarker = L.marker([lat, lng]).addTo(this.map);

        window.notificationManager?.success(`Map navigated to coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }

    async searchLocation() {
        const searchInput = document.getElementById('locationSearch');
        if (!searchInput) return;

        const query = searchInput.value.trim();
        if (!query) {
            window.notificationManager?.warning('Please enter a location to search');
            return;
        }

        try {
            window.notificationManager?.info('Searching for location...');

            // Use our own API server as a proxy to avoid CORS issues
            const response = await fetch(
                `http://localhost:3002/api/geocode?q=${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 403) {
                    throw new Error('Location search temporarily unavailable. Please try again or enter coordinates manually.');
                }
                throw new Error(`Search failed with status ${response.status}`);
            }

            const results = await response.json();

            if (results.length === 0) {
                window.notificationManager?.warning('Location not found. Try a different search term.');
                return;
            }

            const location = results[0];
            const lat = parseFloat(location.lat);
            const lng = parseFloat(location.lon);

            // Update form fields
            document.getElementById('latitude').value = lat.toFixed(6);
            document.getElementById('longitude').value = lng.toFixed(6);

            // Move map to location
            this.map.setView([lat, lng], 13);

            // Update or create marker
            if (this.mapMarker) {
                this.map.removeLayer(this.mapMarker);
            }

            this.mapMarker = L.marker([lat, lng]).addTo(this.map);

            window.notificationManager?.success(`Found: ${location.display_name}`);
        } catch (error) {
            console.error('Location search error:', error);
            // Provide more specific error messages
            if (error.message.includes('Failed to fetch')) {
                window.notificationManager?.error('Location search failed. Please check your internet connection or enter coordinates manually.');
            } else {
                window.notificationManager?.error(error.message || 'Failed to search location. Please try again.');
            }
        }
    }

    // Helper to find a grove by id with normalization to string
    getGroveById(groveId) {
        if (groveId === null || groveId === undefined) return null;
        const idStr = String(groveId);
        return this.groves.find(g => String(g.id) === idStr) || null;
    }

    switchSection(section) {
        console.log('Switching to section:', section);

        // Update active menu item
        document.querySelectorAll('.farmer-dashboard .menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });

        // Update active section
        document.querySelectorAll('.farmer-dashboard .section').forEach(sec => {
            sec.classList.remove('active');
        });

        const targetSection = document.getElementById(`${section}Section`);
        console.log('Target section element:', targetSection);

        if (targetSection) {
            targetSection.classList.add('active');
        }

        this.currentSection = section;

        // Reattach event listeners when switching sections to ensure they're attached to visible elements
        this.setupEventListeners();

        // Load section data
        this.loadSectionData(section);
    }

    async loadSectionData(section) {
        if (!window.walletManager.requireFarmer()) return;

        const farmerAddress = window.walletManager.getAccountId();

        // If user chose to skip verification, treat as a demo bypass and allow access
        if (localStorage.getItem('skipFarmerVerification') === 'true') {
            try {
                // Always allow verification section to reflect current demo bypass status
                if (section === 'verification') {
                    await this.loadVerificationStatus(farmerAddress);
                    return;
                }

                // Load requested section without performing server-side verification check
                switch (section) {
                    case 'groves':
                        await this.loadGroves(farmerAddress);
                        break;
                    case 'harvest':
                        await this.loadHarvests(farmerAddress);
                        break;
                    case 'revenue':
                        await this.loadRevenue(farmerAddress);
                        break;
                    case 'health':
                        await this.loadTreeHealth(farmerAddress);
                        break;
                    case 'pricing':
                        await this.loadPricing();
                        break;
                    case 'transactions':
                        await this.loadTransactionHistory(farmerAddress);
                        break;
                }
                return;
            } catch (error) {
                console.error(`Failed to load ${section} data (demo bypass):`, error);
                window.walletManager.showToast(`Failed to load ${section} data`, 'error');
                return;
            }
        }

        try {
            // Verification is disabled in this build: always allow access
            if (section === 'verification') {
                // Render a verified status to avoid showing forms
                this.renderVerificationStatus({ status: 'verified', demoBypass: true });
                return;
            }

            switch (section) {
                case 'groves':
                    await this.loadGroves(farmerAddress);
                    break;
                case 'harvest':
                    await this.loadHarvests(farmerAddress);
                    break;
                case 'revenue':
                    await this.loadRevenue(farmerAddress);
                    break;
                case 'health':
                    await this.loadTreeHealth(farmerAddress);
                    break;
                case 'pricing':
                    await this.loadPricing();
                    break;
                case 'transactions':
                    await this.loadTransactionHistory(farmerAddress);
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${section} data:`, error);
            window.walletManager.showToast(`Failed to load ${section} data`, 'error');
        }
    }

    async checkVerificationForSection(farmerAddress, section) {
        // Frontend verification disabled — always allow
        return true;
    }

    showVerificationRequired(section) {
        // No-op: verification UI removed in this build. Instead, show a simple message.
        const sectionContainer = document.getElementById(`${section}Section`);
        if (!sectionContainer) return;
        sectionContainer.innerHTML = `<div class="info-card"><p>Feature available (verification disabled).</p></div>`;
    }

    async loadGroves(farmerAddress) {
        // Check cache first
        const cached = this.getCachedData('groves');
        if (cached) {
            this.groves = cached;
            this.renderGroves();
            return;
        }

        window.walletManager.showLoading('Loading groves...');

        try {
            const response = await window.coffeeAPI.getGroves(farmerAddress);

            if (response.success) {
                // Normalize IDs to strings so lookups are consistent
                const groves = (response.groves || []).map(grove => {
                    // Ensure coordinates are properly formatted
                    let coordinates = grove.coordinates;
                    if (!coordinates && (grove.coordinatesLat || grove.coordinatesLng)) {
                        coordinates = {
                            lat: grove.coordinatesLat || 0,
                            lng: grove.coordinatesLng || 0
                        };
                    }

                    return Object.assign({}, grove, {
                        id: String(grove.id),
                        coordinates: coordinates
                    });
                });
                this.groves = groves;
                this.setCachedData('groves', groves);
            } else {
                // Fallback to mock data for testing
                this.groves = [
                    {
                        id: '1',
                        groveName: 'Sunrise Valley Grove',
                        location: 'Costa Rica, Central Valley',
                        coordinates: { lat: 9.7489, lng: -83.7534 },
                        treeCount: 150,
                        coffeeVariety: 'Arabica',
                        expectedYieldPerTree: 4.5,
                        healthScore: 85,
                        verificationStatus: 'verified',
                        createdAt: new Date('2024-01-15').toISOString(),
                        farmerAddress: farmerAddress
                    },
                    {
                        id: '2',
                        groveName: 'henry',
                        location: 'muranga',
                        coordinates: { lat: -0.7269, lng: 37.1500 },
                        treeCount: 10000,
                        coffeeVariety: 'Geisha',
                        expectedYieldPerTree: 100,
                        healthScore: 79,
                        verificationStatus: 'pending',
                        createdAt: new Date('2024-02-20').toISOString(),
                        farmerAddress: farmerAddress
                    }
                ];
                this.setCachedData('groves', this.groves);
            }

            console.log('Loaded groves:', this.groves);
            this.renderGroves();
        } catch (error) {
            console.error('Error loading groves:', error);
            window.walletManager.showToast('Failed to load groves', 'error');
        } finally {
            window.walletManager.hideLoading();
        }
    }

    renderGroves() {
        const container = document.getElementById('grovesGrid');
        if (!container) return;

        if (this.groves.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No groves registered yet</h4>
                    <p>Register your first coffee grove to get started</p>
                    <button class="btn btn-primary" onclick="farmerDashboard.showGroveModal()">
                        Register Grove
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.groves.map(grove => `
            <div class="grove-card">
                <h4>${grove.groveName || 'Unnamed Grove'}</h4>
                <div class="grove-info">
                    <span><strong>Location:</strong> ${grove.location || 'Not specified'}</span>
                    <span><strong>Trees:</strong> ${grove.treeCount || 0}</span>
                    <span><strong>Variety:</strong> ${grove.coffeeVariety || 'Not specified'}</span>
                    <span><strong>Expected Yield:</strong> ${grove.expectedYieldPerTree ? grove.expectedYieldPerTree + ' kg/tree' : 'Not specified'}</span>
                    <span><strong>Health Score:</strong> ${grove.healthScore || 'N/A'}</span>
                    <span><strong>Status:</strong> 
                        <span class="status-badge status-${grove.verificationStatus || 'pending'}">
                            ${grove.verificationStatus || 'pending'}
                        </span>
                    </span>
                </div>
                <div class="grove-actions">
                    <button class="btn btn-secondary" onclick="farmerDashboard.viewGroveDetails('${grove.id}')">
                        View Details
                    </button>
                    <button class="btn btn-primary" onclick="farmerDashboard.reportHarvestForGrove('${grove.id}')">
                        Report Harvest
                    </button>
                </div>
            </div>
        `).join('');
    }

    showGroveModal() {
        console.log('showGroveModal called');

        if (!window.walletManager.requireFarmer()) return;

        // Allow opening the grove modal when demo bypass is active
        if (localStorage.getItem('skipFarmerVerification') === 'true') {
            const modal = document.getElementById('groveModal');
            if (modal) {
                modal.classList.add('active');

                // Reset form
                document.getElementById('groveForm').reset();

                // Clear map marker
                if (this.mapMarker && this.map) {
                    this.map.removeLayer(this.mapMarker);
                    this.mapMarker = null;
                }
            }

            return;
        }

        const modal = document.getElementById('groveModal');
        if (modal) {
            modal.classList.add('active');

            // Reset form
            document.getElementById('groveForm').reset();

            // Clear map marker
            if (this.mapMarker && this.map) {
                this.map.removeLayer(this.mapMarker);
                this.mapMarker = null;
            }
        }
    }

    closeModals() {
        // Close all modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    async handleGroveSubmit(e) {
        e.preventDefault();

        console.debug('handleGroveSubmit called, skipFarmerVerification=', localStorage.getItem('skipFarmerVerification'));

        const formData = new FormData(e.target);
        const groveData = {
            farmerAddress: window.walletManager.getAccountId(),
            groveName: formData.get('groveName'),
            location: formData.get('location'),
            coordinates: {
                lat: parseFloat(formData.get('latitude')),
                lng: parseFloat(formData.get('longitude'))
            },
            treeCount: parseInt(formData.get('treeCount')),
            coffeeVariety: formData.get('coffeeVariety'),
            expectedYieldPerTree: parseFloat(formData.get('expectedYield'))
        };

        // If the user chose "Maybe Later" (demo bypass), perform a local registration
        // instead of calling the server which enforces verification.
        if (localStorage.getItem('skipFarmerVerification') === 'true') {
            try {
                // Create a simple demo grove entry and add to local list
                const demoGrove = Object.assign({}, groveData, {
                    id: String(Date.now()),
                    healthScore: Math.floor(Math.random() * 20) + 75,
                    verificationStatus: 'verified',
                    createdAt: new Date().toISOString()
                });

                this.groves.push(demoGrove);
                this.renderGroves();
                this.closeModals();
                window.walletManager.showToast('Grove registered (demo bypass)', 'success');
            } catch (err) {
                console.error('Demo grove registration failed:', err);
                window.walletManager.showToast('Failed to register grove (demo)', 'error');
            }

            return;
        }

        try {
            window.walletManager.showLoading('Registering grove...');

            const response = await window.coffeeAPI.registerGrove(groveData);

            if (response.success) {
                this.clearCache('groves'); // Invalidate cache
                window.walletManager.showToast('Grove registered successfully!', 'success');
                this.closeModals();
                await this.loadGroves(groveData.farmerAddress);
            } else {
                throw new Error(response.error || 'Failed to register grove');
            }
        } catch (error) {
            console.error('Grove registration failed:', error);
            const msg = error?.message || 'Failed to register grove';
            window.walletManager.showToast(msg, 'error');
        } finally {
            window.walletManager.hideLoading();
        }
    }

    async loadHarvests(farmerAddress) {
        // Check cache first
        const cached = this.getCachedData('harvests');
        if (cached) {
            this.harvests = cached;
            this.renderHarvests();
            await this.populateGroveSelect();
            return;
        }

        window.walletManager.showLoading('Loading harvest history...');

        try {
            const response = await window.coffeeAPI.getHarvestHistory(farmerAddress);
            console.log('Harvest history response:', response);
            console.log('Response data:', response.data);
            console.log('Response harvests:', response.harvests);

            if (response.success) {
                // Fix: Access harvests from response.data.harvests
                const harvests = response.data?.harvests || response.harvests || [];
                this.harvests = harvests;
                this.setCachedData('harvests', harvests);
                console.log('Loaded harvests:', this.harvests);
                console.log('Number of harvests:', this.harvests.length);
                this.renderHarvests();
                await this.populateGroveSelect();
            }
        } finally {
            window.walletManager.hideLoading();
        }
    }

    renderHarvests() {
        const container = document.getElementById('harvestList');
        console.log('renderHarvests called, container:', container);
        console.log('Harvests to render:', this.harvests);

        if (!container) {
            console.error('harvestList container not found!');
            return;
        }

        if (this.harvests.length === 0) {
            console.log('No harvests to display');
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No harvest reports yet</h4>
                    <p>Report your first harvest to start tracking revenue</p>
                </div>
            `;
            return;
        }

        console.log('Rendering', this.harvests.length, 'harvests');

        container.innerHTML = this.harvests.map(harvest => `
            <div class="list-item">
                <div class="list-item-header">
                    <h4>${harvest.groveName}</h4>
                    <span class="status-badge status-${harvest.revenueDistributed ? 'distributed' : 'pending'}">
                        ${harvest.revenueDistributed ? 'Distributed' : 'Pending'}
                    </span>
                </div>
                <div class="list-item-content">
                    <div class="list-item-detail">
                        <label>Harvest Date</label>
                        <span>${new Date(harvest.harvestDate).toLocaleDateString()}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Yield</label>
                        <span>${harvest.yieldKg} kg</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Quality Grade</label>
                        <span>${harvest.qualityGrade}/10</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Sale Price</label>
                        <span>$${harvest.salePricePerKg}/kg</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Total Revenue</label>
                        <span>$${harvest.totalRevenue}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async populateGroveSelect() {
        const select = document.getElementById('harvestGrove');
        if (!select) return;

        // Clear existing options except the first one
        select.innerHTML = '<option value="">Select a grove</option>';

        this.groves.forEach(grove => {
            const option = document.createElement('option');
            option.value = grove.id;
            option.textContent = grove.groveName;
            select.appendChild(option);
        });
    }

    showHarvestModal() {
        if (!window.walletManager.requireFarmer()) return;

        const modal = document.getElementById('harvestModal');
        if (modal) {
            modal.classList.add('active');

            // Reset form
            const form = document.getElementById('harvestForm');
            if (form) {
                form.reset();
            }

            // Set default date to today
            const dateInput = document.getElementById('harvestDate');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }

            // Populate grove options
            this.populateHarvestGroveOptions();

            // Pre-select grove if one was specified
            if (this.selectedGroveForHarvest) {
                setTimeout(() => {
                    const select = document.getElementById('harvestGrove');
                    if (select) {
                        select.value = this.selectedGroveForHarvest;
                        select.dispatchEvent(new Event('change'));

                        // Find the grove name for confirmation
                        const grove = this.getGroveById(this.selectedGroveForHarvest);
                        if (grove) {
                            window.walletManager.showToast(`Grove "${grove.groveName}" pre-selected`, 'info');
                        }
                    }
                    // Clear the selection after use
                    this.selectedGroveForHarvest = null;
                }, 100);
            }
        } else {
            window.walletManager.showToast('Harvest modal not found. Please refresh the page.', 'error');
        }
    }

    populateHarvestGroveOptions() {
        const select = document.getElementById('harvestGrove');
        if (!select) return;

        // Clear existing options except the first one
        select.innerHTML = '<option value="">Select a grove</option>';

        // Add grove options
        this.groves.forEach(grove => {
            const option = document.createElement('option');
            option.value = grove.id;
            option.textContent = `${grove.groveName} (${grove.treeCount} trees)`;
            select.appendChild(option);
        });
    }

    reportHarvestForGrove(groveId) {
        console.log('reportHarvestForGrove called with groveId:', groveId);

        if (!window.walletManager.requireFarmer()) return;

        // Allow reporting harvest when demo bypass is active
        if (localStorage.getItem('skipFarmerVerification') === 'true') {
            const grove = this.getGroveById(groveId);
            if (!grove) {
                window.walletManager.showToast('Grove not found', 'error');
                return;
            }

            this.selectedGroveForHarvest = groveId;
            this.switchSection('harvest');
            setTimeout(() => {
                this.showGroveSelectionBanner(grove);
            }, 100);
            window.walletManager.showToast(`Navigated to harvest reporting for "${grove.groveName}"`, 'success');
            setTimeout(() => {
                this.showHarvestModal();
            }, 800);

            return;
        }

        const grove = this.getGroveById(groveId);
        if (!grove) {
            console.error('Grove not found for ID:', groveId);
            window.walletManager.showToast('Grove not found', 'error');
            return;
        }

        console.log('Found grove for harvest:', grove);

        // Store the selected grove for pre-selection
        this.selectedGroveForHarvest = groveId;

        // Switch to harvest section
        this.switchSection('harvest');

        // Add a visual indicator in the harvest section
        setTimeout(() => {
            this.showGroveSelectionBanner(grove);
        }, 100);

        // Show success message with grove name
        window.walletManager.showToast(`Navigated to harvest reporting for "${grove.groveName}"`, 'success');

        // Auto-open the harvest form after a short delay
        setTimeout(() => {
            this.showHarvestModal();
        }, 800);
    }

    async handleHarvestSubmit(e) {
        e.preventDefault();

        // Prevent multiple submissions
        if (this.isSubmittingHarvest) {
            window.walletManager.showToast('Harvest report is already being submitted. Please wait.', 'warning');
            return;
        }

        const formData = new FormData(e.target);
        const groveId = formData.get('groveId');

        // Get the grove name from the grove ID
        const grove = this.getGroveById(groveId);
        if (!grove) {
            window.walletManager.showToast('Selected grove not found', 'error');
            return;
        }

        const harvestData = {
            farmerAddress: window.walletManager.getAccountId(),
            groveName: grove.groveName, // Send groveName instead of groveId
            harvestDate: formData.get('harvestDate'),
            yieldKg: parseFloat(formData.get('yieldKg')),
            qualityGrade: parseInt(formData.get('qualityGrade')),
            salePricePerKg: parseFloat(formData.get('salePrice')),
            notes: formData.get('notes')
        };

        // Validate required fields
        if (!harvestData.harvestDate || !harvestData.yieldKg || !harvestData.qualityGrade) {
            window.walletManager.showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            this.isSubmittingHarvest = true; // Set loading state
            window.walletManager.showLoading('Submitting harvest report...');

            const response = await window.coffeeAPI.reportHarvest(harvestData);

            if (response.success) {
                this.clearCache('harvests'); // Invalidate cache
                    window.walletManager.showToast('Harvest reported successfully!', 'success');
                this.closeModals();
                await this.loadHarvests(harvestData.farmerAddress);
            } else {
                throw new Error(response.error || 'Failed to report harvest');
            }
        } catch (error) {
            console.error('Harvest reporting failed:', error);
            window.walletManager.showToast('Failed to report harvest: ' + error.message, 'error');
        } finally {
            this.isSubmittingHarvest = false; // Reset loading state
            window.walletManager.hideLoading();
        }
    }

    /**
     * Load revenue data for the farmer
     * @param {string} farmerAddress - Farmer's wallet address
     */
    async loadRevenue(farmerAddress) {
        window.walletManager.showLoading('Loading revenue data...');

        try {
            // Load groves first if not already loaded
            if (this.groves.length === 0) {
                await this.loadGroves(farmerAddress);
            }

            // Fetch all revenue data concurrently but with better error handling
            let statsResponse, earningsResponse, withdrawalsResponse;
            
            try {
                statsResponse = await window.coffeeAPI.getHarvestStats(farmerAddress);
            } catch (error) {
                console.error('Failed to load harvest stats:', error);
                statsResponse = { success: false, error: error.message };
            }
            
            try {
                earningsResponse = await window.coffeeAPI.getHolderEarnings(farmerAddress);
            } catch (error) {
                console.error('Failed to load earnings:', error);
                earningsResponse = { success: false, error: error.message };
            }
            
            try {
                withdrawalsResponse = await window.coffeeAPI.getFarmerWithdrawalHistory(farmerAddress);
            } catch (error) {
                console.error('Failed to load withdrawal history:', error);
                withdrawalsResponse = { success: false, error: error.message };
            }

            // Render revenue statistics
            if (statsResponse.success) {
                // Handle both 'stats' and 'data' response formats
                const stats = statsResponse.stats || statsResponse.data;
                this.renderRevenueStats(stats);
            } else {
                console.warn('Failed to load stats:', statsResponse.error);
                // Render with default values
                this.renderRevenueStats({
                    totalEarnings: 0,
                    monthlyEarnings: 0,
                    pendingDistributions: 0,
                    availableBalance: 0,
                    pendingBalance: 0,
                    totalWithdrawn: 0
                });
            }

            // Render revenue chart
            if (earningsResponse.success && earningsResponse.data) {
                this.renderRevenueChart(earningsResponse.data.distributionHistory || []);
            } else {
                console.warn('Failed to load earnings for chart:', earningsResponse?.error);
                // Render empty chart
                this.renderRevenueChart([]);
            }

            // Render distributions
            if (earningsResponse.success && earningsResponse.data && earningsResponse.data.distributionHistory) {
                this.renderDistributions(earningsResponse.data.distributionHistory);
            } else {
                console.warn('Failed to load distributions:', earningsResponse?.error);
                // Render empty distributions
                this.renderDistributions([]);
            }

            // Render withdrawal history
            if (withdrawalsResponse.success) {
                this.renderWithdrawalHistory(withdrawalsResponse.withdrawals);
            } else {
                console.warn('Failed to load withdrawal history:', withdrawalsResponse?.error);
                // Render empty withdrawal history
                this.renderWithdrawalHistory([]);
            }

            // Populate the withdrawal grove dropdown
            this.populateWithdrawalGroveSelect();

            // Update withdrawal form balances
            const stats = statsResponse.success ? (statsResponse.stats || statsResponse.data) : {
                totalEarnings: 0,
                monthlyEarnings: 0,
                pendingDistributions: 0,
                availableBalance: 0,
                pendingBalance: 0,
                totalWithdrawn: 0
            };
            this.updateWithdrawalBalances(stats);
        } catch (error) {
            console.error('Failed to load revenue data:', error);
            window.walletManager.showToast('Failed to load revenue data: ' + error.message, 'error');
        } finally {
            window.walletManager.hideLoading();
        }
    }

    /**
     * Render revenue statistics
     * @param {Object} stats - Revenue statistics data
     */
    renderRevenueStats(stats) {
        if (!stats) return;

        // Ensure values are numbers before calling toFixed
        const totalEarnings = typeof stats.totalEarnings === 'number' ? stats.totalEarnings : parseFloat(stats.totalEarnings) || 0;
        const monthlyEarnings = typeof stats.monthlyEarnings === 'number' ? stats.monthlyEarnings : parseFloat(stats.monthlyEarnings) || 0;
        const pendingDistributions = typeof stats.pendingDistributions === 'number' ? stats.pendingDistributions : parseFloat(stats.pendingDistributions) || 0;
        const availableBalance = typeof stats.availableBalance === 'number' ? stats.availableBalance : parseFloat(stats.availableBalance) || 0;
        const pendingBalance = typeof stats.pendingBalance === 'number' ? stats.pendingBalance : parseFloat(stats.pendingBalance) || 0;
        const totalWithdrawn = typeof stats.totalWithdrawn === 'number' ? stats.totalWithdrawn : parseFloat(stats.totalWithdrawn) || 0;

        document.getElementById('totalEarnings').textContent = `$${totalEarnings.toFixed(2)}`;
        document.getElementById('monthlyEarnings').textContent = `$${monthlyEarnings.toFixed(2)}`;
        document.getElementById('pendingDistributions').textContent = `$${pendingDistributions.toFixed(2)}`;

        // Update withdrawal card stats
        document.getElementById('farmerAvailableBalance').textContent = `$${availableBalance.toFixed(2)}`;
        document.getElementById('farmerPendingBalance').textContent = `$${pendingBalance.toFixed(2)}`;
        document.getElementById('farmerTotalWithdrawn').textContent = `$${totalWithdrawn.toFixed(2)}`;

        // Update withdrawal help text
        const helpText = document.getElementById('withdrawalHelp');
        if (helpText) {
            helpText.textContent = `Available: $${availableBalance.toFixed(2)}`;
        }
    }

    /**
     * Render revenue chart
     * @param {Array} earningsHistory - Earnings history data
     */
    renderRevenueChart(earningsHistory) {
        const canvas = document.getElementById('revenueChart');
        if (!canvas || !earningsHistory) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (this.revenueChart) {
            this.revenueChart.destroy();
        }

        // Prepare chart data
        const labels = earningsHistory.map(e => new Date(e.date).toLocaleDateString());
        const data = earningsHistory.map(e => e.amount);

        this.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue',
                    data: data,
                    borderColor: '#8B4513',
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    tension: 0.4,
                    fill: true
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
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Render distributions list
     * @param {Array} distributions - Distributions data
     */
    renderDistributions(distributions) {
        const container = document.getElementById('distributionsList');
        if (!container) return;

        if (!distributions || distributions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No distributions found</p>
                    <small>Distributions will appear here when harvests are processed</small>
                </div>
            `;
            return;
        }

        container.innerHTML = distributions.map(dist => `
            <div class="list-item">
                <div class="list-item-header">
                    <h4>Distribution #${dist.id || dist.distributionId}</h4>
                    <span class="text-success">$${(dist.amount || dist.shareAmount || 0).toFixed(2)}</span>
                </div>
                <div class="list-item-content">
                    <div class="list-item-detail">
                        <label>Date</label>
                        <span>${new Date(dist.date || dist.distributionDate).toLocaleDateString()}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Grove</label>
                        <span>${dist.groveName || 'Unknown Grove'}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Harvest</label>
                        <span>${dist.harvestId || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render withdrawal history
     * @param {Array} withdrawals - Withdrawals data
     */
    renderWithdrawalHistory(withdrawals) {
        const container = document.getElementById('withdrawalHistoryList');
        if (!container) return;

        if (!withdrawals || withdrawals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No withdrawal history</p>
                    <small>Your withdrawal history will appear here</small>
                </div>
            `;
            return;
        }

        container.innerHTML = withdrawals.map(withdrawal => `
            <div class="list-item">
                <div class="list-item-header">
                    <h4>Withdrawal</h4>
                    <span class="text-success">$${(withdrawal.amount || 0).toFixed(2)}</span>
                </div>
                <div class="list-item-content">
                    <div class="list-item-detail">
                        <label>Date</label>
                        <span>${new Date(withdrawal.timestamp || withdrawal.date).toLocaleDateString()}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Status</label>
                        <span class="status-${withdrawal.status || 'completed'}">${(withdrawal.status || 'completed').toUpperCase()}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Transaction</label>
                        <span>${withdrawal.transactionHash ? withdrawal.transactionHash.substring(0, 10) + '...' : 'N/A'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update withdrawal form balances
     * @param {Object} stats - Revenue statistics
     */
    updateWithdrawalBalances(stats) {
        if (!stats) return;

        const availableBalance = stats.availableBalance || 0;
        const helpText = document.getElementById('withdrawalHelp');
        if (helpText) {
            helpText.textContent = `Available: $${availableBalance.toFixed(2)}`;
        }
    }

    /**
     * Populate the withdrawal grove select dropdown
     */
    populateWithdrawalGroveSelect() {
        const select = document.getElementById('withdrawalGrove');
        if (!select) return;

        // Clear existing options except the first one
        select.innerHTML = '<option value="">Select a grove</option>';

        // Add grove options
        this.groves.forEach(grove => {
            const option = document.createElement('option');
            option.value = grove.id;
            option.textContent = `${grove.groveName} (${grove.treeCount} trees)`;
            select.appendChild(option);
        });
    }

    /**
     * Display projected revenue data in the UI
     * @param {Object} revenueData - Revenue data from the API
     */
    displayProjectedRevenue(revenueData) {
        // Show the projected revenue section
        const projectedSection = document.getElementById('projectedRevenueSection');
        if (projectedSection) {
            projectedSection.style.display = 'block';
        }

        // Update revenue values
        if (revenueData.data) {
            const data = revenueData.data;
            document.getElementById('projectedTotal').textContent = `$${data.projectedRevenue.toFixed(2)}`;
            document.getElementById('projectedFarmerShare').textContent = `$${(data.projectedRevenue * 0.3).toFixed(2)}`;
            document.getElementById('projectedInvestorShare').textContent = `$${(data.projectedRevenue * 0.7).toFixed(2)}`;

            // Update price breakdown
            document.getElementById('basePrice').textContent = `$${data.basePrice.toFixed(2)}`;
            document.getElementById('seasonalMultiplier').textContent = data.seasonalMultiplier.toFixed(2);
        }
    }

    /**
     * Update projected revenue display based on form inputs
     */
    async updateProjectedRevenue() {
        // Get form values
        const groveSelect = document.getElementById('harvestGrove');
        const yieldKgInput = document.getElementById('yieldKg');
        const qualityGradeInput = document.getElementById('qualityGrade');
        const coffeeVarietySelect = document.getElementById('coffeeVariety');
        const harvestDateInput = document.getElementById('harvestDate');

        // Check if all required elements exist
        if (!groveSelect || !yieldKgInput || !qualityGradeInput || !coffeeVarietySelect || !harvestDateInput) {
            return;
        }

        // Get values
        const groveId = groveSelect.value;
        const yieldKg = parseFloat(yieldKgInput.value);
        const qualityGrade = parseInt(qualityGradeInput.value);
        // Fix: Convert coffee variety to uppercase to match backend expectations
        const coffeeVariety = coffeeVarietySelect.value.toUpperCase();
        const harvestDate = harvestDateInput.value;

        // Validate required inputs
        if (!groveId || !yieldKg || isNaN(yieldKg) || !qualityGrade || isNaN(qualityGrade) || !coffeeVariety || !harvestDate) {
            // Hide projected revenue section if inputs are invalid
            const projectedSection = document.getElementById('projectedRevenueSection');
            if (projectedSection) {
                projectedSection.style.display = 'none';
            }
            return;
        }

        try {
            // Get the grove to get the groveTokenAddress
            const grove = this.getGroveById(groveId);
            if (!grove) {
                console.error('Grove not found for ID:', groveId);
                return;
            }

            // Get harvest month (1-12)
            const harvestMonth = new Date(harvestDate).getMonth() + 1;

            // Call price oracle to calculate projected revenue
            const revenueData = await window.priceOracle.calculateProjectedRevenue(
                grove.id, // groveTokenAddress
                coffeeVariety,
                qualityGrade,
                yieldKg,
                harvestMonth
            );

            // Update the UI with projected revenue data
            // Check if displayProjectedRevenue method exists, if not use a fallback
            if (typeof this.displayProjectedRevenue === 'function') {
                this.displayProjectedRevenue(revenueData);
            } else {
                // Fallback implementation
                const projectedSection = document.getElementById('projectedRevenueSection');
                if (projectedSection && revenueData.data) {
                    projectedSection.style.display = 'block';
                    document.getElementById('projectedTotal').textContent = `$${revenueData.data.projectedRevenue.toFixed(2)}`;
                    document.getElementById('projectedFarmerShare').textContent = `$${(revenueData.data.projectedRevenue * 0.3).toFixed(2)}`;
                    document.getElementById('projectedInvestorShare').textContent = `$${(revenueData.data.projectedRevenue * 0.7).toFixed(2)}`;
                    document.getElementById('basePrice').textContent = `$${revenueData.data.basePrice.toFixed(2)}`;
                    document.getElementById('seasonalMultiplier').textContent = revenueData.data.seasonalMultiplier.toFixed(2);
                }
            }
        } catch (error) {
            console.error('Error calculating projected revenue:', error);
            // Hide projected revenue section on error
            const projectedSection = document.getElementById('projectedRevenueSection');
            if (projectedSection) {
                projectedSection.style.display = 'none';
            }
        }
    }

    async loadTreeHealth(farmerAddress) {
        window.walletManager.showLoading('Loading tree health data...');

        try {
            // Mock health data for now
            const healthData = this.groves.map(grove => ({
                groveId: grove.id,
                groveName: grove.groveName,
                healthScore: grove.healthScore || Math.floor(Math.random() * 30) + 70,
                lastUpdate: new Date().toISOString(),
                issues: Math.random() > 0.7 ? ['Low soil moisture', 'Pest activity detected'] : [],
                recommendations: ['Regular watering', 'Organic fertilizer application']
            }));

            this.renderTreeHealth(healthData);
        } finally {
            window.walletManager.hideLoading();
        }
    }

    renderTreeHealth(healthData) {
        const container = document.getElementById('healthOverview');
        if (!container) return;

        container.innerHTML = healthData.map(health => {
            const scoreClass = health.healthScore >= 80 ? 'success' :
                health.healthScore >= 60 ? 'warning' : 'danger';

            return `
                <div class="health-card ${scoreClass}">
                    <h4>${health.groveName}</h4>
                    <div class="health-score ${scoreClass}">${health.healthScore}</div>
                    <p>Health Score</p>
                    
                    ${health.issues.length > 0 ? `
                        <div class="health-issues">
                            <h5>Issues:</h5>
                            <ul>
                                ${health.issues.map(issue => `<li>${issue}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="health-recommendations">
                        <h5>Recommendations:</h5>
                        <ul>
                            ${health.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <small>Last updated: ${new Date(health.lastUpdate).toLocaleDateString()}</small>
                </div>
            `;
        }).join('');
    }

    async loadVerificationStatus(farmerAddress) {
        // Verification disabled: show verified status
        this.renderVerificationStatus({ status: 'verified', demoBypass: true });
    }

    renderVerificationStatus(verification) {
        const statusContainer = document.getElementById('verificationStatus');
        const formContainer = document.getElementById('verificationForm');

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
                        <p class="text-success">Your farmer credentials have been verified!</p>
                        <p>Verified on: ${new Date(verification.verificationDate).toLocaleDateString()}</p>
                    ` : verification.status === 'rejected' ? `
                        <p class="text-danger">Your verification was rejected.</p>
                        <p>Reason: ${verification.rejectionReason}</p>
                        <p>Please resubmit your documents with the required corrections.</p>
                    ` : ''}
                </div>
            `;

            // Hide form if verified
            if (verification.status === 'verified') {
                formContainer.style.display = 'none';
            } else {
                formContainer.style.display = 'block';
            }
        } else {
            // Show pending or no verification
            statusContainer.innerHTML = verification ? `
                <div class="verification-status-card">
                    <h4>Verification Status</h4>
                    <div class="status-badge status-pending">PENDING</div>
                    <p>Your documents are being reviewed. This process typically takes 2-3 business days.</p>
                </div>
            ` : `
                <div class="verification-status-card">
                    <h4>Verification Required</h4>
                    <p>Please submit your verification documents to access all farmer features.</p>
                </div>
            `;

            formContainer.style.display = 'block';
        }
    }

    async handleDocumentsSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const files = {
            landOwnership: formData.get('landOwnership'),
            farmingLicense: formData.get('farmingLicense'),
            identityDocument: formData.get('identityDocument')
        };

        // Validate files
        if (!files.landOwnership || !files.farmingLicense || !files.identityDocument) {
            window.walletManager.showToast('Please select all required documents', 'error');
            return;
        }

        try {
            window.walletManager.showLoading('Uploading documents...');

            // Upload files (mock implementation)
            const uploadPromises = Object.entries(files).map(async ([key, file]) => {
                const response = await window.coffeeAPI.uploadFile(file);
                return { [key]: response.fileHash };
            });

            const uploadResults = await Promise.all(uploadPromises);
            const documents = Object.assign({}, ...uploadResults);

            // Submit verification
            const response = await window.coffeeAPI.submitVerificationDocuments(
                window.walletManager.getAccountId(),
                documents
            );

            if (response.success) {
                window.walletManager.showToast('Documents submitted successfully!', 'success');
                await this.loadVerificationStatus(window.walletManager.getAccountId());
            }
        } catch (error) {
            console.error('Document submission failed:', error);
            window.walletManager.showToast('Failed to submit documents', 'error');
        } finally {
            window.walletManager.hideLoading();
        }
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    async viewGroveDetails(groveId) {
        console.log('viewGroveDetails called with groveId:', groveId, 'typeof:', typeof groveId);
        console.log('Available groves (count):', this.groves.length);

        // Try normalized string lookup first
        let grove = this.getGroveById(groveId);

        // Fallbacks: loose equality or numeric comparison
        if (!grove) {
            grove = this.groves.find(g => g.id == groveId) || this.groves.find(g => Number(g.id) === Number(groveId));
        }

        // If still not found, attempt to reload groves once (may fix timing issues)
        if (!grove) {
            try {
                console.warn('Grove not found locally. Attempting to reload groves and retry lookup for ID:', groveId);
                const farmerAddress = window.walletManager?.getAccountId();
                if (farmerAddress) {
                    await this.loadGroves(farmerAddress);
                }
            } catch (err) {
                console.error('Failed to reload groves during lookup:', err);
            }

            // Retry lookups after reload
            grove = this.getGroveById(groveId) || this.groves.find(g => g.id == groveId) || this.groves.find(g => Number(g.id) === Number(groveId));
        }

        if (!grove) {
            // Diagnostic: log available IDs and types to help debugging
            const availableIds = this.groves.map(g => ({ id: g.id, type: typeof g.id }));
            console.error('Grove not found for ID:', groveId, 'available grove ids:', availableIds);
            window.walletManager.showToast('Grove not found', 'error');
            return;
        }

        console.log('Found grove:', grove);

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
                        
                        <div class="detail-section">
                            <h5>Status & Performance</h5>
                            <div class="detail-row">
                                <span class="label">Health Score:</span>
                                <span class="value health-score ${this.getHealthClass(grove.healthScore)}">${grove.healthScore}/100</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Verification Status:</span>
                                <span class="value status-${grove.verificationStatus}">${grove.verificationStatus.toUpperCase()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Registration Date:</span>
                                <span class="value">${new Date(grove.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Total Expected Annual Yield:</span>
                                <span class="value">${(grove.treeCount * grove.expectedYieldPerTree).toFixed(1)} kg</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h5>Location Details</h5>
                            <div class="detail-row">
                                <span class="label">Coordinates:</span>
                                <span class="value">${grove.coordinates.lat.toFixed(4)}, ${grove.coordinates.lng.toFixed(4)}</span>
                            </div>
                            <div class="grove-map-preview" id="groveMapPreview"></div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-secondary modal-close">Close</button>
                        <button class="btn btn-primary" onclick="farmerDashboard.reportHarvestForGrove('${grove.id}'); document.body.removeChild(this.closest('.modal'));">
                            Report Harvest
                        </button>
                        <button class="btn btn-warning" onclick="farmerDashboard.editGrove('${grove.id}'); document.body.removeChild(this.closest('.modal'));">
                            Edit Grove
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

        // Initialize mini map
        setTimeout(() => {
            this.initGroveMapPreview(grove);
        }, 100);
    }

    initGroveMapPreview(grove) {
        const mapContainer = document.getElementById('groveMapPreview');
        if (!mapContainer || !window.L) return;

        // Create mini map
        const miniMap = L.map('groveMapPreview', {
            center: [grove.coordinates.lat, grove.coordinates.lng],
            zoom: 13,
            zoomControl: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            dragging: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(miniMap);

        // Add marker
        L.marker([grove.coordinates.lat, grove.coordinates.lng])
            .addTo(miniMap)
            .bindPopup(`<b>${grove.groveName}</b><br>${grove.location}`)
            .openPopup();
    }

    getHealthClass(score) {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'danger';
    }

    editGrove(groveId) {
        // For now, just show a message - this could be implemented later
        window.walletManager.showToast('Grove editing feature coming soon!', 'info');
    }

    showGroveSelectionBanner(grove) {
        // Remove any existing banner
        const existingBanner = document.querySelector('.grove-selection-banner');
        if (existingBanner) {
            existingBanner.remove();
        }

        // Create new banner
        const banner = document.createElement('div');
        banner.className = 'grove-selection-banner';
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-info">
                    <h4>🌱 Reporting harvest for: ${grove.groveName}</h4>
                    <p>${grove.location} • ${grove.coffeeVariety} • ${grove.treeCount} trees</p>
                </div>
                <button class="banner-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Insert banner at the top of harvest section
        const harvestSection = document.getElementById('harvestSection');
        if (harvestSection) {
            const sectionHeader = harvestSection.querySelector('.section-header');
            if (sectionHeader) {
                sectionHeader.insertAdjacentElement('afterend', banner);
            }
        }

        // Auto-remove banner after 10 seconds
        setTimeout(() => {
            if (banner.parentElement) {
                banner.remove();
            }
        }, 10000);
    }

    /**
     * Handle withdrawal form submission
     * @param {Event} e - Form submission event
     */
    async handleWithdrawalSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const groveId = formData.get('groveId');
        const amount = parseFloat(formData.get('amount'));

        // Validate inputs
        if (!groveId) {
            window.walletManager.showToast('Please select a grove', 'error');
            return;
        }

        if (!amount || amount <= 0) {
            window.walletManager.showToast('Please enter a valid withdrawal amount', 'error');
            return;
        }

        try {
            window.walletManager.showLoading('Processing withdrawal...');

            // Get farmer address
            const farmerAddress = window.walletManager.getAccountId();

            // Check if amount exceeds farmer's available balance (30% share)
            const balanceResponse = await window.coffeeAPI.getFarmerBalance(farmerAddress);
            if (balanceResponse.success) {
                const availableBalance = parseFloat(balanceResponse.data.availableBalance || 0);

                if (amount > availableBalance) {
                    window.walletManager.hideLoading();
                    window.walletManager.showToast(`Amount exceeds available balance. Maximum withdrawable: $${availableBalance.toFixed(2)}`, 'error');
                    return;
                }
            }

            // Submit withdrawal request
            const response = await window.coffeeAPI.withdrawFarmerShare(groveId, amount, farmerAddress);

            if (response.success) {
                window.walletManager.showToast('Withdrawal processed successfully!', 'success');

                // Reset form
                e.target.reset();

                // Refresh revenue data
                await this.loadRevenue(farmerAddress);
            } else {
                throw new Error(response.error || 'Failed to process withdrawal');
            }
        } catch (error) {
            console.error('Withdrawal failed:', error);
            window.walletManager.showToast(`Failed to process withdrawal: ${error.message}`, 'error');
        } finally {
            window.walletManager.hideLoading();
        }
    }

    /**
     * Handle "Max" button click for withdrawal
     */
    async handleWithdrawMax() {
        try {
            // Get farmer address
            const farmerAddress = window.walletManager.getAccountId();

            // Get farmer's actual balance
            const balanceResponse = await window.coffeeAPI.getFarmerBalance(farmerAddress);

            const availableBalanceEl = document.getElementById('farmerAvailableBalance');
            const amountInput = document.getElementById('withdrawalAmount');
            const helpText = document.getElementById('withdrawalHelp');

            if (availableBalanceEl && amountInput && helpText) {
                let balance = 0;

                if (balanceResponse.success) {
                    balance = parseFloat(balanceResponse.data.availableBalance || 0);
                } else {
                    // Fallback to displayed balance if API call fails
                    const balanceText = availableBalanceEl.textContent;
                    balance = parseFloat(balanceText.replace(/[^0-9.-]+/g, ''));
                }

                if (!isNaN(balance) && balance > 0) {
                    amountInput.value = balance.toFixed(2);
                    helpText.textContent = `Available: $${balance.toFixed(2)}`;
                }
            }
        } catch (error) {
            console.error('Failed to get max withdrawal amount:', error);
            window.walletManager.showToast('Failed to calculate max withdrawal amount', 'error');
        }
    }

    /**
     * Update the quality grade display when the slider changes
     */
    updateQualityGradeDisplay() {
        const qualityGradeSlider = document.getElementById('qualityGrade');
        const gradeValue = document.getElementById('gradeValue');
        const gradeDescription = document.getElementById('gradeDescription');
        
        if (qualityGradeSlider && gradeValue && gradeDescription) {
            const grade = parseInt(qualityGradeSlider.value);
            gradeValue.textContent = grade;
            gradeDescription.textContent = this.getGradeDescription(grade);
        }
    }

    /**
     * Validate the sale price input
     */
    async validateSalePrice() {
        const salePriceInput = document.getElementById('salePrice');
        const suggestedPriceInfo = document.getElementById('suggestedPriceInfo');
        const suggestedPriceEl = document.getElementById('suggestedPrice');
        const priceValidation = document.getElementById('priceValidation');
        
        if (!salePriceInput || !suggestedPriceInfo || !suggestedPriceEl || !priceValidation) {
            return;
        }

        const salePrice = parseFloat(salePriceInput.value);
        if (isNaN(salePrice) || salePrice <= 0) {
            suggestedPriceInfo.style.display = 'none';
            return;
        }

        // Get other form values needed for validation
        const coffeeVarietySelect = document.getElementById('coffeeVariety');
        const qualityGradeSlider = document.getElementById('qualityGrade');
        
        if (!coffeeVarietySelect || !qualityGradeSlider) {
            return;
        }

        const variety = coffeeVarietySelect.value;
        const grade = parseInt(qualityGradeSlider.value);

        try {
            // Use the price oracle to validate the price
            if (window.priceOracle && typeof window.priceOracle.validateSalePrice === 'function') {
                const validationResult = await window.priceOracle.validateSalePrice(variety, grade, salePrice);
                
                if (validationResult.success) {
                    const data = validationResult.data;
                    suggestedPriceEl.textContent = `$${data.marketPrice.toFixed(2)}`;
                    suggestedPriceInfo.style.display = 'block';
                    
                    if (data.isValid) {
                        priceValidation.textContent = 'Price is within acceptable range';
                        priceValidation.className = 'validation-message success';
                    } else {
                        priceValidation.textContent = data.message;
                        priceValidation.className = 'validation-message error';
                    }
                }
            } else {
                // Fallback: show basic validation
                suggestedPriceInfo.style.display = 'none';
            }
        } catch (error) {
            console.error('Error validating sale price:', error);
            suggestedPriceInfo.style.display = 'none';
        }
    }

    /**
     * Get grade description based on grade value
     * @param {number} grade - Grade value (1-10)
     * @returns {string} Grade description
     */
    getGradeDescription(grade) {
        if (grade <= 3) return 'Low Quality';
        if (grade <= 6) return 'Medium Quality';
        if (grade <= 8) return 'High Quality';
        return 'Premium Quality';
    }

    /**
     * Load transaction history for the farmer
     * @param {string} farmerAddress - Farmer's wallet address
     */
    async loadTransactionHistory(farmerAddress) {
        window.walletManager.showLoading('Loading transaction history...');

        try {
            const response = await window.coffeeAPI.getTransactionHistory(farmerAddress);

            if (response.success) {
                this.renderTransactionHistory(response.transactions);
            }
        } catch (error) {
            console.error('Failed to load transaction history:', error);
            window.walletManager.showToast('Failed to load transaction history', 'error');
        } finally {
            window.walletManager.hideLoading();
        }
    }

    /**
     * Render transaction history
     * @param {Array} transactions - Transaction history data
     */
    renderTransactionHistory(transactions) {
        const container = document.getElementById('farmerTransactionsList');
        if (!container) return;

        if (!transactions || transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No transactions found</p>
                </div>
            `;
            return;
        }

        // Sort transactions by timestamp (newest first)
        const sortedTransactions = [...transactions].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        container.innerHTML = sortedTransactions.map(transaction => `
            <div class="list-item transaction-item">
                <div class="list-item-header">
                    <h4>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</h4>
                    <span class="text-success">$${parseFloat(transaction.amount).toFixed(2)}</span>
                </div>
                <div class="list-item-content">
                    <div class="list-item-detail">
                        <label>Date</label>
                        <span>${new Date(transaction.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Status</label>
                        <span class="status-completed">${transaction.status.toUpperCase()}</span>
                    </div>
                    <div class="list-item-detail">
                        <label>Transaction Hash</label>
                        <span>${transaction.transactionHash ? transaction.transactionHash.substring(0, 10) + '...' : 'N/A'}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Update transaction stats
        this.updateTransactionStats(sortedTransactions);
    }

    /**
     * Update transaction statistics
     * @param {Array} transactions - Transaction history data
     */
    updateTransactionStats(transactions) {
        const totalTransactions = transactions.length;
        const totalRevenue = transactions
            .filter(txn => txn.type === 'distribution')
            .reduce((sum, txn) => sum + parseFloat(txn.amount || 0), 0);

        const completedTransactions = transactions
            .filter(txn => txn.status === 'completed')
            .length;

        const pendingTransactions = transactions
            .filter(txn => txn.status === 'pending')
            .length;

        // Update DOM elements
        document.getElementById('farmerTotalTransactions').textContent = totalTransactions;
        document.getElementById('farmerTotalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('farmerCompletedTransactions').textContent = completedTransactions;
        document.getElementById('farmerPendingTransactions').textContent = pendingTransactions;
    }

    /**
     * Load market pricing data
     */
    async loadPricing() {
        console.log('Loading market pricing data...');
        
        // Initialize market prices display if not already done
        if (!window.marketPricesDisplay) {
            window.marketPricesDisplay = new MarketPricesDisplay(window.coffeeAPI);
        }
        
        // Initialize the display
        await window.marketPricesDisplay.initialize();
    }
}

// Create global farmer dashboard instance
window.farmerDashboard = new FarmerDashboard();
