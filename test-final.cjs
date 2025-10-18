const http = require('http');

const postData = JSON.stringify({
  farmerAddress: '0.0.123456',
  groveName: 'Test Grove',
  location: 'Test Location',
  coordinates: {
    lat: 9.7489,
    lng: -83.7534
  },
  treeCount: 150,
  coffeeVariety: 'Arabica',
  expectedYieldPerTree: 4.5
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/groves/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(postData);
req.end();