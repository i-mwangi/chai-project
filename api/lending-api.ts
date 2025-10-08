import { IncomingMessage, ServerResponse } from 'http'
import { LenderContract } from './lender-contract'

// Mock data for lending pools since we don't have actual contracts in this environment
const MOCK_POOLS = [
    {
        assetAddress: 'USDC',
        assetName: 'USDC Stablecoin',
        lpTokenAddress: 'LP-USDC-001',
        totalLiquidity: 150000,
        availableLiquidity: 95000,
        totalBorrowed: 55000,
        utilizationRate: 0.367,
        currentAPY: 8.5,
        totalLPTokens: 150000
    },
    {
        assetAddress: 'KES',
        assetName: 'Kenyan Shilling',
        lpTokenAddress: 'LP-KES-001',
        totalLiquidity: 75000,
        availableLiquidity: 45000,
        totalBorrowed: 30000,
        utilizationRate: 0.4,
        currentAPY: 12.0,
        totalLPTokens: 75000
    }
]

// Mock loan data
const MOCK_LOANS = new Map<string, any>()

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

export class LendingAPI {
    
    /**
     * Get all available lending pools
     */
    async getLendingPools(req: IncomingMessage, res: ServerResponse) {
        try {
            sendResponse(res, 200, {
                success: true,
                pools: MOCK_POOLS
            })
        } catch (error) {
            console.error('Error fetching lending pools:', error)
            sendError(res, 500, 'Failed to fetch lending pools')
        }
    }

    /**
     * Provide liquidity to a lending pool
     */
    async provideLiquidity(req: IncomingMessage, res: ServerResponse) {
        try {
            const { assetAddress, amount, providerAddress } = (req as any).body || {}

            if (!assetAddress || !amount || !providerAddress) {
                sendError(res, 400, 'Missing required parameters: assetAddress, amount, providerAddress')
                return
            }

            if (amount <= 0) {
                sendError(res, 400, 'Amount must be positive')
                return
            }

            // Find the pool
            const pool = MOCK_POOLS.find(p => p.assetAddress === assetAddress)
            if (!pool) {
                sendError(res, 404, 'Lending pool not found')
                return
            }

            // Check if there's enough liquidity (in a real implementation, this would be a contract call)
            if (amount > pool.availableLiquidity) {
                sendError(res, 400, 'Insufficient liquidity in pool')
                return
            }

            // In a real implementation, this would interact with the LenderContract
            // For now, we'll just return a mock response
            sendResponse(res, 200, {
                success: true,
                data: {
                    assetAddress,
                    amount,
                    lpTokensMinted: amount, // 1:1 for demo
                    transactionHash: '0x' + Math.random().toString(16).substr(2, 10),
                    providedAt: new Date().toISOString()
                }
            })
        } catch (error) {
            console.error('Error providing liquidity:', error)
            sendError(res, 500, 'Failed to provide liquidity')
        }
    }

    /**
     * Withdraw liquidity from a lending pool
     */
    async withdrawLiquidity(req: IncomingMessage, res: ServerResponse) {
        try {
            const { assetAddress, lpTokenAmount, providerAddress } = (req as any).body || {}

            if (!assetAddress || !lpTokenAmount || !providerAddress) {
                sendError(res, 400, 'Missing required parameters: assetAddress, lpTokenAmount, providerAddress')
                return
            }

            if (lpTokenAmount <= 0) {
                sendError(res, 400, 'LP token amount must be positive')
                return
            }

            // Find the pool
            const pool = MOCK_POOLS.find(p => p.assetAddress === assetAddress)
            if (!pool) {
                sendError(res, 404, 'Lending pool not found')
                return
            }

            // In a real implementation, this would interact with the LenderContract
            // For now, we'll just return a mock response
            const usdcReturned = lpTokenAmount * 1.05 // 5% rewards for demo
            const rewardsEarned = lpTokenAmount * 0.05

            sendResponse(res, 200, {
                success: true,
                data: {
                    assetAddress,
                    lpTokensBurned: lpTokenAmount,
                    usdcReturned,
                    rewardsEarned,
                    transactionHash: '0x' + Math.random().toString(16).substr(2, 10),
                    withdrawnAt: new Date().toISOString()
                }
            })
        } catch (error) {
            console.error('Error withdrawing liquidity:', error)
            sendError(res, 500, 'Failed to withdraw liquidity')
        }
    }

    /**
     * Get pool statistics
     */
    async getPoolStatistics(req: IncomingMessage, res: ServerResponse) {
        try {
            const { assetAddress } = (req as any).query || {}

            if (!assetAddress) {
                sendError(res, 400, 'Missing required parameter: assetAddress')
                return
            }

            // Find the pool
            const pool = MOCK_POOLS.find(p => p.assetAddress === assetAddress)
            if (!pool) {
                sendError(res, 404, 'Lending pool not found')
                return
            }

            // In a real implementation, this would fetch real statistics from the contract
            // For now, we'll enhance the mock data with more statistics
            const stats = {
                ...pool,
                totalProviders: Math.floor(Math.random() * 50) + 10,
                totalBorrowers: Math.floor(Math.random() * 20) + 5,
                averageLoanSize: Math.floor(pool.totalBorrowed / (Math.random() * 10 + 5))
            }

            sendResponse(res, 200, {
                success: true,
                data: stats
            })
        } catch (error) {
            console.error('Error fetching pool statistics:', error)
            sendError(res, 500, 'Failed to fetch pool statistics')
        }
    }

    /**
     * Calculate loan terms
     */
    async calculateLoanTerms(req: IncomingMessage, res: ServerResponse) {
        try {
            const { assetAddress, loanAmount } = (req as any).body || {}

            if (!assetAddress || !loanAmount) {
                sendError(res, 400, 'Missing required parameters: assetAddress, loanAmount')
                return
            }

            if (loanAmount <= 0) {
                sendError(res, 400, 'Loan amount must be positive')
                return
            }

            // Mock calculation - in a real implementation, this would query price oracles
            const collateralRequired = loanAmount * 1.25 // 125% collateralization
            const liquidationPrice = 0.90 // 90% of current price
            const repaymentAmount = loanAmount * 1.10 // 10% interest
            const interestRate = 0.10 // 10%
            const maxLoanDuration = 180 // 180 days

            sendResponse(res, 200, {
                success: true,
                data: {
                    loanAmount,
                    collateralRequired,
                    collateralizationRatio: 1.25,
                    liquidationPrice,
                    repaymentAmount,
                    interestRate,
                    maxLoanDuration
                }
            })
        } catch (error) {
            console.error('Error calculating loan terms:', error)
            sendError(res, 500, 'Failed to calculate loan terms')
        }
    }

    /**
     * Take out a loan
     */
    async takeOutLoan(req: IncomingMessage, res: ServerResponse) {
        try {
            const { assetAddress, loanAmount, borrowerAddress } = (req as any).body || {}

            if (!assetAddress || !loanAmount || !borrowerAddress) {
                sendError(res, 400, 'Missing required parameters: assetAddress, loanAmount, borrowerAddress')
                return
            }

            if (loanAmount <= 0) {
                sendError(res, 400, 'Loan amount must be positive')
                return
            }

            // Check if borrower already has an active loan
            const existingLoanKey = `${borrowerAddress}-${assetAddress}`
            if (MOCK_LOANS.has(existingLoanKey)) {
                sendError(res, 400, 'Borrower already has an active loan')
                return
            }

            // Find the pool
            const pool = MOCK_POOLS.find(p => p.assetAddress === assetAddress)
            if (!pool) {
                sendError(res, 404, 'Lending pool not found')
                return
            }

            // Check pool liquidity
            if (loanAmount > pool.availableLiquidity) {
                sendError(res, 400, 'Insufficient liquidity in pool')
                return
            }

            // Calculate loan terms
            const collateralRequired = loanAmount * 1.25
            const repaymentAmount = loanAmount * 1.10
            const liquidationPrice = 0.90
            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + 180) // 180 days loan term

            // Create loan record
            const loanId = `loan_${Date.now()}`
            const loanData = {
                loanId,
                borrowerAddress,
                assetAddress,
                loanAmount,
                collateralAmount: collateralRequired,
                repaymentAmount,
                liquidationPrice,
                status: 'active',
                takenAt: new Date().toISOString(),
                dueDate: dueDate.toISOString()
            }

            // Store loan
            MOCK_LOANS.set(existingLoanKey, loanData)

            // Update pool liquidity
            pool.availableLiquidity -= loanAmount
            pool.totalBorrowed += loanAmount
            pool.utilizationRate = pool.totalBorrowed / pool.totalLiquidity

            sendResponse(res, 200, {
                success: true,
                data: {
                    ...loanData,
                    transactionHash: '0x' + Math.random().toString(16).substr(2, 10)
                }
            })
        } catch (error) {
            console.error('Error taking out loan:', error)
            sendError(res, 500, 'Failed to take out loan')
        }
    }

    /**
     * Repay a loan
     */
    async repayLoan(req: IncomingMessage, res: ServerResponse) {
        try {
            const { assetAddress, borrowerAddress } = (req as any).body || {}

            if (!assetAddress || !borrowerAddress) {
                sendError(res, 400, 'Missing required parameters: assetAddress, borrowerAddress')
                return
            }

            // Find the loan
            const loanKey = `${borrowerAddress}-${assetAddress}`
            const loan = MOCK_LOANS.get(loanKey)
            if (!loan) {
                sendError(res, 404, 'No active loan found')
                return
            }

            // Find the pool
            const pool = MOCK_POOLS.find(p => p.assetAddress === assetAddress)
            if (!pool) {
                sendError(res, 404, 'Lending pool not found')
                return
            }

            // Process repayment
            // In a real implementation, this would check USDC balance and transfer funds

            // Remove loan
            MOCK_LOANS.delete(loanKey)

            // Update pool liquidity
            pool.availableLiquidity += loan.loanAmount
            pool.totalBorrowed -= loan.loanAmount
            pool.utilizationRate = pool.totalBorrowed / pool.totalLiquidity

            sendResponse(res, 200, {
                success: true,
                data: {
                    loanId: loan.loanId,
                    repaymentAmount: loan.repaymentAmount,
                    collateralReturned: loan.collateralAmount,
                    transactionHash: '0x' + Math.random().toString(16).substr(2, 10),
                    repaidAt: new Date().toISOString()
                }
            })
        } catch (error) {
            console.error('Error repaying loan:', error)
            sendError(res, 500, 'Failed to repay loan')
        }
    }

    /**
     * Get loan details
     */
    async getLoanDetails(req: IncomingMessage, res: ServerResponse, borrowerAddress: string, assetAddress: string) {
        try {
            if (!borrowerAddress || !assetAddress) {
                sendError(res, 400, 'Missing required parameters: borrowerAddress, assetAddress')
                return
            }

            // Find the loan
            const loanKey = `${borrowerAddress}-${assetAddress}`
            const loan = MOCK_LOANS.get(loanKey)
            if (!loan) {
                sendError(res, 404, 'No active loan found')
                return
            }

            // Add health factor calculation for demo
            const currentPrice = 1.05 // Mock current price
            const healthFactor = (loan.collateralAmount * currentPrice) / loan.loanAmount

            const loanWithHealth = {
                ...loan,
                currentPrice,
                healthFactor
            }

            sendResponse(res, 200, {
                success: true,
                data: loanWithHealth
            })
        } catch (error) {
            console.error('Error fetching loan details:', error)
            sendError(res, 500, 'Failed to fetch loan details')
        }
    }
}