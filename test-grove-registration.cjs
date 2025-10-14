const http = require('http');

const data = JSON.stringify({
  farmerAddress: '0.0.123456',
  groveName: 'henry',
  location: 'muranga',
  coordinates: {
    lat: 9.770641,
    lng: -83.651711
  },
  treeCount: 8000,
  coffeeVariety: 'Arabica',
  expectedYieldPerTree: 100
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/farmer-verification/register-grove',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (error) => {
  console.error(`Problem with request: ${error.message}`);
});

req.write(data);
req.end();