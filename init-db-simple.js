const fs = require('fs');
const path = require('path');

// Create the database directory if it doesn't exist
const dbDir = path.join(__dirname, 'local-store', 'sqlite');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created database directory:', dbDir);
}

try {
  // Import better-sqlite3
  const Database = require('better-sqlite3');
  
  // Create/connect to the database
  const dbPath = path.join(dbDir, 'sqlite.db');
  console.log('Database path:', dbPath);
  
  const db = new Database(dbPath);
  console.log('Connected to database successfully');
  
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
  console.log('Created/verified user_settings table');
  
  // Insert a default record for testing
  const insertSQL = `
    INSERT OR IGNORE INTO user_settings (account, skip_farmer_verification, skip_investor_verification, demo_bypass)
    VALUES ('0.0.123456', 0, 0, 0);
  `;
  
  db.exec(insertSQL);
  console.log('Inserted default user settings record');
  
  // Query to verify
  const rows = db.prepare('SELECT * FROM user_settings').all();
  console.log('Current user settings:', rows);
  
  db.close();
  console.log('Database initialization completed successfully');
} catch (error) {
  console.error('Error initializing database:', error.message);
  console.error('Stack trace:', error.stack);
}