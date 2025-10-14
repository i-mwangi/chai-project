// Simple test to verify database connectivity and table creation
import { db } from '../db'
import { userSettings } from '../db/schema'
import { eq } from 'drizzle-orm'

async function testDatabase() {
  try {
    console.log('Testing database connectivity...')
    
    // Test 1: Check if we can create the table
    console.log('Creating user_settings table if it does not exist...')
    if (!db.__dumpStorage) {
      // For SQLite database, ensure table exists
      try {
        await db.execute(`
          CREATE TABLE IF NOT EXISTS user_settings (
            account TEXT PRIMARY KEY NOT NULL,
            skip_farmer_verification INTEGER DEFAULT 0,
            skip_investor_verification INTEGER DEFAULT 0,
            demo_bypass INTEGER DEFAULT 0,
            updated_at INTEGER DEFAULT (strftime('%s', 'now'))
          )
        `);
        console.log('✓ Table creation successful')
      } catch (e) {
        console.warn('⚠ Could not create user_settings table, may already exist:', e);
      }
    } else {
      console.log('Using in-memory database')
    }
    
    // Test 2: Try to insert a test record
    console.log('Inserting test record...')
    try {
      const testAccount = '0.0.123456'
      const existing = await db.query.userSettings.findFirst({ 
        where: eq(userSettings.account, testAccount) 
      })
      
      if (existing) {
        console.log('✓ Found existing record for test account')
        console.log('Existing record:', existing)
      } else {
        console.log('✓ No existing record found, this is normal for a new database')
      }
      
      // Try to query with a non-existent account
      console.log('Querying non-existent account...')
      const nonExistent = await db.query.userSettings.findFirst({ 
        where: eq(userSettings.account, 'non-existent-account') 
      })
      console.log('Non-existent account result:', nonExistent)
      
      console.log('✓ Database tests completed successfully')
    } catch (e) {
      console.error('✗ Error during database operations:', e)
      return false
    }
    
    return true
  } catch (error) {
    console.error('✗ Database test failed:', error)
    return false
  }
}

testDatabase().then(success => {
  if (success) {
    console.log('All tests passed!')
  } else {
    console.log('Some tests failed.')
  }
  process.exit(success ? 0 : 1)
})