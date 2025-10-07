/**
 * Quick test script for lending endpoints
 * Run with: node test-lending-endpoints.js
 */

const API_BASE = 'http://localhost:3001'

async function testEndpoint(method, path, body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    
    if (body) {
        options.body = JSON.stringify(body)
    }
    
    try {
        const response = await fetch(`${API_BASE}${path}`, options)
        const data = await response.json()
        console.log(`✓ ${method} ${path}`)
        console.log('  Response:', JSON.stringify(data, null, 2))
        return data
    } catch (error) {
        console.log(`✗ ${method} ${path}`)
        console.log('  Error:', error.message)
        return null
    }
}

async function runTests() {
    console.log('Testing Lending Pool Endpoints...\n')
    
    // Test 1: Get lending pools
    await testEndpoint('GET', '/api/lending/pools')
    console.log()
    
    // Test 2: Get pool stats
    await testEndpoint('GET', '/api/lending/pool-stats?assetAddress=0x123456')
    console.log()
    
    // Test 3: Provide liquidity
    await testEndpoint('POST', '/api/lending/provide-liquidity', {
        assetAddress: '0x123456',
        amount: 1000
    })
    console.log()
    
    // Test 4: Withdraw liquidity
    await testEndpoint('POST', '/api/lending/withdraw-liquidity', {
        assetAddress: '0x123456',
        lpTokenAmount: 500
    })
    console.log()
    
    console.log('Testing Loan Management Endpoints...\n')
    
    // Test 5: Calculate loan terms
    await testEndpoint('POST', '/api/lending/calculate-loan-terms', {
        assetAddress: '0x123456',
        loanAmount: 5000
    })
    console.log()
    
    // Test 6: Take loan
    await testEndpoint('POST', '/api/lending/take-loan', {
        assetAddress: '0x123456',
        loanAmount: 5000
    })
    console.log()
    
    // Test 7: Get loan details
    await testEndpoint('GET', '/api/lending/loan-details?borrowerAddress=0x789abc&assetAddress=0x123456')
    console.log()
    
    // Test 8: Repay loan
    await testEndpoint('POST', '/api/lending/repay-loan', {
        assetAddress: '0x123456'
    })
    console.log()
    
    console.log('All tests completed!')
}

// Run tests
runTests().catch(console.error)
