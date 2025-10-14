const fs = require('fs');
const path = require('path');

// Check if database file exists
const dbPath = path.join(__dirname, 'local-store', 'sqlite', 'sqlite.db');
console.log('Database path:', dbPath);

if (!fs.existsSync(dbPath)) {
  console.log('Database file does not exist');
  process.exit(1);
}

console.log('Database file exists');

// Try to read the file to see if it's accessible
try {
  const stats = fs.statSync(dbPath);
  console.log('File size:', stats.size, 'bytes');
  
  // Read first few bytes to see if it's a valid SQLite file
  const buffer = Buffer.alloc(16);
  const fd = fs.openSync(dbPath, 'r');
  fs.readSync(fd, buffer, 0, 16, 0);
  fs.closeSync(fd);
  
  // Check SQLite header
  const header = buffer.toString('utf8', 0, 16);
  console.log('File header:', header);
  
  if (header.startsWith('SQLite format 3')) {
    console.log('Valid SQLite database file');
  } else {
    console.log('Not a valid SQLite database file');
  }
} catch (err) {
  console.error('Error reading file:', err.message);
  process.exit(1);
}