const http = require('http');

const postData = JSON.stringify({
  groveId: '1',
  amount: 100,
  farmerAddress: '0.0.123456'
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/revenue/withdraw-farmer-share',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();