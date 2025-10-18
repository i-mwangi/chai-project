const http = require('http');

// Test the updated API client method
// Simulate what the dashboard is doing
const postData = JSON.stringify({
  variety: 'Arabica',
  days: 7
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/market/prices',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.success && response.data && response.data.prices) {
        // Transform current prices into historical data format
        const history = response.data.prices.map(price => ({
          timestamp: new Date(price.timestamp).getTime(),
          price: price.pricePerKg
        }));
        console.log('Transformed history data:', history);
        console.log('Success: true, history array length:', history.length);
      }
    } catch (error) {
      console.error('Error parsing response:', error);
    }
    console.log('Request completed');
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();