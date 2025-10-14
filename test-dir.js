const fs = require('fs');
const path = require('path');

// Try to create the directory
try {
  const dirPath = path.join(__dirname, 'local-store', 'sqlite');
  console.log('Attempting to create directory:', dirPath);
  fs.mkdirSync(dirPath, { recursive: true });
  console.log('Directory created successfully');
  
  // Check if it exists
  if (fs.existsSync(dirPath)) {
    console.log('Directory exists');
  } else {
    console.log('Directory does not exist');
  }
} catch (error) {
  console.error('Error creating directory:', error.message);
}