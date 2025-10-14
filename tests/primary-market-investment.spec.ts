/**
 * Primary Market Investment Tests
 * Tests for token purchase and portfolio retrieval functionality
 */

import { describe, test, expect } from 'vitest'

const API_BASE_URL = 'http://localhost:3002'

// Helper function to make API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    })
    const data = await response.json()
    return { response, data, status: response.status }
}

// Helper to get grove ID after registration
async function getGroveIdByName(groveName: string): Promise<number> {
    const { data } = await apiRequest('/api/investment/available-groves')
    const grove = data.groves.find((g: any) => g.groveName === groveName)
    return grove?.id
}

describe('Primary Market Investment', () => {
    
    describe('Token Purchase', () => {
        
        test('should successfully purchase tokens from primary market', async () => {
            // First, create a test grove
            const groveData = {
                farmerAddress: '0.0.test-farmer-' + Date.now(),
                groveName: 'Test Grove ' + Date.now(),
                location: 'Test Location',
                treeCount: 100,
                coffeeVariety: 'Arabica',
                totalTokensIssued: 100,
                tokensPerTree: 1
            }
            
            const { data: groveResult } = await apiRequest('/api/farmer-verification/register-grove', {
                method: 'POST',
                body: JSON.stringify(groveData)
            })
            
            expect(groveResult.success).toBe(true)
            
            // Get the grove ID
            const groveId = await getGroveIdByName(groveData.groveName)
            expect(groveId).toBeDefined()
            
            // Now purchase tokens
            const purchaseData = {
                groveId: groveId,
                tokenAmount: 10,
                investorAddress: '0.0.test-investor-' + Date.now()
            }
            
            const { data: purchaseResult } = await apiRequest('/api/investment/purchase-tokens', {
                method: 'POST',
                body: JSON.stringify(purchaseData)
            })
            
            expect(purchaseResult.success).toBe(true)
            expect(purchaseResult.data).toBeDefined()
            expect(purchaseResult.data.groveId).toBe(groveId)
            expect(purchaseResult.data.tokenAmount).toBe(10)
            expect(purchaseResult.data.pricePerToken).toBe(25) // $25 per token
            expect(purchaseResult.data.totalCost).toBe(250) // 10 * $25
            expect(purchaseResult.data.groveName).toBe(groveData.groveName)
        }, 30000)
        
        test('should reject purchase with missing required fields', async () => {
            const purchaseData = {
                groveId: 1,
                // Missing tokenAmount and investorAddress
            }
            
            const { status, data } = await apiRequest('/api/investment/purchase-tokens', {
                method: 'POST',
                body: JSON.stringify(purchaseData)
            })
            
            expect(status).toBe(400)
            expect(data.success).toBe(false)
            expect(data.error).toContain('Missing required parameters')
        })
        
        test('should reject purchase with invalid token amount', async () => {
            const purchaseData = {
                groveId: 1,
                tokenAmount: 0,
                investorAddress: '0.0.test-investor'
            }
            
            const { status, data } = await apiRequest('/api/investment/purchase-tokens', {
                method: 'POST',
                body: JSON.stringify(purchaseData)
            })
            
            expect(status).toBe(400)
            expect(data.success).toBe(false)
            expect(data.error).toContain('must be positive')
        })
        
        test('should reject purchase for non-existent grove', async () => {
            const purchaseData = {
                groveId: 999999,
                tokenAmount: 10,
                investorAddress: '0.0.test-investor'
            }
            
            const { status, data } = await apiRequest('/api/investment/purchase-tokens', {
                method: 'POST',
                body: JSON.stringify(purchaseData)
            })
            
            expect(status).toBe(404)
            expect(data.success).toBe(false)
            expect(data.error).toContain('Grove not found')
        })
    })
    
    describe('Portfolio Retrieval', () => {
        
        test('should return empty portfolio for investor with no holdings', async () => {
            const investorAddress = '0.0.new-investor-' + Date.now()
            
            const { data } = await apiRequest(`/api/investment/portfolio?investorAddress=${investorAddress}`)
            
            expect(data.success).toBe(true)
            expect(data.portfolio).toBeDefined()
            expect(data.portfolio.holdings).toEqual([])
            expect(data.portfolio.totalInvestment).toBe(0)
            expect(data.portfolio.totalHoldings).toBe(0)
        })
        
        test('should return portfolio with holdings after purchase', async () => {
            const investorAddress = '0.0.test-investor-' + Date.now()
            
            // Create a grove
            const groveData = {
                farmerAddress: '0.0.test-farmer-' + Date.now(),
                groveName: 'Portfolio Test Grove ' + Date.now(),
                location: 'Costa Rica',
                treeCount: 100,
                coffeeVariety: 'Arabica',
                totalTokensIssued: 100,
                tokensPerTree: 1
            }
            
            await apiRequest('/api/farmer-verification/register-grove', {
                method: 'POST',
                body: JSON.stringify(groveData)
            })
            
            const groveId = await getGroveIdByName(groveData.groveName)
            
            // Purchase tokens
            await apiRequest('/api/investment/purchase-tokens', {
                method: 'POST',
                body: JSON.stringify({
                    groveId: groveId,
                    tokenAmount: 15,
                    investorAddress: investorAddress
                })
            })
            
            // Get portfolio
            const { data: portfolioResult } = await apiRequest(`/api/investment/portfolio?investorAddress=${investorAddress}`)
            
            expect(portfolioResult.success).toBe(true)
            expect(portfolioResult.portfolio.holdings).toHaveLength(1)
            
            const holding = portfolioResult.portfolio.holdings[0]
            expect(holding.groveId).toBe(groveId)
            expect(holding.groveName).toBe(groveData.groveName)
            expect(holding.tokenAmount).toBe(15)
            expect(holding.purchasePrice).toBe(25)
            expect(holding.location).toBe('Costa Rica')
            expect(holding.coffeeVariety).toBe('Arabica')
            
            expect(portfolioResult.portfolio.totalInvestment).toBe(375) // 15 * $25
            expect(portfolioResult.portfolio.totalHoldings).toBe(15)
        }, 30000)
        
        test('should return empty portfolio when no investor address provided', async () => {
            const { status, data } = await apiRequest('/api/investment/portfolio')
            
            expect(status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.portfolio.holdings).toEqual([])
        })
    })
    
    describe('End-to-End Flow', () => {
        
        test('should complete full investor journey', async () => {
            const farmerAddress = '0.0.e2e-farmer-' + Date.now()
            const investorAddress = '0.0.e2e-investor-' + Date.now()
            
            // Step 1: Farmer registers a grove
            const groveData = {
                farmerAddress: farmerAddress,
                groveName: 'E2E Test Grove ' + Date.now(),
                location: 'Panama',
                treeCount: 50,
                coffeeVariety: 'Geisha',
                totalTokensIssued: 50,
                tokensPerTree: 1
            }
            
            const { data: groveResult } = await apiRequest('/api/farmer-verification/register-grove', {
                method: 'POST',
                body: JSON.stringify(groveData)
            })
            
            expect(groveResult.success).toBe(true)
            
            const groveId = await getGroveIdByName(groveData.groveName)
            
            // Step 2: Investor views available groves
            const { data: availableResult } = await apiRequest('/api/investment/available-groves')
            expect(availableResult.groves.some((g: any) => g.id === groveId)).toBe(true)
            
            // Step 3: Investor purchases tokens
            const { data: purchaseResult } = await apiRequest('/api/investment/purchase-tokens', {
                method: 'POST',
                body: JSON.stringify({
                    groveId: groveId,
                    tokenAmount: 25,
                    investorAddress: investorAddress
                })
            })
            
            expect(purchaseResult.success).toBe(true)
            
            // Step 4: Investor views portfolio
            const { data: portfolioResult } = await apiRequest(`/api/investment/portfolio?investorAddress=${investorAddress}`)
            
            expect(portfolioResult.success).toBe(true)
            expect(portfolioResult.portfolio.holdings).toHaveLength(1)
            expect(portfolioResult.portfolio.holdings[0].groveId).toBe(groveId)
            expect(portfolioResult.portfolio.holdings[0].tokenAmount).toBe(25)
            expect(portfolioResult.portfolio.totalInvestment).toBe(625) // 25 * $25
        }, 30000)
    })
})
