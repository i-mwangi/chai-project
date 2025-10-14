import { db } from '../db'
import { userSettings } from '../db/schema'
import { eq } from 'drizzle-orm'

async function testUserSettings() {
  try {
    console.log('Testing user settings database access...')
    
    // Try to create the table if it doesn't exist
    console.log('Ensuring user_settings table exists...')
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
        console.log('user_settings table created or already exists')
      } catch (e) {
        console.warn('Could not create user_settings table:', e);
      }
    }
    
    // Try to query the table
    console.log('Querying user settings...')
    const settings = await db.query.userSettings.findFirst({ 
      where: eq(userSettings.account, '0.0.123456') 
    })
    console.log('Found settings:', settings)
    
    console.log('Test completed successfully')
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testUserSettings()