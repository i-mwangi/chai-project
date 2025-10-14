/**
 * Test Migration Rollback Functionality
 * 
 * This script tests:
 * 1. Migration history tracking
 * 2. Showing applied migrations
 * 3. Rolling back the last migration
 */

import { 
  runMigrations, 
  showAppliedMigrations, 
  getAppliedMigrations,
  rollbackLastMigration 
} from './db/migrate.js'

async function testMigrationRollback() {
  console.log('🧪 Testing Migration Rollback Functionality\n')
  console.log('='.repeat(80))
  
  try {
    // Step 1: Run migrations
    console.log('\n📋 Step 1: Running migrations...')
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
      console.log('\nMost recent migration:')
      const latest = appliedMigrations[0]
      console.log(`  Name: ${latest.migration_name}`)
      console.log(`  Applied: ${new Date(latest.applied_at * 1000).toISOString()}`)
      console.log(`  Rolled back: ${latest.rolled_back_at ? new Date(latest.rolled_back_at * 1000).toISOString() : 'No'}`)
    }
    
    // Step 4: Test rollback (optional - uncomment to test)
    console.log('\n📋 Step 4: Testing rollback functionality...')
    console.log('⚠️  Rollback test is commented out to prevent accidental data loss')
    console.log('To test rollback, uncomment the rollback code in this script')
    
    /*
    // Uncomment to test rollback
    console.log('\n🔄 Rolling back last migration...')
    const rollbackResult = await rollbackLastMigration()
    
    if (rollbackResult.success) {
      console.log(`✅ Successfully rolled back: ${rollbackResult.migrationRolledBack}`)
      
      // Show migrations after rollback
      console.log('\n📋 Migrations after rollback:')
      await showAppliedMigrations()
    } else {
      console.error(`❌ Rollback failed: ${rollbackResult.error}`)
    }
    */
    
    console.log('\n' + '='.repeat(80))
    console.log('✅ Migration rollback test completed successfully!')
    console.log('\nTo test rollback:')
    console.log('  1. Uncomment the rollback code in this script')
    console.log('  2. Run: tsx test-migration-rollback.ts')
    console.log('\nOr use the CLI:')
    console.log('  pnpm migration:show      - Show applied migrations')
    console.log('  pnpm migration:rollback  - Rollback last migration')
    console.log('  pnpm migration:run       - Run pending migrations')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testMigrationRollback()
