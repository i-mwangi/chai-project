// Simple script to test database connection and check harvest records
const fs = require('fs');
const path = require('path');

// Path to the in-memory database file
const dbPath = path.join(__dirname, 'local-store', 'inmemory-db.json');

console.log('Checking database file at:', dbPath);

try {
  if (fs.existsSync(dbPath)) {
    const dbContent = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbContent);
    
    console.log('Database contents:');
    console.log(JSON.stringify(db, null, 2));
    
    // Look for harvest records specifically
    let foundHarvestRecords = false;
    for (const [tableName, tableData] of Object.entries(db)) {
      if (tableName.includes('harvest') || tableName.includes('Harvest')) {
        console.log(`\nFound harvest-related table: ${tableName}`);
        console.log(JSON.stringify(tableData, null, 2));
        foundHarvestRecords = true;
      }
    }
    
    if (!foundHarvestRecords) {
      console.log('\nNo harvest-related tables found');
    }
  } else {
    console.log('Database file not found');
  }
} catch (error) {
  console.error('Error reading database:', error.message);
}