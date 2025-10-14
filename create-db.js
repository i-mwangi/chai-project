const fs = require('fs');
const path = require('path');

// Create the database directory structure
const dbDir = path.join(__dirname, 'local-store', 'sqlite');
console.log('Creating database directory:', dbDir);

try {
  // Create directory recursively
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Database directory created successfully');
  
  // Check if directory exists
  if (fs.existsSync(dbDir)) {
    console.log('Database directory exists');
  } else {
    console.log('Database directory does not exist');
  }
} catch (error) {
  console.error('Error creating database directory:', error.message);
}

// Now let's try to create the database file
try {
  const Database = require('better-sqlite3');
  
  // Create the database file
  const dbPath = path.join(dbDir, 'sqlite.db');
  console.log('Database file path:', dbPath);
  
  const db = new Database(dbPath);
  console.log('Database file created successfully');
  
  // Create a simple table to test
  db.exec('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)');
  console.log('Test table created');
  
  // Insert a test record
  db.exec("INSERT INTO test (name) VALUES ('test record')");
  console.log('Test record inserted');
  
  // Query the table
  const rows = db.prepare('SELECT * FROM test').all();
  console.log('Table contents:', rows);
  
  db.close();
  console.log('Database operations completed');
} catch (error) {
  console.error('Error with database operations:', error.message);
}