#!/usr/bin/env node
/**
 * Test the /api/health endpoint
 * This simulates what would happen when the endpoint is called
 */

import { runHealthCheck } from './db/health-check'

async function testHealthEndpoint() {
    console.log('🧪 Testing /api/health endpoint\n')
    
    console.log('Simulating GET /api/health request...\n')
    
    // This is what happens inside the endpoint handler
    const healthResult = await runHealthCheck()
    
    // Determine status code
    const statusCode = healthResult.healthy ? 200 : 503
    
    // Build response
    const response = {
        success: healthResult.healthy,
        ...healthResult
    }
    
    // Display results
    console.log(`HTTP Status: ${statusCode} ${statusCode === 200 ? 'OK' : 'Service Unavailable'}`)
    console.log('\nResponse Body:')
    console.log(JSON.stringify(response, null, 2))
    
    console.log('\n' + '='.repeat(60))
    console.log('Endpoint Test Summary:')
    console.log(`  Status Code: ${statusCode}`)
    console.log(`  Healthy: ${healthResult.healthy ? '✅' : '❌'}`)
    console.log(`  Connection: ${healthResult.connection ? '✅' : '❌'}`)
    console.log(`  All Tables Present: ${healthResult.tables.allPresent ? '✅' : '⚠️'}`)
    console.log(`  Database Type: ${healthResult.databaseType}`)
    console.log(`  Tables Found: ${healthResult.tables.present.length}`)
    
    if (healthResult.tables.missing.length > 0) {
        console.log(`  Missing Tables: ${healthResult.tables.missing.length}`)
    }
    
    console.log('\n✅ Health endpoint test completed successfully!')
}

testHealthEndpoint().catch(error => {
    console.error('❌ Test failed:', error)
    process.exit(1)
})
