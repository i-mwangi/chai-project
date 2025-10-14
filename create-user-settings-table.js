const fs = require('fs');
const path = require('path');
const { Database } = require('better-sqlite3');

// Ensure the directory exists
const dbDir = path.join(__dirname, 'local-store', 'sqlite');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create or open the database
const dbPath = path.join(dbDir, 'sqlite.db');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Create the user_settings table
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS user_settings (
      account TEXT PRIMARY KEY NOT NULL,
      skip_farmer_verification INTEGER DEFAULT 0,
      skip_investor_verification INTEGER DEFAULT 0,
      demo_bypass INTEGER DEFAULT 0,
      updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
  `;
  
  db.exec(createTableSQL);
  console.log('✅ user_settings table created successfully');
  
  // Verify the table was created
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_settings'").get();
  if (tables) {
    console.log('✅ Verified: user_settings table exists');
    
    // Show table schema
    const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='user_settings'").get();
    console.log('Table schema:', schema.sql);
  } else {
    console.log('❌ user_settings table was not created');
  }
  
  db.close();
} catch (error) {
  console.error('❌ Error creating user_settings table:', error.message);
}