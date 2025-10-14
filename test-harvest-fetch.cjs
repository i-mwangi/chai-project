const http = require('http');

console.log('Testing harvest history fetch...');

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/harvest/history?farmerAddress=0.0.123456',
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
    console.log('Response status:', res.statusCode);
    console.log('Response:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('\nParsed response:');
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.data && parsed.data.harvests) {
        console.log('\nNumber of harvests:', parsed.data.harvests.length);
        console.log('First harvest:', parsed.data.harvests[0]);
      }
    } catch (e) {
      console.error('Failed to parse JSON:', e);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();
