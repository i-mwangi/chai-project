const fs = require('fs');
fs.mkdirSync('local-store/sqlite', { recursive: true });
console.log('Directory created successfully');