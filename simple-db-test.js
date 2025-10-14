/**
 * Simple Database Test
 * Tests database functionality without imports
 */

console.log('Starting simple database test...');

// Create the database directory if it doesn't exist
const dbDir = path.join(__dirname, 'local-store', 'sqlite');
console.log('Database directory:', dbDir);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created database directory');
} else {
  console.log('Database directory already exists');
}

try {
  // Import better-sqlite3
  const Database = require('better-sqlite3');
  console.log('Successfully imported better-sqlite3');
  
  // Create/connect to the database
  const dbPath = path.join(dbDir, 'sqlite.db');
  console.log('Database path:', dbPath);
  
  const db = new Database(dbPath);
  console.log('Connected to database successfully');
  
  // Test with a simple query
  const result = db.prepare('SELECT 1 as test').get();
  console.log('Database test query result:', result);
  
  db.close();
  console.log('Database test completed successfully');
} catch (error) {
  console.error('Error:', error.message);
}