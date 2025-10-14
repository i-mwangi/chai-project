/**
 * Test Migration Rollback with SQLite
 * 
 * This test uses a real SQLite database to test rollback functionality
 */

import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'

// Test database path
const TEST_DB_PATH = './local-store/sqlite/test-migration.db'

async function testWithSQLite() {
  console.log('🧪 Testing Migration Rollback with SQLite\n')
  console.log('='.repeat(80))
  
  try {
    // Clean up test database if it exists
    if (existsSync(TEST_DB_PATH)) {
      console.log('🧹 Cleaning up existing test database...')
      unlinkSync(TEST_DB_PATH)
    }
    
    // Set environment to use SQLite
    process.env.DISABLE_INVESTOR_KYC = 'false'
    process.env.DATABASE_URL = `file:${TEST_DB_PATH}`
    
    console.log('📋 Database path:', TEST_DB_PATH)
    console.log('📋 Using SQLite database\n')
    
    // Import migration functions after setting environment
    const { 
      runMigrations, 
      showAppliedMigrations, 
      getAppliedMigrations,
      rollbackLastMigration 
    } = await import('./db/migrate.js')
    
    // Step 1: Run migrations
    console.log('📋 Step 1: Running migrations...')
    const migrationResult = await runMigrations()
    
    if (!migrationResult.success) {
      console.error('❌ Migration failed:', migrationResult.errors)
      return
    }
    
    console.log(`✅ Migrations completed. Ran ${migrationResult.migrationsRun.length} migrations`)
    
    // Step 2: Show applied migrations
    console.log('\n📋 Step 2: Showing applied migrations...')
    await showAppliedMigrations()
    
    // Step 3: Get applied migrations programmatically
    console.log('\n📋 Step 3: Getting applied migrations programmatically...')
    const appliedMigrations = await getAppliedMigrations()
    console.log(`Found ${appliedMigrations.length} applied migrations`)
    
    if (appliedMigrations.length > 0) {
      console.log('\nMost recent migrations:')
      for (let i = 0; i < Math.min(3, appliedMigrations.length); i++) {
        const migration = appliedMigrations[i]
        console.log(`  ${i + 1}. ${migration.migration_name}`)
        console.log(`     Applied: ${new Date(migration.applied_at * 1000).toISOString()}`)
      }
    }
    
    // Step 4: Test rollback
    console.log('\n📋 Step 4: Testing rollback functionality...')
    
    if (appliedMigrations.length === 0) {
      console.log('⚠️  No migrations to rollback')
    } else {
      console.log(`\n🔄 Rolling back last migration: ${appliedMigrations[0].migration_name}`)
      const rollbackResult = await rollbackLastMigration()
      
      if (rollbackResult.success) {
        console.log(`✅ Successfully rolled back: ${rollbackResult.migrationRolledBack}`)
        
        // Show migrations after rollback
        console.log('\n📋 Migrations after rollback:')
        await showAppliedMigrations()
        
        // Re-run migrations
        console.log('\n📋 Re-running migrations...')
        const rerunResult = await runMigrations()
        console.log(`✅ Re-ran ${rerunResult.migrationsRun.length} migrations`)
        
      } else {
        console.error(`❌ Rollback failed: ${rollbackResult.error}`)
      }
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('✅ SQLite migration rollback test completed successfully!')
    
    // Clean up
    console.log('\n🧹 Cleaning up test database...')
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH)
      console.log('✅ Test database cleaned up')
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    
    // Clean up on error
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH)
    }
    
    process.exit(1)
  }
}

// Run the test
testWithSQLite()
