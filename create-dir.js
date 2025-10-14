const fs = require('fs');
const path = require('path');

// Create the database directory
const dbDir = path.join(__dirname, 'local-store', 'sqlite');
console.log('Creating directory:', dbDir);

try {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Directory created successfully');
  
  // Check if it exists
  if (fs.existsSync(dbDir)) {
    console.log('Directory exists');
  } else {
    console.log('Directory does not exist');
  }
} catch (error) {
  console.error('Error creating directory:', error.message);
}