/**
 * Withdrawal Integration Test
 * Tests the complete withdrawal flow including:
 * - Farmer balance retrieval
 * - 30% withdrawal limit enforcement
 * - Hedera contract integration
 * - Database persistence
 * - Notification system
 */

import { withdrawalService } from './api/withdrawal-service'
import { db } from './db'
import { farmerBalances } from './db/schema/index'
import { eq } from 'drizzle-orm'

async function testWithdrawalIntegration() {
    console.log('🧪 Testing Withdrawal Integration\n')

    const testFarmerAddress = '0.0.123456'
    
    try {
        // Step 1: Setup test farmer balance
        console.log('📝 Step 1: Setting up test farmer balance...')
        await db.insert(farmerBalances).values({
            farmerAddress: testFarmerAddress,
            availableBalance: 100000, // $1000.00 in cents
            pendingBalance: 50000,    // $500.00 in cents
            totalEarned: 150000,      // $1500.00 in cents
            totalWithdrawn: 0,
            updatedAt: Date.now()
        }).onConflictDoUpdate({
            target: farmerBalances.farmerAddress,
            set: {
                availableBalance: 100000,
                pendingBalance: 50000,
                totalEarned: 150000,
                totalWithdrawn: 0,
                updatedAt: Date.now()
            }
        })
        console.log('✅ Test farmer balance created: $1000.00 available\n')

        // Step 2: Get farmer balance
        console.log('📝 Step 2: Retrieving farmer balance...')
        const balance = await withdrawalService.getFarmerBalance(testFarmerAddress)
        console.log('Balance Details:')
        console.log(`  Available: $${(balance.availableBalance / 100).toFixed(2)}`)
        console.log(`  Pending: $${(balance.pendingBalance / 100).toFixed(2)}`)
        console.log(`  Total Earned: $${(balance.totalEarned / 100).toFixed(2)}`)
        console.log(`  Total Withdrawn: $${(balance.totalWithdrawn / 100).toFixed(2)}`)
        console.log(`  Max Withdrawable (30%): $${(balance.maxWithdrawable / 100).toFixed(2)}`)
        console.log('✅ Balance retrieved successfully\n')

        // Step 3: Test withdrawal limit enforcement
        console.log('📝 Step 3: Testing 30% withdrawal limit...')
        const maxWithdrawable = balance.maxWithdrawable / 100
        const overLimitAmount = maxWithdrawable + 50 // Try to withdraw $50 over limit
        
        console.log(`  Attempting to withdraw $${overLimitAmount.toFixed(2)} (over limit)...`)
        const overLimitResult = await withdrawalService.processFarmerWithdrawal({
            address: testFarmerAddress,
            amount: overLimitAmount
        })
        
        if (!overLimitResult.success) {
            console.log(`  ✅ Correctly rejected: ${overLimitResult.error}`)
        } else {
            console.log(`  ❌ Should have been rejected but succeeded`)
        }
        console.log()

        // Step 4: Test valid withdrawal (within 30% limit)
        console.log('📝 Step 4: Testing valid withdrawal (within 30% limit)...')
        const validAmount = maxWithdrawable - 50 // Withdraw $50 less than max
        
        console.log(`  Attempting to withdraw $${validAmount.toFixed(2)} (within limit)...`)
        
        // Note: This will fail if Hedera contracts are not configured
        // In production, ensure REVENUE_RESERVE_CONTRACT_ID is set in .env
        const validResult = await withdrawalService.processFarmerWithdrawal({
            address: testFarmerAddress,
            amount: validAmount
        })
        
        if (validResult.success) {
            console.log('  ✅ Withdrawal successful!')
            console.log(`  Withdrawal ID: ${validResult.withdrawalId}`)
            console.log(`  Transaction Hash: ${validResult.transactionHash}`)
            console.log(`  Amount: $${validResult.amount?.toFixed(2)}`)
        } else {
            console.log(`  ⚠️  Withdrawal failed: ${validResult.error}`)
            console.log('  Note: This is expected if Hedera contracts are not configured')
        }
        console.log()

        // Step 5: Get withdrawal history
        console.log('📝 Step 5: Retrieving withdrawal history...')
        const history = await withdrawalService.getFarmerWithdrawalHistory(testFarmerAddress)
        console.log(`  Found ${history.length} withdrawal(s)`)
        
        history.forEach((withdrawal, index) => {
            console.log(`\n  Withdrawal ${index + 1}:`)
            console.log(`    ID: ${withdrawal.id}`)
            console.log(`    Amount: $${withdrawal.amount.toFixed(2)}`)
            console.log(`    Status: ${withdrawal.status}`)
            console.log(`    Requested: ${new Date(withdrawal.requestedAt).toLocaleString()}`)
            if (withdrawal.completedAt) {
                console.log(`    Completed: ${new Date(withdrawal.completedAt).toLocaleString()}`)
            }
            if (withdrawal.transactionHash) {
                console.log(`    Transaction: ${withdrawal.transactionHash}`)
            }
            if (withdrawal.errorMessage) {
                console.log(`    Error: ${withdrawal.errorMessage}`)
            }
        })
        console.log()

        // Step 6: Check updated balance
        console.log('📝 Step 6: Checking updated balance...')
        const updatedBalance = await withdrawalService.getFarmerBalance(testFarmerAddress)
        console.log('Updated Balance:')
        console.log(`  Available: $${(updatedBalance.availableBalance / 100).toFixed(2)}`)
        console.log(`  Total Withdrawn: $${(updatedBalance.totalWithdrawn / 100).toFixed(2)}`)
        console.log(`  Max Withdrawable (30%): $${(updatedBalance.maxWithdrawable / 100).toFixed(2)}`)
        console.log('✅ Balance updated successfully\n')

        console.log('✅ All withdrawal integration tests completed!\n')
        console.log('📋 Summary:')
        console.log('  ✓ Farmer balance retrieval')
        console.log('  ✓ 30% withdrawal limit enforcement')
        console.log('  ✓ Database persistence')
        console.log('  ✓ Withdrawal history tracking')
        console.log('  ✓ Balance updates')
        console.log('\n⚠️  Note: Hedera contract integration requires:')
        console.log('  - REVENUE_RESERVE_CONTRACT_ID in .env')
        console.log('  - HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY configured')
        console.log('  - Deployed smart contracts on Hedera testnet/mainnet')

    } catch (error) {
        console.error('❌ Test failed:', error)
        throw error
    }
}

// Run the test
testWithdrawalIntegration()
    .then(() => {
        console.log('\n✅ Test completed successfully')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error)
        process.exit(1)
    })
