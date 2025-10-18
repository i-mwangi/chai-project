const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/market/prices',
  method: 'GET'
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