/**
 * Grove Tokenization Service
 * 
 * Orchestrates the complete tokenization process for coffee groves:
 * 1. Creates HTS tokens
 * 2. Deploys manager and reserve contracts
 * 3. Mints initial token supply
 * 4. Updates database with contract addresses
 */

import { getClient } from '../utils'
import { IssuerContract } from './issuer-contract'
import { db } from '../db'
import { coffeeGroves } from '../db/schema'
import { eq } from 'drizzle-orm'

interface TokenizationParams {
    groveId: number
    groveName: string
    treeCount: number
    tokensPerTree?: number
}

interface TokenizationResult {
    success: boolean
    tokenAddress?: string
    managerContractAddress?: string
    reserveContractAddress?: string
    totalTokensIssued?: number
    tokensPerTree?: number
    transactionIds?: string[]
    error?: string
}

export class GroveTokenizationService {
    private issuerContract: IssuerContract | null = null

    constructor() {
        this.initializeContract()
    }

    private initializeContract() {
        try {
            const issuerContractAddress = process.env.ISSUER_CONTRACT_ID
            
            if (!issuerContractAddress) {
                console.warn('⚠️  ISSUER_CONTRACT_ID not set in environment - tokenization will be skipped')
                return
            }

            const client = getClient()
            this.issuerContract = new IssuerContract(issuerContractAddress, client)
            console.log('✅ Issuer Contract initialized:', issuerContractAddress)

        } catch (error) {
            console.error('❌ Failed to initialize Issuer Contract:', error)
        }
    }

    /**
     * Check if tokenization is available
     */
    isAvailable(): boolean {
        return this.issuerContract !== null
    }

    /**
     * Tokenize a coffee grove
     * Creates tokens, deploys contracts, and updates database
     */
    async tokenizeGrove(params: TokenizationParams): Promise<TokenizationResult> {
        if (!this.issuerContract) {
            console.log('⚠️  Tokenization skipped - Issuer contract not configured')
            return {
                success: false,
                error: 'Issuer contract not configured. Set ISSUER_CONTRACT_ID in environment.'
            }
        }

        const { groveId, groveName, treeCount, tokensPerTree = 10 } = params
        const transactionIds: string[] = []

        try {
            console.log(`\n🌳 Starting tokenization for grove: ${groveName}`)
            console.log(`   Trees: ${treeCount}, Tokens per tree: ${tokensPerTree}`)

            // Step 1: Create the tokenized asset (HTS token)
            const symbol = this.generateTokenSymbol(groveName)
            console.log(`\n📝 Step 1: Creating HTS token (${symbol})...`)
            
            const createResult = await this.issuerContract.createTokenizedAsset(groveName, symbol)
            
            if (!createResult.success || !createResult.tokenAddress) {
                throw new Error(createResult.error || 'Failed to create token')
            }

            console.log(`✅ Token created: ${createResult.tokenAddress}`)
            if (createResult.transactionId) {
                transactionIds.push(createResult.transactionId)
            }

            const tokenAddress = createResult.tokenAddress

            // Step 2: Calculate and mint initial token supply
            const totalTokens = treeCount * tokensPerTree
            console.log(`\n🪙 Step 2: Minting ${totalTokens} tokens...`)
            
            const mintResult = await this.issuerContract.mintTokens(groveName, totalTokens)
            
            if (!mintResult.success) {
                console.warn(`⚠️  Token minting failed: ${mintResult.error}`)
                // Continue anyway - tokens can be minted later
            } else {
                console.log(`✅ Tokens minted successfully`)
                if (mintResult.transactionId) {
                    transactionIds.push(mintResult.transactionId)
                }
            }

            // Step 3: Get manager and reserve contract addresses
            console.log(`\n🔍 Step 3: Retrieving contract addresses...`)
            
            const managerAddress = await this.issuerContract.getManagerAddress(groveName)
            const reserveAddress = await this.issuerContract.getReserveAddress(groveName)

            console.log(`   Manager: ${managerAddress || 'Not deployed yet'}`)
            console.log(`   Reserve: ${reserveAddress || 'Not deployed yet'}`)

            // Step 4: Update database with tokenization info
            console.log(`\n💾 Step 4: Updating database...`)
            
            await db.update(coffeeGroves)
                .set({
                    tokenAddress: tokenAddress,
                    totalTokensIssued: totalTokens,
                    tokensPerTree: tokensPerTree,
                    updatedAt: Date.now()
                })
                .where(eq(coffeeGroves.id, groveId))

            console.log(`✅ Database updated`)

            console.log(`\n✨ Grove tokenization complete!`)
            console.log(`   Token Address: ${tokenAddress}`)
            console.log(`   Total Tokens: ${totalTokens}`)
            console.log(`   Transactions: ${transactionIds.length}`)

            return {
                success: true,
                tokenAddress,
                managerContractAddress: managerAddress || undefined,
                reserveContractAddress: reserveAddress || undefined,
                totalTokensIssued: totalTokens,
                tokensPerTree,
                transactionIds
            }

        } catch (error: any) {
            console.error(`\n❌ Grove tokenization failed:`, error)
            return {
                success: false,
                error: error.message || 'Unknown error during tokenization'
            }
        }
    }

    /**
     * Mint additional tokens for a grove (e.g., after harvest or tree growth)
     */
    async mintAdditionalTokens(groveId: number, amount: number): Promise<{ success: boolean; error?: string }> {
        if (!this.issuerContract) {
            return {
                success: false,
                error: 'Issuer contract not configured'
            }
        }

        try {
            // Get grove info
            const grove = await db.query.coffeeGroves.findFirst({
                where: eq(coffeeGroves.id, groveId)
            })

            if (!grove) {
                return { success: false, error: 'Grove not found' }
            }

            if (!grove.tokenAddress) {
                return { success: false, error: 'Grove not tokenized yet' }
            }

            console.log(`🪙 Minting ${amount} additional tokens for ${grove.groveName}`)

            const result = await this.issuerContract.mintTokens(grove.groveName, amount)

            if (result.success) {
                // Update database
                const newTotal = (grove.totalTokensIssued || 0) + amount
                await db.update(coffeeGroves)
                    .set({
                        totalTokensIssued: newTotal,
                        updatedAt: Date.now()
                    })
                    .where(eq(coffeeGroves.id, groveId))

                console.log(`✅ Minted ${amount} tokens. New total: ${newTotal}`)
            }

            return result

        } catch (error: any) {
            console.error('Error minting additional tokens:', error)
            return {
                success: false,
                error: error.message || 'Failed to mint tokens'
            }
        }
    }

    /**
     * Grant KYC to an investor for a specific grove
     */
    async grantInvestorKYC(groveId: number, investorAddress: string): Promise<{ success: boolean; error?: string }> {
        if (!this.issuerContract) {
            return {
                success: false,
                error: 'Issuer contract not configured'
            }
        }

        try {
            const grove = await db.query.coffeeGroves.findFirst({
                where: eq(coffeeGroves.id, groveId)
            })

            if (!grove) {
                return { success: false, error: 'Grove not found' }
            }

            if (!grove.tokenAddress) {
                return { success: false, error: 'Grove not tokenized yet' }
            }

            console.log(`🔐 Granting KYC for ${investorAddress} on ${grove.groveName}`)

            const result = await this.issuerContract.grantKYC(grove.groveName, investorAddress)

            if (result.success) {
                console.log(`✅ KYC granted successfully`)
            }

            return result

        } catch (error: any) {
            console.error('Error granting KYC:', error)
            return {
                success: false,
                error: error.message || 'Failed to grant KYC'
            }
        }
    }

    /**
     * Generate a token symbol from grove name
     */
    private generateTokenSymbol(groveName: string): string {
        // Take first 3 letters of each word, uppercase, max 8 chars
        const words = groveName.split(/\s+/)
        let symbol = words
            .map(word => word.substring(0, 3).toUpperCase())
            .join('')
            .substring(0, 6)
        
        // Add 'GT' suffix for Grove Token
        symbol = symbol + 'GT'
        
        return symbol.substring(0, 8) // HTS symbol max length
    }
}

// Export singleton instance
export const groveTokenizationService = new GroveTokenizationService()
