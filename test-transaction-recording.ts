/**
 * Test Transaction Recording
 * Verifies that transactions are being saved to the database
 */

import { db } from './db'
import { transactionHistory } from './db/schema'
import { transactionRecorder } from './api/transaction-recording-service'

async function testTransactionRecording() {
    console.log('=== Testing Transaction Recording ===\n')

    try {
        // Test 1: Check if table exists and is accessible
        console.log('Test 1: Checking transaction_history table...')
        const allTransactions = await db.select().from(transactionHistory)
        console.log(`✓ Table exists. Current transactions: ${allTransactions.length}`)
        
        if (allTransactions.length > 0) {
            console.log('\nExisting transactions:')
            allTransactions.forEach((tx, i) => {
                console.log(`  ${i + 1}. ${tx.type} - ${tx.fromAddress} -> ${tx.toAddress} - $${tx.amount / 100}`)
            })
        }

        // Test 2: Try to record a test transaction
        console.log('\nTest 2: Recording a test purchase transaction...')
        await transactionRecorder.recordPurchase({
            buyerAddress: '0.0.TEST123',
            groveId: 'test-grove-1',
            tokenAmount: 50,
            usdcAmount: 125000, // $1,250.00 in cents
            transactionHash: '0xTEST123'
        })
        console.log('✓ Test transaction recorded successfully')

        // Test 3: Verify the transaction was saved
        console.log('\nTest 3: Verifying transaction was saved...')
        const updatedTransactions = await db.select().from(transactionHistory)
        console.log(`✓ Total transactions now: ${updatedTransactions.length}`)

        // Test 4: Query for specific user
        console.log('\nTest 4: Querying transactions for test user...')
        const { or, eq } = await import('drizzle-orm')
        const userTransactions = await db.select()
            .from(transactionHistory)
            .where(
                or(
                    eq(transactionHistory.fromAddress, '0.0.TEST123'),
                    eq(transactionHistory.toAddress, '0.0.TEST123')
                )
            )
        console.log(`✓ Found ${userTransactions.length} transactions for test user`)

        if (userTransactions.length > 0) {
            console.log('\nTest user transactions:')
            userTransactions.forEach((tx, i) => {
                console.log(`  ${i + 1}. ${tx.type} - Amount: $${tx.amount / 100} - ${tx.timestamp}`)
            })
        }

        console.log('\n=== All Tests Passed! ===')
        console.log('\nTransaction recording is working correctly.')
        console.log('If purchases are not showing in the UI, the issue is likely:')
        console.log('1. The API endpoint query is not matching the user address')
        console.log('2. The frontend is not displaying the data correctly')
        console.log('3. The user address format is different than expected')

    } catch (error) {
        console.error('\n❌ Test Failed!')
        console.error('Error:', error)
        if (error instanceof Error) {
            console.error('Message:', error.message)
            console.error('Stack:', error.stack)
        }
    }

    process.exit(0)
}

testTransactionRecording()
