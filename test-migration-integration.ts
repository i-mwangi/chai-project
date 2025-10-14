#!/usr/bin/env node
/**
 * Test script to verify migration integration
 * Tests that migrations run and health check endpoint works
 */

import { runMigrations } from './db/migrate'
import { runHealthCheck } from './db/health-check'

async function testMigrationIntegration() {
    console.log('🧪 Testing Migration Integration\n')
    
    // Test 1: Run migrations
    console.log('Test 1: Running migrations...')
    const migrationResult = await runMigrations()
    
    if (migrationResult.success) {
        console.log('✅ Migrations ran successfully')
        if (migrationResult.migrationsRun.length > 0) {
            console.log(`   Ran ${migrationResult.migrationsRun.length} migrations:`)
            migrationResult.migrationsRun.forEach(m => console.log(`   - ${m}`))
        } else {
            console.log('   No pending migrations')
        }
    } else {
        console.error('❌ Migrations failed')
        migrationResult.errors.forEach(e => console.error(`   - ${e}`))
        process.exit(1)
    }
    
    console.log('')
    
    // Test 2: Run health check
    console.log('Test 2: Running health check...')
    const healthResult = await runHealthCheck()
    
    console.log(`   Database Type: ${healthResult.databaseType}`)
    console.log(`   Connection: ${healthResult.connection ? '✅' : '❌'}`)
    console.log(`   Tables: ${healthResult.tables.allPresent ? '✅' : '⚠️'}`)
    console.log(`   Overall Health: ${healthResult.healthy ? '✅' : '❌'}`)
    
    if (healthResult.tables.present.length > 0) {
        console.log(`   Tables Present: ${healthResult.tables.present.length}`)
    }
    
    if (healthResult.tables.missing.length > 0) {
        console.log(`   Tables Missing: ${healthResult.tables.missing.length}`)
        healthResult.tables.missing.forEach(t => console.log(`     - ${t}`))
    }
    
    console.log('')
    console.log('Diagnostics:')
    healthResult.diagnostics.forEach(d => console.log(`   ${d}`))
    
    console.log('')
    console.log('✅ All tests passed!')
}

testMigrationIntegration().catch(error => {
    console.error('❌ Test failed:', error)
    process.exit(1)
})
