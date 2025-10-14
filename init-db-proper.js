import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { userSettings } from './db/schema'
import { eq } from 'drizzle-orm'

// Create the database instance
const sqlite = new Database('./local-store/sqlite/sqlite.db')
const db = drizzle(sqlite)

async function initializeDatabase() {
  try {
    console.log('Initializing database...')
    
    // Create the user_settings table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS user_settings (
        account TEXT PRIMARY KEY NOT NULL,
        skip_farmer_verification INTEGER DEFAULT 0,
        skip_investor_verification INTEGER DEFAULT 0,
        demo_bypass INTEGER DEFAULT 0,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `)
    
    console.log('Database initialized successfully')
    
    // Test inserting a record
    console.log('Testing database operations...')
    const testAccount = '0.0.123456'
    
    // Try to insert a test record
    const stmt = sqlite.prepare(`
      INSERT OR REPLACE INTO user_settings (account, skip_farmer_verification, skip_investor_verification, demo_bypass)
      VALUES (?, ?, ?, ?)
    `)
    
    const result = stmt.run(testAccount, 0, 0, 0)
    console.log('Insert result:', result)
    
    // Try to query the record
    const selectStmt = sqlite.prepare('SELECT * FROM user_settings WHERE account = ?')
    const row = selectStmt.get(testAccount)
    console.log('Query result:', row)
    
    console.log('Database test completed successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)
  }
}

initializeDatabase()