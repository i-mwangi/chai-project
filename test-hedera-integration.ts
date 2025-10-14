/**
 * Test script for Hedera farmer integration
 * 
 * This script tests the complete flow:
 * 1. Grove registration with tokenization
 * 2. Harvest reporting with token minting
 * 3. Revenue distribution on-chain
 */

import { groveTokenizationService } from './api/grove-tokenization-service'
import { revenueDistributionService } from './api/revenue-distribution-service'
import { db } from './db'
import { coffeeGroves, harvestRecords } from './db/schema'
import { eq } from 'drizzle-orm'

async function testGroveTokenization() {
    console.log('\n=== Testing Grove Tokenization ===\n')

    try {
        // Check if service is available
        if (!groveTokenizationService.isAvailable()) {
            console.log('⚠️  Tokenization service not available')
            console.log('   Set ISSUER_CONTRACT_ID in .env to enable')
            return false
        }

        console.log('✅ Tokenization service is available')

        // Create a test grove in database
        const testGrove = {
            groveName: `Test Grove ${Date.now()}`,
            farmerAddress: '0.0.123456',
            location: 'Test Location',
            coordinatesLat: 0,
            coordinatesLng: 0,
            treeCount: 100,
            coffeeVariety: 'Arabica',
            expectedYieldPerTree: 5,
            verificationStatus: 'verified',
            createdAt: Date.now(),
            updatedAt: Date.now()
        }

        console.log(`\n📝 Creating test grove: ${testGrove.groveName}`)
        const insertResult = await db.insert(coffeeGroves).values(testGrove).returning()
        const grove = insertResult[0]
        console.log(`✅ Grove created with ID: ${grove.id}`)

        // Tokenize the grove
        console.log(`\n🚀 Tokenizing grove...`)
        const result = await groveTokenizationService.tokenizeGrove({
            groveId: grove.id,
            groveName: grove.groveName,
            treeCount: grove.treeCount,
            tokensPerTree: 10
        })

        if (result.success) {
            console.log(`\n✅ Tokenization successful!`)
            console.log(`   Token Address: ${result.tokenAddress}`)
            console.log(`   Total Tokens: ${result.totalTokensIssued}`)
            console.log(`   Transactions: ${result.transactionIds?.length || 0}`)

            // Verify database was updated
            const updatedGrove = await db.query.coffeeGroves.findFirst({
                where: eq(coffeeGroves.id, grove.id)
            })

            if (updatedGrove?.tokenAddress) {
                console.log(`\n✅ Database updated with token address`)
                return true
            } else {
                console.log(`\n❌ Database not updated`)
                return false
            }
        } else {
            console.log(`\n❌ Tokenization failed: ${result.error}`)
            return false
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error)
        return false
    }
}

async function testTokenMinting() {
    console.log('\n=== Testing Token Minting ===\n')

    try {
        if (!groveTokenizationService.isAvailable()) {
            console.log('⚠️  Tokenization service not available')
            return false
        }

        // Find a tokenized grove
        const grove = await db.query.coffeeGroves.findFirst({
            where: (groves, { isNotNull }) => isNotNull(groves.tokenAddress)
        })

        if (!grove) {
            console.log('⚠️  No tokenized groves found')
            console.log('   Run grove tokenization test first')
            return false
        }

        console.log(`📝 Using grove: ${grove.groveName}`)
        console.log(`   Current tokens: ${grove.totalTokensIssued}`)

        // Mint additional tokens
        const mintAmount = 50
        console.log(`\n🪙 Minting ${mintAmount} additional tokens...`)

        const result = await groveTokenizationService.mintAdditionalTokens(grove.id, mintAmount)

        if (result.success) {
            console.log(`\n✅ Minting successful!`)

            // Verify database was updated
            const updatedGrove = await db.query.coffeeGroves.findFirst({
                where: eq(coffeeGroves.id, grove.id)
            })

            const expectedTotal = (grove.totalTokensIssued || 0) + mintAmount
            if (updatedGrove?.totalTokensIssued === expectedTotal) {
                console.log(`✅ Database updated: ${updatedGrove.totalTokensIssued} tokens`)
                return true
            } else {
                console.log(`❌ Database not updated correctly`)
                return false
            }
        } else {
            console.log(`\n❌ Minting failed: ${result.error}`)
            return false
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error)
        return false
    }
}

async function testRevenueDistribution() {
    console.log('\n=== Testing Revenue Distribution ===\n')

    try {
        // Check if revenue reserve contract is configured
        if (!process.env.REVENUE_RESERVE_CONTRACT_ID) {
            console.log('⚠️  Revenue reserve contract not configured')
            console.log('   Set REVENUE_RESERVE_CONTRACT_ID in .env to enable')
            return false
        }

        console.log('✅ Revenue reserve contract is configured')

        // Find a harvest that hasn't been distributed
        const harvest = await db.query.harvestRecords.findFirst({
            where: (harvests, { eq }) => eq(harvests.revenueDistributed, false)
        })

        if (!harvest) {
            console.log('⚠️  No pending harvests found')
            console.log('   Create a harvest first')
            return false
        }

        console.log(`\n📝 Using harvest ID: ${harvest.id}`)
        console.log(`   Total Revenue: ${harvest.totalRevenue}`)
        console.log(`   Investor Share: ${harvest.investorShare}`)

        // Distribute revenue on-chain
        console.log(`\n💰 Distributing revenue on-chain...`)

        const result = await revenueDistributionService.distributeRevenueOnChain(harvest.id)

        if (result.success) {
            console.log(`\n✅ Distribution successful!`)
            console.log(`   Transaction ID: ${result.transactionId}`)

            // Verify database was updated
            const updatedHarvest = await db.query.harvestRecords.findFirst({
                where: eq(harvestRecords.id, harvest.id)
            })

            if (updatedHarvest?.revenueDistributed) {
                console.log(`✅ Harvest marked as distributed`)
                return true
            } else {
                console.log(`❌ Harvest not marked as distributed`)
                return false
            }
        } else {
            console.log(`\n❌ Distribution failed: ${result.error}`)
            return false
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error)
        return false
    }
}

async function runTests() {
    console.log('╔════════════════════════════════════════════╗')
    console.log('║  Hedera Farmer Integration Test Suite     ║')
    console.log('╚════════════════════════════════════════════╝')

    const results = {
        tokenization: false,
        minting: false,
        distribution: false
    }

    // Test 1: Grove Tokenization
    results.tokenization = await testGroveTokenization()

    // Test 2: Token Minting
    results.minting = await testTokenMinting()

    // Test 3: Revenue Distribution
    results.distribution = await testRevenueDistribution()

    // Summary
    console.log('\n╔════════════════════════════════════════════╗')
    console.log('║  Test Results Summary                      ║')
    console.log('╚════════════════════════════════════════════╝\n')

    console.log(`Grove Tokenization:     ${results.tokenization ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Token Minting:          ${results.minting ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Revenue Distribution:   ${results.distribution ? '✅ PASS' : '❌ FAIL'}`)

    const allPassed = results.tokenization && results.minting && results.distribution
    console.log(`\n${allPassed ? '✅ All tests passed!' : '⚠️  Some tests failed'}`)

    if (!allPassed) {
        console.log('\nNote: Tests may fail if Hedera contracts are not deployed.')
        console.log('See HEDERA-INTEGRATION-GUIDE.md for setup instructions.')
    }

    process.exit(allPassed ? 0 : 1)
}

// Run tests
runTests().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
})
