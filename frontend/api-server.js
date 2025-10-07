#!/usr/bin/env node

/**
 * Simple API Server for Coffee Tree Platform Frontend Demo
 * Provides mock API endpoints without heavy dependencies
 */

import http from 'http';
import { parse } from 'url';

const PORT = parseInt(process.env.API_PORT || '3002');

// Mock data
const mockData = {
    groves: [
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
            farmerAddress: '0.0.123456'
        },
        {
            id: '2',
            groveName: 'Mountain Peak Coffee',
            location: 'Colombia, Huila',
            coordinates: { lat: 2.5358, lng: -75.5273 },
            treeCount: 200,
            coffeeVariety: 'Bourbon',
            expectedYieldPerTree: 3.8,
            healthScore: 92,
            verificationStatus: 'verified',
            createdAt: new Date('2024-02-20').toISOString(),
            farmerAddress: '0.0.789012'
        }
    ],
    harvests: [
        {
            id: '1',
            groveId: '1',
            groveName: 'Sunrise Valley Grove',
            farmerAddress: '0.0.123456',
            harvestDate: '2024-11-15',
            yieldKg: 675,
            qualityGrade: 8,
            salePricePerKg: 4.25,
            totalRevenue: 2868.75,
            revenueDistributed: true
        }
    ],
    prices: {
        arabica: 4.25,
        robusta: 2.85,
        bourbon: 4.50,
        typica: 4.10,
        caturra: 4.35,
        geisha: 8.50
    }
};

// Revenue distributions store for mock server
mockData.revenueDistributions = [];

// Mock user settings storage (in-memory for demo)
const mockUserSettings = {};

// Utility functions
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-demo-bypass'
    });
    res.end(JSON.stringify(data));
}

function sendError(res, statusCode, message) {
    sendResponse(res, statusCode, { success: false, error: message });
}

function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-demo-bypass'
        });
        res.end();
        return;
    }
    
    const parsedUrl = parse(req.url || '', true);
    const pathname = parsedUrl.pathname || '';
    const method = req.method || 'GET';
    
    // Debug logging for investor verification requests
    if (pathname.includes('investor-verification')) {
        console.log(`🔍 Investor verification request: ${method} ${pathname}`);
    }
    
    try {
        // Parse request body for POST/PUT requests
        let body = {};
        if (method === 'POST' || method === 'PUT') {
            try {
                body = await parseRequestBody(req);
            } catch (error) {
                sendError(res, 400, 'Invalid JSON in request body');
                return;
            }
        }

        // Health check
        if (pathname === '/health' && method === 'GET') {
            sendResponse(res, 200, { 
                success: true, 
                message: 'Coffee Tree Platform API is running',
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        }
        
        // Market data endpoints
        else if (pathname === '/api/market/prices' && method === 'GET') {
            sendResponse(res, 200, {
                success: true,
                prices: mockData.prices,
                timestamp: new Date().toISOString()
            });
        }
        
        else if (pathname === '/api/market/overview' && method === 'GET') {
            sendResponse(res, 200, {
                success: true,
                totalGroves: mockData.groves.length,
                activeFarmers: 2,
                totalRevenue: 125000,
                timestamp: new Date().toISOString()
            });
        }
        
        // Grove management endpoints
        else if (pathname.includes('/api/groves') && method === 'GET') {
            const farmerAddress = parsedUrl.query.farmerAddress;
            let groves = mockData.groves;
            
            if (farmerAddress) {
                groves = groves.filter(g => g.farmerAddress === farmerAddress);
            }
            
            sendResponse(res, 200, {
                success: true,
                groves: groves
            });
        }
        
        else if (pathname === '/api/groves/register' && method === 'POST') {
            const newGrove = {
                id: (mockData.groves.length + 1).toString(),
                ...body,
                healthScore: Math.floor(Math.random() * 30) + 70,
                verificationStatus: 'pending',
                createdAt: new Date().toISOString()
            };
            
            mockData.groves.push(newGrove);
            
            sendResponse(res, 200, {
                success: true,
                message: 'Grove registered successfully',
                groveId: newGrove.id
            });
        }
        // Backwards-compatible endpoint used by older UI code
        else if (pathname === '/api/farmer-verification/register-grove' && method === 'POST') {
            const newGrove = {
                id: (mockData.groves.length + 1).toString(),
                ...body,
                healthScore: Math.floor(Math.random() * 30) + 70,
                verificationStatus: 'pending',
                createdAt: new Date().toISOString()
            };

            mockData.groves.push(newGrove);

            sendResponse(res, 200, {
                success: true,
                message: 'Grove registered successfully',
                groveId: newGrove.id
            });
        }
        
        // Harvest endpoints
        else if (pathname === '/api/harvest/history' && method === 'GET') {
            const farmerAddress = parsedUrl.query.farmerAddress;
            let harvests = mockData.harvests;
            
            if (farmerAddress) {
                harvests = harvests.filter(h => h.farmerAddress === farmerAddress);
            }
            
            sendResponse(res, 200, {
                success: true,
                harvests: harvests
            });
        }
        
        else if (pathname === '/api/harvest/report' && method === 'POST') {
            console.log('[LOG] Received request for /api/harvest/report');
            try {
                const newHarvest= {
                    id: (mockData.harvests.length + 1).toString(),
                    ...body,
                    totalRevenue: body.yieldKg * body.salePricePerKg,
                    revenueDistributed: false,
                    createdAt: new Date().toISOString()
                };
                console.log('[LOG] Created new harvest object:', newHarvest);
            
            mockData.harvests.push(newHarvest);
            console.log('[LOG] Pushed new harvest to mockData.harvests');
            sendResponse(res, 200, {
                success: true,
                message: 'Harvest reported successfully',
                harvestId: newHarvest.id
                });
            console.log('[LOG] Response sent.');
        } catch (error) {
            console.error('[ERROR] An error occurred in /api/harvest/report handler:', error);
            sendError(res, 500, 'Internal server error in harvest report');
        }

            
        }

        // Calculate distribution preview for a harvest
        else if (pathname === '/api/harvest/calculate-distribution' && method === 'POST') {
            const harvestId = body.harvestId || body.harvestId === 0 ? String(body.harvestId) : null;
            if (!harvestId) {
                sendError(res, 400, 'harvestId is required')
                return
            }

            const harvest = mockData.harvests.find(h => String(h.id) === String(harvestId))
            if (!harvest) {
                sendError(res, 404, 'Harvest not found')
                return
            }

            // Use farmerShare/investorShare if present, otherwise calculate 30/70 split
            const totalRevenue = Number(harvest.totalRevenue || (harvest.yieldKg * harvest.salePricePerKg) || 0)
            const farmerShare = Number(harvest.farmerShare ?? Math.floor(totalRevenue * 0.3))
            const investorShare = Number(harvest.investorShare ?? (totalRevenue - farmerShare))

            // Mock holders: split investorShare across 5 sample holders
            const numHolders = 5
            const perHolder = +(investorShare / numHolders).toFixed(2)
            const distributions = []
            for (let i = 0; i < numHolders; i++) {
                distributions.push({ holder: `0xMOCKHOLDER${i + 1}`, amount: perHolder })
            }

            sendResponse(res, 200, {
                success: true,
                data: {
                    harvestId: harvest.id,
                    totalRevenue,
                    farmerShare,
                    investorShare,
                    distributions
                }
            })
        }

        // Record a distribution and mark harvest as distributed
        else if (pathname === '/api/harvest/record-distribution' && method === 'POST') {
            const harvestId = body.harvestId || body.harvestId === 0 ? String(body.harvestId) : null
            const distributions = body.distributions || []

            if (!harvestId) {
                sendError(res, 400, 'harvestId is required')
                return
            }

            const harvest = mockData.harvests.find(h => String(h.id) === String(harvestId))
            if (!harvest) {
                sendError(res, 404, 'Harvest not found')
                return
            }

            // Record distribution
            const distRecord = {
                id: (mockData.revenueDistributions.length + 1).toString(),
                harvestId: harvest.id,
                date: new Date().toISOString(),
                amount: distributions.reduce((s, d) => s + (Number(d.amount) || 0), 0),
                distributions
            }

            mockData.revenueDistributions.push(distRecord)

            // Mark harvest as distributed
            harvest.revenueDistributed = true

            sendResponse(res, 200, {
                success: true,
                message: 'Distribution recorded',
                distributionId: distRecord.id
            })
        }

        // List pending distributions (harvests not yet distributed)
        else if (pathname === '/api/harvest/pending-distributions' && method === 'GET') {
            const pending = mockData.harvests.filter(h => !h.revenueDistributed)
            sendResponse(res, 200, {
                success: true,
                harvests: pending
            })
        }
        
        else if (pathname === '/api/harvest/stats' && method === 'GET') {
            const farmerAddress = parsedUrl.query.farmerAddress;
            const farmerHarvests = mockData.harvests.filter(h => h.farmerAddress === farmerAddress);
            
            const totalEarnings = farmerHarvests.reduce((sum, h) => sum + h.totalRevenue, 0);
            const monthlyEarnings = farmerHarvests
                .filter(h => new Date(h.harvestDate).getMonth() === new Date().getMonth())
                .reduce((sum, h) => sum + h.totalRevenue, 0);
            
            sendResponse(res, 200, {
                success: true,
                stats: {
                    totalEarnings: totalEarnings.toFixed(2),
                    monthlyEarnings: monthlyEarnings.toFixed(2),
                    pendingDistributions: '0.00'
                }
            });
        }
        
        // Farmer verification endpoints
        else if (pathname.startsWith('/api/farmer-verification/status/') && method === 'GET') {
            const farmerAddress = pathname.split('/').pop();
            
            // Simulate different verification statuses based on account ID
            let status = 'pending';
            let verificationDate = null;
            let rejectionReason = null;
            
            // Mock logic: some accounts are verified, some pending, some rejected
            const lastDigit = parseInt(farmerAddress.split('.')[2]) % 10;
            
            if (lastDigit < 3) {
                status = 'verified';
                verificationDate = new Date('2024-01-01').toISOString();
            } else if (lastDigit < 7) {
                status = 'pending';
            } else {
                status = 'rejected';
                rejectionReason = 'Land ownership documents were unclear. Please provide clearer images.';
            }
            
            sendResponse(res, 200, {
                success: true,
                verification: {
                    status: status,
                    verificationDate: verificationDate,
                    rejectionReason: rejectionReason,
                    submissionDate: new Date('2024-12-01').toISOString()
                }
            });
        }
        
        else if (pathname === '/api/farmer-verification/submit-documents' && method === 'POST') {
            sendResponse(res, 200, {
                success: true,
                message: 'Documents submitted successfully'
            });
        }
        
        // Investor verification endpoints
        else if (pathname.startsWith('/api/investor-verification/status/') && method === 'GET') {
            console.log('Investor verification status request:', pathname);
            const investorAddress = pathname.split('/').pop();
            
            // Simulate different verification statuses based on account ID
            let status = 'pending';
            let verificationDate = null;
            let rejectionReason = null;
            
            // Mock logic: different from farmers - some accounts are verified, some pending, some rejected
            const lastDigit = parseInt(investorAddress.split('.')[2]) % 10;
            
            if (lastDigit < 4) {
                status = 'verified';
                verificationDate = new Date('2024-01-01').toISOString();
            } else if (lastDigit < 8) {
                status = 'pending';
            } else {
                status = 'rejected';
                rejectionReason = 'Financial information was insufficient. Please provide more recent bank statements.';
            }
            
            sendResponse(res, 200, {
                success: true,
                verification: {
                    status: status,
                    verificationDate: verificationDate,
                    rejectionReason: rejectionReason,
                    submissionDate: new Date('2024-12-01').toISOString()
                }
            });
        }
        
        else if (pathname === '/api/investor-verification/submit-documents' && method === 'POST') {
            sendResponse(res, 200, {
                success: true,
                message: 'Investor documents submitted successfully'
            });
        }
        
        // Investment endpoints (mock)
        else if (pathname === '/api/investment/available-groves' && method === 'GET') {
            const availableGroves = mockData.groves.map(grove => ({
                ...grove,
                tokensAvailable: Math.floor(grove.treeCount * 0.5),
                pricePerToken: 25 + Math.random() * 10,
                projectedAnnualReturn: 10 + Math.random() * 8
            }));
            
            sendResponse(res, 200, {
                success: true,
                groves: availableGroves
            });
        }
        
        else if (pathname === '/api/investment/portfolio' && method === 'GET') {
            const investorAddress = parsedUrl.query.investorAddress;
            
            sendResponse(res, 200, {
                success: true,
                portfolio: {
                    totalInvestment: 1250.00,
                    currentValue: 1387.50,
                    totalReturns: 137.50,
                    roi: 11.0,
                    holdings: [
                        {
                            groveId: '1',
                            groveName: 'Sunrise Valley Grove',
                            tokenAmount: 25,
                            purchasePrice: 25.00,
                            currentValue: 27.50,
                            totalInvestment: 625.00,
                            currentWorth: 687.50,
                            earnings: 62.50,
                            purchaseDate: '2024-03-01'
                        }
                    ]
                }
            });
        }
        
        else if (pathname === '/api/investment/purchase-tokens' && method === 'POST') {
            sendResponse(res, 200, {
                success: true,
                message: 'Tokens purchased successfully',
                transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
            });
        }
        
        // Earnings endpoints
        else if (pathname === '/api/earnings/holder' && method === 'GET') {
            const holderAddress = parsedUrl.query.holderAddress;
            
            sendResponse(res, 200, {
                success: true,
                earnings: {
                    totalEarnings: 1250.75,
                    monthlyEarnings: 125.50,
                    pendingDistributions: 45.25,
                    lastDistribution: new Date('2024-11-15').toISOString(),
                    earningsHistory: [
                        {
                            date: '2024-11-15',
                            amount: 125.50,
                            groveId: '1',
                            groveName: 'Sunrise Valley Grove',
                            tokenAmount: 25,
                            harvestId: 'H001'
                        },
                        {
                            date: '2024-10-15',
                            amount: 98.75,
                            groveId: '1',
                            groveName: 'Sunrise Valley Grove',
                            tokenAmount: 25,
                            harvestId: 'H002'
                        },
                        {
                            date: '2024-09-15',
                            amount: 110.25,
                            groveId: '1',
                            groveName: 'Sunrise Valley Grove',
                            tokenAmount: 25,
                            harvestId: 'H003'
                        },
                        {
                            date: '2024-08-15',
                            amount: 95.00,
                            groveId: '1',
                            groveName: 'Sunrise Valley Grove',
                            tokenAmount: 25,
                            harvestId: 'H004'
                        },
                        {
                            date: '2024-07-15',
                            amount: 87.50,
                            groveId: '1',
                            groveName: 'Sunrise Valley Grove',
                            tokenAmount: 25,
                            harvestId: 'H005'
                        }
                    ]
                }
            });
        }
        
        // Marketplace endpoints
        else if (pathname === '/api/marketplace/listings' && method === 'GET') {
            sendResponse(res, 200, {
                success: true,
                listings: [
                    {
                        id: '1',
                        groveId: '1',
                        groveName: 'Sunrise Valley Grove',
                        tokenAmount: 10,
                        pricePerToken: 28.50,
                        originalPrice: 25.00,
                        totalPrice: 285.00,
                        sellerAddress: '0.0.123456',
                        coffeeVariety: 'Arabica',
                        location: 'Costa Rica, Central Valley',
                        healthScore: 85,
                        listingDate: new Date().toISOString(),
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        groveId: '2',
                        groveName: 'Mountain Peak Coffee',
                        tokenAmount: 5,
                        pricePerToken: 32.00,
                        originalPrice: 30.00,
                        totalPrice: 160.00,
                        sellerAddress: '0.0.789012',
                        coffeeVariety: 'Bourbon',
                        location: 'Colombia, Huila',
                        healthScore: 92,
                        listingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ]
            });
        }
        
        else if (pathname === '/api/marketplace/list-tokens' && method === 'POST') {
            sendResponse(res, 200, {
                success: true,
                message: 'Tokens listed for sale successfully',
                listingId: Math.random().toString(36).substr(2, 9)
            });
        }
        
        else if (pathname === '/api/marketplace/purchase' && method === 'POST') {
            sendResponse(res, 200, {
                success: true,
                message: 'Tokens purchased successfully',
                transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
            });
        }
        
        else if (pathname === '/api/marketplace/stats' && method === 'GET') {
            sendResponse(res, 200, {
                success: true,
                stats: {
                    totalListings: 5,
                    totalVolume: 12500.00,
                    averagePrice: 27.50,
                    activeListings: 3
                }
            });
        }
        
        else if (pathname === '/api/marketplace/user-listings' && method === 'GET') {
            const sellerAddress = parsedUrl.query.sellerAddress;
            
            sendResponse(res, 200, {
                success: true,
                listings: [
                    {
                        id: '1',
                        groveId: '1',
                        groveName: 'Sunrise Valley Grove',
                        tokenAmount: 10,
                        pricePerToken: 28.50,
                        status: 'active',
                        createdAt: new Date().toISOString()
                    }
                ]
            });
        }
        
        // User settings endpoints
        else if (pathname.startsWith('/api/user/settings/') && method === 'GET') {
            const accountId = pathname.split('/').pop();
            
            // Return stored settings or defaults
            const settings = mockUserSettings[accountId] || {
                skipFarmerVerification: false,
                skipInvestorVerification: false,
                demoBypass: false
            };
            
            sendResponse(res, 200, {
                success: true,
                settings: settings
            });
        }

        else if (pathname.startsWith('/api/user/settings/') && method === 'PUT') {
            const accountId = pathname.split('/').pop();
            const settings = body || {};
            
            // Store the settings in memory
            mockUserSettings[accountId] = {
                skipFarmerVerification: settings.skipFarmerVerification || false,
                skipInvestorVerification: settings.skipInvestorVerification || false,
                demoBypass: settings.demoBypass || false,
                updatedAt: new Date().toISOString()
            };
            
            sendResponse(res, 200, {
                success: true,
                settings: mockUserSettings[accountId]
            });
        }
        
        // Revenue Distribution endpoints
        else if (pathname === '/api/revenue/farmer-balance' && method === 'GET') {
            const farmerAddress = parsedUrl.query.farmerAddress;
            
            // Calculate farmer's available balance from harvests
            const farmerHarvests = mockData.harvests.filter(h => h.farmerAddress === farmerAddress);
            const totalRevenue = farmerHarvests.reduce((sum, h) => sum + (h.totalRevenue || 0), 0);
            const farmerShare = totalRevenue * 0.3; // 30% farmer share
            const withdrawn = 0; // Mock: no withdrawals yet
            
            sendResponse(res, 200, {
                success: true,
                data: {
                    farmerAddress,
                    availableBalance: farmerShare - withdrawn,
                    pendingBalance: 0,
                    totalWithdrawn: withdrawn,
                    lastWithdrawal: null
                }
            });
        }
        
        else if (pathname === '/api/revenue/withdrawal-history' && method === 'GET') {
            const farmerAddress = parsedUrl.query.farmerAddress;
            
            // Mock: return empty withdrawal history
            sendResponse(res, 200, {
                success: true,
                data: {
                    farmerAddress,
                    withdrawals: [],
                    pagination: {
                        total: 0,
                        limit: 20,
                        offset: 0
                    }
                }
            });
        }
        
        else if (pathname === '/api/revenue/withdraw-farmer-share' && method === 'POST') {
            const { groveId, amount, farmerAddress } = body || {};
            
            sendResponse(res, 200, {
                success: true,
                data: {
                    withdrawalId: `withdraw_${Date.now()}`,
                    farmerAddress,
                    amount,
                    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
                    withdrawnAt: new Date().toISOString(),
                    remainingBalance: 0
                }
            });
        }
        
        else if (pathname === '/api/revenue/distribution-history' && method === 'GET') {
            const holderAddress = parsedUrl.query.holderAddress;
            
            // Mock: return empty distribution history
            sendResponse(res, 200, {
                success: true,
                data: {
                    holderAddress,
                    totalEarnings: 0,
                    distributions: [],
                    pagination: {
                        total: 0,
                        limit: 20,
                        offset: 0
                    }
                }
            });
        }
        
        else if (pathname === '/api/pricing/all-varieties' && method === 'GET') {
            // Mock coffee pricing data
            sendResponse(res, 200, {
                success: true,
                data: {
                    varieties: [
                        {
                            variety: 'ARABICA',
                            grades: Array.from({length: 10}, (_, i) => ({
                                grade: i + 1,
                                price: 2.50 + (i * 0.35)
                            }))
                        },
                        {
                            variety: 'ROBUSTA',
                            grades: Array.from({length: 10}, (_, i) => ({
                                grade: i + 1,
                                price: 1.80 + (i * 0.24)
                            }))
                        },
                        {
                            variety: 'SPECIALTY',
                            grades: Array.from({length: 10}, (_, i) => ({
                                grade: i + 1,
                                price: 3.50 + (i * 0.55)
                            }))
                        },
                        {
                            variety: 'ORGANIC',
                            grades: Array.from({length: 10}, (_, i) => ({
                                grade: i + 1,
                                price: 3.00 + (i * 0.45)
                            }))
                        },
                        {
                            variety: 'TYPICA',
                            grades: Array.from({length: 10}, (_, i) => ({
                                grade: i + 1,
                                price: 3.20 + (i * 0.40)
                            }))
                        }
                    ],
                    lastUpdated: new Date().toISOString()
                }
            });
        }
        
        // Add the missing pricing endpoints
        else if (pathname === '/api/pricing/projected-revenue' && method === 'POST') {
            const { groveTokenAddress, variety, grade, expectedYieldKg, harvestMonth } = body || {};
            
            // Validate required parameters
            if (!variety || grade === undefined || !expectedYieldKg || !harvestMonth) {
                sendError(res, 400, 'variety, grade, expectedYieldKg, and harvestMonth are required');
                return;
            }
            
            // Normalize variety to uppercase
            const normalizedVariety = typeof variety === 'string' ? variety.toUpperCase() : variety;
            
            try {
                // Mock seasonal multipliers
                const seasonalMultipliers = {
                    1: 0.9,  // January - Low season
                    2: 0.85, // February - Low season
                    3: 0.95, // March - Low season
                    4: 1.1,  // April - Harvest season
                    5: 1.2,  // May - Harvest season
                    6: 1.3,  // June - Peak harvest
                    7: 1.25, // July - Peak harvest
                    8: 1.2,  // August - Harvest season
                    9: 1.1,  // September - Harvest season
                    10: 1.0, // October - Normal
                    11: 0.95,// November - Normal
                    12: 0.9  // December - Low season
                };
                
                // Base prices by variety
                const basePrices = {
                    'ARABICA': 4.50,
                    'ROBUSTA': 2.80,
                    'SPECIALTY': 6.00,
                    'ORGANIC': 5.20,
                    'TYPICA': 4.20
                };
                
                const basePrice = basePrices[normalizedVariety] || 4.00;
                const multiplier = seasonalMultipliers[harvestMonth] || 1.0;
                const pricePerKg = basePrice * multiplier;
                const projectedRevenue = expectedYieldKg * pricePerKg;
                
                sendResponse(res, 200, {
                    success: true,
                    data: {
                        projectedRevenue: parseFloat(projectedRevenue.toFixed(2)),
                        pricePerKg: parseFloat(pricePerKg.toFixed(2)),
                        basePrice: parseFloat(basePrice.toFixed(2)),
                        seasonalMultiplier: multiplier,
                        expectedYieldKg,
                        variety: normalizedVariety,
                        grade,
                        harvestMonth
                    }
                });
            } catch (error) {
                console.error('Error calculating projected revenue:', error);
                sendError(res, 500, 'Failed to calculate projected revenue');
            }
        }
        else if (pathname === '/api/pricing/validate-price' && method === 'POST') {
            const { variety, grade, proposedPrice } = body || {};
            
            if (!variety || grade === undefined || !proposedPrice) {
                sendError(res, 400, 'variety, grade, and proposedPrice are required');
                return;
            }
            
            // Normalize variety to uppercase
            const normalizedVariety = typeof variety === 'string' ? variety.toUpperCase() : variety;
            
            try {
                // Base prices by variety
                const basePrices = {
                    'ARABICA': 4.50,
                    'ROBUSTA': 2.80,
                    'SPECIALTY': 6.00,
                    'ORGANIC': 5.20,
                    'TYPICA': 4.20
                };
                
                const marketPrice = basePrices[normalizedVariety] || 4.00;
                const minPrice = marketPrice * 0.5;
                const maxPrice = marketPrice * 2.0;
                
                const isValid = proposedPrice >= minPrice && proposedPrice <= maxPrice;
                let message = '';
                
                if (isValid) {
                    message = 'Price is within acceptable range';
                } else if (proposedPrice < minPrice) {
                    message = `Price too low. Minimum acceptable: $${minPrice.toFixed(2)}/kg`;
                } else {
                    message = `Price too high. Maximum acceptable: $${maxPrice.toFixed(2)}/kg`;
                }
                
                sendResponse(res, 200, {
                    success: true,
                    data: {
                        isValid,
                        message,
                        marketPrice: parseFloat(marketPrice.toFixed(2)),
                        minPrice: parseFloat(minPrice.toFixed(2)),
                        maxPrice: parseFloat(maxPrice.toFixed(2)),
                        proposedPrice: parseFloat(proposedPrice.toFixed(2))
                    }
                });
            } catch (error) {
                console.error('Error validating price:', error);
                sendError(res, 500, 'Failed to validate price');
            }
        }
        else if (pathname === '/api/pricing/seasonal-multipliers' && method === 'GET') {
            try {
                // Mock seasonal multipliers
                const seasonalMultipliers = {
                    1: 0.9,  // January - Low season
                    2: 0.85, // February - Low season
                    3: 0.95, // March - Low season
                    4: 1.1,  // April - Harvest season
                    5: 1.2,  // May - Harvest season
                    6: 1.3,  // June - Peak harvest
                    7: 1.25, // July - Peak harvest
                    8: 1.2,  // August - Harvest season
                    9: 1.1,  // September - Harvest season
                    10: 1.0, // October - Normal
                    11: 0.95,// November - Normal
                    12: 0.9  // December - Low season
                };
                
                sendResponse(res, 200, {
                    success: true,
                    data: {
                        seasonalMultipliers,
                        lastUpdated: new Date().toISOString()
                    }
                });
            } catch (error) {
                console.error('Error fetching seasonal multipliers:', error);
                sendError(res, 500, 'Failed to fetch seasonal multipliers');
            }
        }
        
        // Balance endpoints
        else if (pathname === '/api/balance/usdc' && method === 'GET') {
            const accountId = parsedUrl.query.accountId;
            
            // Mock USDC balance
            sendResponse(res, 200, {
                success: true,
                data: {
                    accountId,
                    balance: 10000.00, // Mock: 10,000 USDC
                    tokenId: '0.0.429274', // Mock testnet USDC
                    lastUpdated: new Date().toISOString()
                }
            });
        }
        
        else if (pathname === '/api/balance/tokens' && method === 'GET') {
            const accountId = parsedUrl.query.accountId;
            
            // Mock token balances for groves
            const tokenBalances = mockData.groves.map(grove => ({
                groveId: grove.id,
                groveName: grove.groveName,
                tokenId: `0.0.${100000 + parseInt(grove.id)}`, // Mock token IDs
                balance: Math.floor(Math.random() * 500) + 100, // Random balance 100-600
                value: (Math.floor(Math.random() * 500) + 100) * 10 // Mock value
            }));
            
            sendResponse(res, 200, {
                success: true,
                data: {
                    accountId,
                    groves: tokenBalances,
                    totalValue: tokenBalances.reduce((sum, t) => sum + t.value, 0),
                    lastUpdated: new Date().toISOString()
                }
            });
        }
        
        else if (pathname === '/api/balance/all' && method === 'GET') {
            const accountId = parsedUrl.query.accountId;
            
            // Mock all balances
            const tokenBalances = mockData.groves.map(grove => ({
                groveId: grove.id,
                groveName: grove.groveName,
                tokenId: `0.0.${100000 + parseInt(grove.id)}`,
                balance: Math.floor(Math.random() * 500) + 100,
                value: (Math.floor(Math.random() * 500) + 100) * 10
            }));
            
            sendResponse(res, 200, {
                success: true,
                data: {
                    accountId,
                    usdc: {
                        balance: 10000.00,
                        tokenId: '0.0.429274'
                    },
                    tokens: tokenBalances,
                    totalValue: tokenBalances.reduce((sum, t) => sum + t.value, 0),
                    lastUpdated: new Date().toISOString()
                }
            });
        }
        
        // Default 404
        else {
            sendError(res, 404, 'Endpoint not found');
        }
        
    } catch (error) {
        console.error('Server error:', error);
        sendError(res, 500, 'Internal server error');
    }
});

server.listen(PORT, () => {
    console.log(`Coffee Tree Platform Mock API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('Available endpoints:');
    console.log('  GET  /health');
    console.log('  GET  /api/market/prices');
    console.log('  GET  /api/market/overview');
    console.log('  GET  /api/groves?farmerAddress=...');
    console.log('  POST /api/groves/register');
    console.log('  GET  /api/harvest/history?farmerAddress=...');
    console.log('  POST /api/harvest/report');
    console.log('  GET  /api/harvest/stats?farmerAddress=...');
    console.log('  GET  /api/farmer-verification/status/:address');
    console.log('  POST /api/farmer-verification/submit-documents');
    console.log('  GET  /api/investor-verification/status/:address');
    console.log('  POST /api/investor-verification/submit-documents');
    console.log('  GET  /api/investment/available-groves');
    console.log('  GET  /api/investment/portfolio?investorAddress=...');
    console.log('  POST /api/investment/purchase-tokens');
    console.log('  GET  /api/user/settings/:accountId');
    console.log('  PUT  /api/user/settings/:accountId');
    console.log('  POST /api/pricing/projected-revenue');
    console.log('  POST /api/pricing/validate-price');
    console.log('  GET  /api/pricing/all-varieties');
    console.log('  GET  /api/pricing/seasonal-multipliers');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});