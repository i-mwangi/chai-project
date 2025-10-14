const fs = require('fs');
const path = require('path');
const { Database } = require('better-sqlite3');

// Check if database file exists
const dbPath = path.join(__dirname, 'local-store', 'sqlite', 'sqlite.db');
console.log('Database path:', dbPath);

if (!fs.existsSync(dbPath)) {
  console.log('❌ Database file does not exist');
  process.exit(1);
}

console.log('✅ Database file exists');

try {
  // Connect to the database
  const db = new Database(dbPath);
  console.log('✅ Connected to database');
  
  // Check if user_settings table exists
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_settings'").get();
  if (tableExists) {
    console.log('✅ user_settings table exists');
    
    // Try to query the table
    try {
      const rows = db.prepare("SELECT * FROM user_settings LIMIT 1").all();
      console.log('✅ Successfully queried user_settings table');
      console.log('Sample row:', rows[0] || 'No rows found');
    } catch (queryError) {
      console.log('❌ Error querying user_settings table:', queryError.message);
    }
  } else {
    console.log('❌ user_settings table does not exist');
  }
  
  // List all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('\n📋 All tables in database:');
  tables.forEach(table => {
    console.log('- ' + table.name);
  });
  
  db.close();
} catch (error) {
  console.error('❌ Error connecting to database:', error.message);
  process.exit(1);
}