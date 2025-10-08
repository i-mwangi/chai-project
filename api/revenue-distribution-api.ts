/**
 * Revenue Distribution API Module
 * 
 * This module handles all HTTP API endpoints related to revenue distribution
 * for coffee tree token holders.
 */

import { IncomingMessage, ServerResponse } from 'http'
import { revenueDistributionService } from './revenue-distribution-service'

// Utility functions (copied from server.ts)
function sendResponse(res: ServerResponse, statusCode: number, data: any) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-demo-bypass'
    })
    res.end(JSON.stringify(data))
}

function sendError(res: ServerResponse, statusCode: number, message: string) {
    sendResponse(res, statusCode, { success: false, error: message })
}

export class RevenueDistributionAPI {
    
    /**
     * Create a new revenue distribution for a harvest
     */
    async createDistribution(req: IncomingMessage, res: ServerResponse) {
        try {
            const { harvestId, totalRevenue } = (req as any).body || {}

            if (!harvestId || !totalRevenue) {
                sendError(res, 400, 'Missing required parameters: harvestId, totalRevenue')
                return
            }

            // In a real implementation, this would call the revenue distribution service
            // For now, we'll just return a mock response
            sendResponse(res, 200, {
                success: true,
                data: {
                    distributionId: `dist_${Date.now()}`,
                    harvestId,
                    totalRevenue,
                    distributedAt: new Date().toISOString(),
                    transactionHash: '0x' + Math.random().toString(16).substr(2, 10)
                }
            })
        } catch (error) {
            console.error('Error creating distribution:', error)
            sendError(res, 500, 'Failed to create distribution')
        }
    }

    /**
     * Get distribution history for a holder
     */
    async getDistributionHistory(req: IncomingMessage, res: ServerResponse) {
        try {
            const { holderAddress } = (req as any).query || {}

            if (!holderAddress) {
                sendError(res, 400, 'Missing required parameter: holderAddress')
                return
            }

            // In a real implementation, this would call the revenue distribution service
            // For now, we'll return mock data
            const mockDistributions = [
                {
                    distributionId: 'dist_001',
                    harvestId: 1,
                    groveName: 'Sunrise Valley Grove',
                    tokenAmount: 100,
                    shareAmount: 250.50,
                    distributionDate: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
                    transactionHash: '0xabc123'
                },
                {
                    distributionId: 'dist_002',
                    harvestId: 2,
                    groveName: 'Mountain Peak Coffee',
                    tokenAmount: 50,
                    shareAmount: 125.25,
                    distributionDate: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
                    transactionHash: '0xdef456'
                }
            ]

            sendResponse(res, 200, {
                success: true,
                distributions: mockDistributions
            })
        } catch (error) {
            console.error('Error fetching distribution history:', error)
            sendError(res, 500, 'Failed to fetch distribution history')
        }
    }

    /**
     * Get pending distributions for a holder
     */
    async getPendingDistributions(req: IncomingMessage, res: ServerResponse) {
        try {
            const { holderAddress } = (req as any).query || {}

            if (!holderAddress) {
                sendError(res, 400, 'Missing required parameter: holderAddress')
                return
            }

            // In a real implementation, this would call the revenue distribution service
            // For now, we'll return mock data
            const mockPendingDistributions = [
                {
                    distributionId: 'dist_pending_001',
                    harvestId: 3,
                    groveName: 'Highland Estate',
                    tokenBalance: 75,
                    totalRevenue: 10000,
                    shareAmount: 187.75,
                    distributionDate: new Date().toISOString(),
                    status: 'pending'
                }
            ]

            sendResponse(res, 200, {
                success: true,
                distributions: mockPendingDistributions
            })
        } catch (error) {
            console.error('Error fetching pending distributions:', error)
            sendError(res, 500, 'Failed to fetch pending distributions')
        }
    }

    /**
     * Claim earnings from a distribution
     */
    async claimEarnings(req: IncomingMessage, res: ServerResponse) {
        try {
            const { distributionId, holderAddress } = (req as any).body || {}

            if (!distributionId || !holderAddress) {
                sendError(res, 400, 'Missing required parameters: distributionId, holderAddress')
                return
            }

            // In a real implementation, this would call the revenue distribution service
            // For now, we'll just return a mock response
            sendResponse(res, 200, {
                success: true,
                data: {
                    distributionId,
                    holderAddress,
                    amount: 187.75,
                    transactionHash: '0x' + Math.random().toString(16).substr(2, 10),
                    claimedAt: new Date().toISOString()
                }
            })
        } catch (error) {
            console.error('Error claiming earnings:', error)
            sendError(res, 500, 'Failed to claim earnings')
        }
    }

    /**
     * Get farmer's revenue balance
     */
    async getFarmerBalance(req: IncomingMessage, res: ServerResponse) {
        try {
            const { farmerAddress } = (req as any).query || {}

            if (!farmerAddress) {
                sendError(res, 400, 'Missing required parameter: farmerAddress')
                return
            }

            // In a real implementation, this would call the revenue distribution service
            // For now, we'll return mock data
            sendResponse(res, 200, {
                success: true,
                data: {
                    farmerAddress,
                    balance: 1250.75,
                    pendingWithdrawals: 0,
                    lastWithdrawal: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
                }
            })
        } catch (error) {
            console.error('Error fetching farmer balance:', error)
            sendError(res, 500, 'Failed to fetch farmer balance')
        }
    }

    /**
     * Withdraw farmer's share of harvest revenue
     */
    async withdrawFarmerShare(req: IncomingMessage, res: ServerResponse) {
        try {
            const { groveId, amount, farmerAddress } = (req as any).body || {}

            if (!groveId || !amount || !farmerAddress) {
                sendError(res, 400, 'Missing required parameters: groveId, amount, farmerAddress')
                return
            }

            if (amount <= 0) {
                sendError(res, 400, 'Amount must be positive')
                return
            }

            // In a real implementation, this would call the revenue distribution service
            // For now, we'll just return a mock response
            sendResponse(res, 200, {
                success: true,
                data: {
                    groveId,
                    amount,
                    farmerAddress,
                    transactionHash: '0x' + Math.random().toString(16).substr(2, 10),
                    withdrawnAt: new Date().toISOString()
                }
            })
        } catch (error) {
            console.error('Error withdrawing farmer share:', error)
            sendError(res, 500, 'Failed to withdraw farmer share')
        }
    }

    /**
     * Get farmer's withdrawal history
     */
    async getFarmerWithdrawalHistory(req: IncomingMessage, res: ServerResponse) {
        try {
            const { farmerAddress } = (req as any).query || {}

            if (!farmerAddress) {
                sendError(res, 400, 'Missing required parameter: farmerAddress')
                return
            }

            // In a real implementation, this would call the revenue distribution service
            // For now, we'll return mock data
            const mockWithdrawals = [
                {
                    withdrawalId: 'withdrawal_001',
                    amount: 500.00,
                    transactionHash: '0x123abc',
                    withdrawnAt: new Date(Date.now() - 86400000 * 7).toISOString() // 7 days ago
                },
                {
                    withdrawalId: 'withdrawal_002',
                    amount: 750.75,
                    transactionHash: '0x456def',
                    withdrawnAt: new Date(Date.now() - 86400000 * 14).toISOString() // 14 days ago
                }
            ]

            sendResponse(res, 200, {
                success: true,
                withdrawals: mockWithdrawals
            })
        } catch (error) {
            console.error('Error fetching farmer withdrawal history:', error)
            sendError(res, 500, 'Failed to fetch farmer withdrawal history')
        }
    }
}