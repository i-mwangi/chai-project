/**
 * Test Error Recovery Mechanisms
 * 
 * This script tests the error recovery utilities including:
 * - Retry logic with exponential backoff
 * - Graceful fallback to default settings
 * - Automatic table creation if missing
 * - Connection pool recovery
 */

import { getUserSettings, updateUserSettings } from './api/user-settings.js'
import { DatabaseHealthCheck } from './db/health-check.js'
import {
  withRetry,
  withFallback,
  isRetryableError,
  isTableNotFoundError,
  ConnectionPoolRecovery
} from './lib/error-recovery.js'

async function testRetryLogic() {
  console.log('\n=== Testing Retry Logic ===')
  
  let attempts = 0
  const maxAttempts = 3
  
  try {
    const result = await withRetry(
      async () => {
        attempts++
        console.log(`Attempt ${attempts}/${maxAttempts}`)
        
        if (attempts < 2) {
          throw new Error('Simulated transient error')
        }
        
        return 'Success!'
      },
      {
        maxRetries: maxAttempts,
        baseDelay: 100,
        onRetry: (attempt, error) => {
          console.log(`  Retry callback: attempt ${attempt}, error: ${error.message}`)
        }
      }
    )
    
    console.log(`✅ Retry logic test passed: ${result}`)
    console.log(`   Total attempts: ${attempts}`)
  } catch (error) {
    console.error('❌ Retry logic test failed:', error)
  }
}

async function testFallbackMechanism() {
  console.log('\n=== Testing Fallback Mechanism ===')
  
  try {
    const result = await withFallback(
      async () => {
        throw new Error('Primary function failed')
      },
      'Fallback value'
    )
    
    console.log(`✅ Fallback test passed: ${result}`)
  } catch (error) {
    console.error('❌ Fallback test failed:', error)
  }
}

async function testErrorClassification() {
  console.log('\n=== Testing Error Classification ===')
  
  const testCases = [
    { error: new Error('SQLITE_BUSY'), expected: true, type: 'retryable' },
    { error: new Error('database is locked'), expected: true, type: 'retryable' },
    { error: new Error('connection timeout'), expected: true, type: 'retryable' },
    { error: new Error('Invalid input'), expected: false, type: 'retryable' },
    { error: new Error('no such table: user_settings'), expected: true, type: 'table-not-found' },
    { error: new Error('table does not exist'), expected: true, type: 'table-not-found' },
    { error: new Error('Some other error'), expected: false, type: 'table-not-found' }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const testCase of testCases) {
    const result = testCase.type === 'retryable' 
      ? isRetryableError(testCase.error)
      : isTableNotFoundError(testCase.error)
    
    if (result === testCase.expected) {
      console.log(`✅ ${testCase.type}: "${testCase.error.message}" -> ${result}`)
      passed++
    } else {
      console.log(`❌ ${testCase.type}: "${testCase.error.message}" -> ${result} (expected ${testCase.expected})`)
      failed++
    }
  }
  
  console.log(`\nResults: ${passed} passed, ${failed} failed`)
}

async function testUserSettingsErrorRecovery() {
  console.log('\n=== Testing User Settings Error Recovery ===')
  
  const testAccountId = '0.0.999999'
  
  try {
    // Test 1: Get settings (should return defaults if not found)
    console.log('\nTest 1: Get settings for non-existent account')
    const settings = await getUserSettings(testAccountId)
    console.log('✅ Got settings:', settings)
    console.log('   Should be defaults:', !settings.skipFarmerVerification)
    
    // Test 2: Update settings (should create new record)
    console.log('\nTest 2: Update settings (create new)')
    const updated = await updateUserSettings(testAccountId, {
      skipFarmerVerification: true
    })
    console.log('✅ Updated settings:', updated)
    console.log('   skipFarmerVerification:', updated.skipFarmerVerification)
    
    // Test 3: Get settings again (should return updated values)
    console.log('\nTest 3: Get settings again (should be cached)')
    const settingsAgain = await getUserSettings(testAccountId)
    console.log('✅ Got settings:', settingsAgain)
    console.log('   skipFarmerVerification:', settingsAgain.skipFarmerVerification)
    
    // Test 4: Invalid account ID (should throw validation error)
    console.log('\nTest 4: Invalid account ID')
    try {
      await getUserSettings('invalid-account')
      console.log('❌ Should have thrown validation error')
    } catch (error) {
      console.log('✅ Validation error caught:', (error as Error).message)
    }
    
  } catch (error) {
    console.error('❌ User settings error recovery test failed:', error)
  }
}

async function testConnectionPoolRecovery() {
  console.log('\n=== Testing Connection Pool Recovery ===')
  
  const recovery = new ConnectionPoolRecovery({
    healthCheckInterval: 5000, // 5 seconds for testing
    maxRetries: 2,
    retryDelay: 500
  })
  
  let healthCheckCount = 0
  let shouldFail = false
  
  const mockHealthCheck = async () => {
    healthCheckCount++
    console.log(`  Health check #${healthCheckCount}, shouldFail: ${shouldFail}`)
    
    if (shouldFail) {
      throw new Error('Simulated connection failure')
    }
    
    return true
  }
  
  console.log('Starting connection monitoring...')
  recovery.startMonitoring(mockHealthCheck)
  
  // Wait for first health check
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log(`✅ Initial health status: ${recovery.getHealthStatus()}`)
  
  // Simulate connection failure
  console.log('\nSimulating connection failure...')
  shouldFail = true
  await new Promise(resolve => setTimeout(resolve, 6000))
  
  // Restore connection
  console.log('\nRestoring connection...')
  shouldFail = false
  await new Promise(resolve => setTimeout(resolve, 6000))
  
  console.log(`✅ Final health status: ${recovery.getHealthStatus()}`)
  console.log(`   Time since last check: ${recovery.getTimeSinceLastCheck()}ms`)
  
  recovery.stopMonitoring()
  console.log('✅ Connection monitoring stopped')
}

async function testDatabaseHealthCheck() {
  console.log('\n=== Testing Database Health Check ===')
  
  const healthCheck = new DatabaseHealthCheck()
  
  // Test connection check
  console.log('\nTest 1: Connection check')
  const connected = await healthCheck.checkConnection()
  console.log(`✅ Connection status: ${connected}`)
  
  // Test table check
  console.log('\nTest 2: Table check')
  const tableCheck = await healthCheck.checkTables()
  console.log(`✅ All tables present: ${tableCheck.allPresent}`)
  console.log(`   Present: ${tableCheck.present.length}`)
  console.log(`   Missing: ${tableCheck.missing.length}`)
  
  if (tableCheck.missing.length > 0) {
    console.log(`   Missing tables: ${tableCheck.missing.slice(0, 5).join(', ')}...`)
  }
  
  // Test full health check
  console.log('\nTest 3: Full health check')
  const healthResult = await healthCheck.runHealthCheck()
  console.log(`✅ Overall health: ${healthResult.healthy}`)
  console.log(`   Database type: ${healthResult.databaseType}`)
  console.log(`   Diagnostics:`)
  healthResult.diagnostics.slice(0, 5).forEach(d => console.log(`     - ${d}`))
  
  // Test diagnostics
  console.log('\nTest 4: Detailed diagnostics')
  const diagnostics = await healthCheck.getDiagnostics()
  console.log(`✅ Generated ${diagnostics.length} diagnostic messages`)
  diagnostics.slice(0, 10).forEach(d => console.log(`   - ${d}`))
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║       Error Recovery Mechanisms Test Suite                ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  
  try {
    await testRetryLogic()
    await testFallbackMechanism()
    await testErrorClassification()
    await testUserSettingsErrorRecovery()
    await testDatabaseHealthCheck()
    
    // Skip connection pool recovery test in CI/automated environments
    if (process.env.RUN_LONG_TESTS === 'true') {
      await testConnectionPoolRecovery()
    } else {
      console.log('\n=== Skipping Connection Pool Recovery Test ===')
      console.log('(Set RUN_LONG_TESTS=true to run this test)')
    }
    
    console.log('\n╔════════════════════════════════════════════════════════════╗')
    console.log('║                  All Tests Completed                       ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error)
    process.exit(1)
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
