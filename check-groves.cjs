const http = require('http');

console.log('Checking groves in database...');

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/groves?farmerAddress=0.0.123456',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Groves response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error checking groves:', error);
});

req.end();