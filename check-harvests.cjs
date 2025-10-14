// Simple script to check harvest records in the database
const fs = require('fs');
const path = require('path');

// Path to the in-memory database file
const dbPath = path.join(__dirname, 'local-store', 'inmemory-db.json');

try {
  if (fs.existsSync(dbPath)) {
    const dbContent = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbContent);
    
    console.log('Database contents:');
    console.log(JSON.stringify(db, null, 2));
    
    // Look for harvest records specifically
    if (db.harvest_records) {
      console.log('\nHarvest records:');
      console.log(JSON.stringify(db.harvest_records, null, 2));
    } else {
      console.log('\nNo harvest_records table found');
    }
  } else {
    console.log('Database file not found at:', dbPath);
  }
} catch (error) {
  console.error('Error reading database:', error.message);
}