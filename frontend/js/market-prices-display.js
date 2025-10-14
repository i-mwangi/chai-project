/**
 * Market Prices Display Module
 * Displays real-time coffee prices from ICE and other sources
 */

class MarketPricesDisplay {
    constructor(apiClient) {
        this.apiClient = apiClient
        this.selectedVariety = 'ALL'
        this.pricesData = []
        this.lastUpdate = null
        this.refreshInterval = null
    }

    /**
     * Initialize the market prices display
     */
    async initialize() {
        console.log('Initializing Market Prices Display...')
        
        // Set up event listeners
        this.setupEventListeners()
        
        // Load initial prices
        await this.loadPrices()
        
        // Load seasonal multipliers
        await this.loadSeasonalMultipliers()
        
        // Display quality grade pricing
        this.displayQualityGradePricing()
        
        // Start auto-refresh every 5 minutes
        this.startAutoRefresh(5)
        
        console.log('Market Prices Display initialized')
    }

    /**
     * Set up event listeners for filters and refresh
     */
    setupEventListeners() {
        // Variety filter
        const varietyFilter = document.getElementById('priceVarietyFilter')
        if (varietyFilter) {
            varietyFilter.addEventListener('change', (e) => {
                this.selectedVariety = e.target.value
                this.displayPrices()
                this.displayQualityGradePricing()
            })
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshPricesBtn')
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadPrices())
        }
    }

    /**
     * Load prices from API
     */
    async loadPrices() {
        try {
            const refreshBtn = document.getElementById('refreshPricesBtn')
            if (refreshBtn) {
                refreshBtn.disabled = true
                refreshBtn.textContent = 'Loading...'
            }

            // Fetch current prices from all sources
            const response = await fetch(`${this.apiClient.baseURL}/api/market/prices`)
            const data = await response.json()

            console.log('Market prices API response:', data)

            if (data.success) {
                this.pricesData = data.data.prices
                console.log('Loaded prices:', this.pricesData)
                this.lastUpdate = new Date(data.data.lastUpdated)
                this.displayPrices()
                this.displayLastUpdate()
            } else {
                console.error('Failed to load prices:', data.error)
                this.showError('Failed to load market prices')
            }

        } catch (error) {
            console.error('Error loading prices:', error)
            this.showError('Network error loading prices')
        } finally {
            const refreshBtn = document.getElementById('refreshPricesBtn')
            if (refreshBtn) {
                refreshBtn.disabled = false
                refreshBtn.textContent = '🔄 Refresh'
            }
        }
    }

    /**
     * Display prices in the UI
     */
    displayPrices() {
        const container = document.getElementById('currentPricesDisplay')
        if (!container) return

        // Filter prices by selected variety
        let filteredPrices = this.pricesData
        if (this.selectedVariety !== 'ALL') {
            filteredPrices = this.pricesData.filter(p => 
                this.getVarietyName(p.variety) === this.selectedVariety
            )
        }

        if (filteredPrices.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <p>No price data available</p>
                    <small>Prices will update automatically every 30 minutes</small>
                </div>
            `
            return
        }

        // Group by variety
        const byVariety = this.groupByVariety(filteredPrices)

        // Generate HTML
        container.innerHTML = Object.entries(byVariety).map(([variety, prices]) => {
            const avgPrice = prices.reduce((sum, p) => sum + p.pricePerKg, 0) / prices.length
            const sources = [...new Set(prices.map(p => p.source))].join(', ')

            return `
                <div class="price-variety-card">
                    <div class="variety-header">
                        <h4>${variety}</h4>
                        <span class="variety-badge">${prices.length} source${prices.length > 1 ? 's' : ''}</span>
                    </div>
                    <div class="price-main">
                        <span class="price-value">$${avgPrice.toFixed(2)}</span>
                        <span class="price-unit">/kg</span>
                    </div>
                    <div class="price-details">
                        <div class="price-range">
                            <small>Range: $${Math.min(...prices.map(p => p.pricePerKg)).toFixed(2)} - $${Math.max(...prices.map(p => p.pricePerKg)).toFixed(2)}</small>
                        </div>
                        <div class="price-sources">
                            <small>Sources: ${sources}</small>
                        </div>
                    </div>
                    ${this.renderPricesByGrade(prices)}
                </div>
            `
        }).join('')
    }

    /**
     * Render prices by grade
     */
    renderPricesByGrade(prices) {
        // Group by grade
        const byGrade = {}
        prices.forEach(p => {
            if (!byGrade[p.grade]) {
                byGrade[p.grade] = []
            }
            byGrade[p.grade].push(p)
        })

        if (Object.keys(byGrade).length <= 1) return ''

        return `
            <div class="grade-prices">
                <h5>By Quality Grade:</h5>
                <div class="grade-list">
                    ${Object.entries(byGrade).map(([grade, gradePrices]) => {
                        const avgPrice = gradePrices.reduce((sum, p) => sum + p.pricePerKg, 0) / gradePrices.length
                        return `
                            <div class="grade-item">
                                <span class="grade-label">Grade ${grade}</span>
                                <span class="grade-price">$${avgPrice.toFixed(2)}/kg</span>
                            </div>
                        `
                    }).join('')}
                </div>
            </div>
        `
    }

    /**
     * Group prices by variety
     */
    groupByVariety(prices) {
        const grouped = {}
        prices.forEach(price => {
            const variety = this.getVarietyName(price.variety)
            if (!grouped[variety]) {
                grouped[variety] = []
            }
            grouped[variety].push(price)
        })
        return grouped
    }

    /**
     * Get variety name from enum value
     */
    getVarietyName(varietyValue) {
        const varieties = {
            0: 'Arabica',
            1: 'Robusta',
            2: 'Specialty',
            3: 'Organic'
        }
        return varieties[varietyValue] || 'Unknown'
    }

    /**
     * Display last update time
     */
    displayLastUpdate() {
        const updateElement = document.getElementById('pricesLastUpdate')
        if (updateElement && this.lastUpdate) {
            const timeAgo = this.getTimeAgo(this.lastUpdate)
            updateElement.textContent = `Last updated: ${timeAgo}`
        }
    }

    /**
     * Get time ago string
     */
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000)
        
        if (seconds < 60) return 'just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
        return `${Math.floor(seconds / 86400)} days ago`
    }

    /**
     * Show error message
     */
    showError(message) {
        const container = document.getElementById('currentPricesDisplay')
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>⚠️ ${message}</p>
                    <button onclick="window.marketPricesDisplay.loadPrices()">Try Again</button>
                </div>
            `
        }
    }

    /**
     * Start auto-refresh
     */
    startAutoRefresh(minutes) {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval)
        }

        this.refreshInterval = setInterval(() => {
            console.log('Auto-refreshing market prices...')
            this.loadPrices()
        }, minutes * 60 * 1000)

        console.log(`Auto-refresh enabled: every ${minutes} minutes`)
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval)
            this.refreshInterval = null
        }
    }

    /**
     * Display quality grade pricing table
     */
    displayQualityGradePricing() {
        const container = document.getElementById('gradePricingTable')
        if (!container) return

        // Base prices for each variety (from current market data or defaults)
        const basePrices = {
            'Arabica': 4.50,
            'Robusta': 2.80,
            'Specialty': 6.08,
            'Organic': 5.63
        }

        // Get selected variety or use Arabica as default
        const selectedVariety = this.selectedVariety === 'ALL' ? 'Arabica' : this.selectedVariety
        const basePrice = basePrices[selectedVariety] || basePrices['Arabica']

        // Generate pricing for grades 1-10 (grade 1 is highest quality)
        const grades = []
        for (let grade = 1; grade <= 10; grade++) {
            // Higher grades (lower quality) get progressively lower prices
            // Grade 1 = 100%, Grade 10 = 40% of base price
            const multiplier = 1 - ((grade - 1) * 0.067)
            const price = (basePrice * multiplier).toFixed(2)
            grades.push({ grade, price })
        }

        container.innerHTML = `
            <div class="grade-pricing-grid">
                ${grades.map(g => `
                    <div class="grade-price-item">
                        <span class="grade-number">Grade ${g.grade}</span>
                        <span class="grade-price">$${g.price}/kg</span>
                    </div>
                `).join('')}
            </div>
            <div class="grade-info">
                <small>Prices for ${selectedVariety} variety. Grade 1 is highest quality.</small>
            </div>
        `
    }

    /**
     * Load seasonal multipliers
     */
    async loadSeasonalMultipliers() {
        try {
            const response = await fetch(`${this.apiClient.baseURL}/api/pricing/seasonal-multipliers`)
            const data = await response.json()

            console.log('Seasonal multipliers response:', data)

            if (data.success) {
                const multipliers = data.data.seasonalMultipliers || data.data
                this.displaySeasonalMultipliers(multipliers)
            }
        } catch (error) {
            console.error('Error loading seasonal multipliers:', error)
        }
    }

    /**
     * Display seasonal multipliers chart
     */
    displaySeasonalMultipliers(multipliers) {
        const container = document.getElementById('seasonalMultipliersDisplay')
        if (!container) {
            // Try alternate container names
            const chartContainer = document.getElementById('seasonalPricingChart')
            if (chartContainer && chartContainer.parentElement) {
                // Create a div for the chart if using canvas element
                const newContainer = document.createElement('div')
                newContainer.id = 'seasonalMultipliersDisplay'
                chartContainer.parentElement.insertBefore(newContainer, chartContainer)
                chartContainer.style.display = 'none'
                return this.displaySeasonalMultipliers(multipliers)
            }
            console.warn('Seasonal multipliers container not found')
            return
        }

        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]

        const currentMonth = new Date().getMonth() + 1

        container.innerHTML = `
            <style>
                .seasonal-multipliers-wrapper {
                    width: 100%;
                    overflow-x: auto;
                    padding: 10px 0;
                }
                .seasonal-chart {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 8px;
                    min-width: 600px;
                    max-width: 100%;
                    margin: 0 auto;
                }
                .month-bar {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 4px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .month-bar:hover {
                    background: rgba(0, 0, 0, 0.05);
                }
                .month-bar.current-month {
                    background: rgba(76, 175, 80, 0.1);
                    border: 2px solid #4CAF50;
                }
                .bar-container {
                    width: 100%;
                    height: 80px;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    position: relative;
                }
                .bar {
                    width: 100%;
                    max-width: 40px;
                    border-radius: 4px 4px 0 0;
                    transition: all 0.3s;
                    min-height: 4px;
                }
                .bar.positive {
                    background: linear-gradient(to top, #4CAF50, #81C784);
                }
                .bar.negative {
                    background: linear-gradient(to top, #f44336, #e57373);
                }
                .month-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #666;
                    text-align: center;
                }
                .multiplier-value {
                    font-size: 12px;
                    font-weight: 700;
                    text-align: center;
                    white-space: nowrap;
                }
                .multiplier-value.positive {
                    color: #4CAF50;
                }
                .multiplier-value.negative {
                    color: #f44336;
                }
                .current-month-info {
                    margin-top: 20px;
                    padding: 12px 16px;
                    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                    color: white;
                    border-radius: 8px;
                    text-align: center;
                    font-size: 14px;
                    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
                }
                .current-month-info strong {
                    font-weight: 600;
                }
                @media (max-width: 768px) {
                    .seasonal-chart {
                        gap: 4px;
                    }
                    .month-label {
                        font-size: 10px;
                    }
                    .multiplier-value {
                        font-size: 10px;
                    }
                }
            </style>
            <div class="seasonal-multipliers-wrapper">
                <div class="seasonal-chart">
                    ${months.map((month, index) => {
                        const monthNum = index + 1
                        const multiplier = multipliers[monthNum] || 1.0
                        const percentage = ((multiplier - 1) * 100).toFixed(0)
                        const isPositive = multiplier >= 1.0
                        const isCurrent = monthNum === currentMonth
                        const barHeight = Math.min(Math.abs(percentage) * 2.5, 75)
                        
                        return `
                            <div class="month-bar ${isCurrent ? 'current-month' : ''}" title="${month}: ${isPositive ? '+' : ''}${percentage}% price adjustment">
                                <div class="bar-container">
                                    <div class="bar ${isPositive ? 'positive' : 'negative'}" 
                                         style="height: ${barHeight}px">
                                    </div>
                                </div>
                                <div class="month-label">${month}</div>
                                <div class="multiplier-value ${isPositive ? 'positive' : 'negative'}">
                                    ${isPositive ? '+' : ''}${percentage}%
                                </div>
                            </div>
                        `
                    }).join('')}
                </div>
            </div>
            <div class="current-month-info">
                <strong>📅 ${months[currentMonth - 1]} ${new Date().getFullYear()}</strong> — 
                Current price adjustment: <strong>${multipliers[currentMonth] ? ((multipliers[currentMonth] - 1) * 100).toFixed(0) + '%' : '0%'}</strong>
            </div>
        `
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        if (window.coffeeAPI) {
            window.marketPricesDisplay = new MarketPricesDisplay(window.coffeeAPI)
            // Will be initialized when user navigates to pricing section
        }
    })
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketPricesDisplay
}
