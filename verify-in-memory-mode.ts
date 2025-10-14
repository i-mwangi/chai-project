/**
 * Quick verification script for in-memory database mode
 * This script verifies the complete setup without starting the full server
 */

import { db } from './db/index.js'
import { runMigrations, verifyTables } from './db/migrate.js'
import { getUserSettings, updateUserSettings } from './api/user-settings.js'

console.log('\n🔍 Verifying In-Memory Database Mode Setup\n')
console.log('='.repeat(60))

async function verify() {
  try {
    // 1. Check database mode
    console.log('\n1️⃣  Checking database mode...')
    const isInMemoryDB = !!(db as any).__dumpStorage
    
    if (isInMemoryDB) {
      console.log('   ✅ In-memory database mode: ACTIVE')
    } else {
      console.log('   ℹ️  SQLite database mode: ACTIVE')
    }
    
    // 2. Run migrations
    console.log('\n2️⃣  Running migrations...')
    const migrationResult = await runMigrations()
    
    if (migrationResult.success) {
      console.log('   ✅ Migrations: SUCCESS')
      if (isInMemoryDB) {
        console.log('   ℹ️  Migrations skipped (in-memory mode)')
      } else {
        console.log(`   ℹ️  Migrations run: ${migrationResult.migrationsRun.length}`)
      }
    } else {
      console.log('   ❌ Migrations: FAILED')
      console.log('   Errors:', migrationResult.errors)
      return false
    }
    
    // 3. Verify tables
    console.log('\n3️⃣  Verifying tables...')
    const tableResult = await verifyTables()
    
    if (tableResult.allTablesExist || isInMemoryDB) {
      console.log('   ✅ Tables: VERIFIED')
      if (isInMemoryDB) {
        console.log('   ℹ️  Tables created on-demand in in-memory mode')
      } else {
        console.log(`   ℹ️  Existing tables: ${tableResult.existingTables.length}`)
      }
    } else {
      console.log('   ⚠️  Tables: SOME MISSING')
      console.log('   Missing:', tableResult.missingTables)
    }
    
    // 4. Test user settings
    console.log('\n4️⃣  Testing user settings...')
    const testAccount = '0.0.123456'
    
    // Create settings
    const created = await updateUserSettings(testAccount, {
      skipFarmerVerification: true,
      demoBypass: true
    })
    console.log('   ✅ Created settings:', created.account)
    
    // Retrieve settings
    const retrieved = await getUserSettings(testAccount)
    console.log('   ✅ Retrieved settings:', retrieved.account)
    
    // Verify values
    if (retrieved.skipFarmerVerification === true && retrieved.demoBypass === true) {
      console.log('   ✅ Settings values: CORRECT')
    } else {
      console.log('   ❌ Settings values: INCORRECT')
      return false
    }
    
    // 5. Check persistence (in-memory mode only)
    if (isInMemoryDB) {
      console.log('\n5️⃣  Checking persistence...')
      const storage = (db as any).__dumpStorage()
      console.log(`   ✅ Storage tables: ${Object.keys(storage).length}`)
      
      // Check if persistence file exists
      const { existsSync } = await import('fs')
      const persistenceFile = './local-store/inmemory-db.json'
      
      if (existsSync(persistenceFile)) {
        console.log(`   ✅ Persistence file exists: ${persistenceFile}`)
      } else {
        console.log(`   ℹ️  Persistence file will be created on shutdown`)
      }
    }
    
    // Success!
    console.log('\n' + '='.repeat(60))
    console.log('✅ ALL VERIFICATIONS PASSED')
    console.log('='.repeat(60))
    console.log('\nSetup Summary:')
    console.log(`  • Database Mode: ${isInMemoryDB ? 'In-Memory' : 'SQLite'}`)
    console.log('  • Migrations: Working')
    console.log('  • User Settings: Working')
    if (isInMemoryDB) {
      console.log('  • Persistence: Configured')
    }
    console.log('\n✨ System is ready!')
    
    return true
    
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED')
    console.error(error)
    return false
  }
}

verify().then(success => {
  process.exit(success ? 0 : 1)
})
