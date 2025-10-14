const http = require('http');

// First, let's register a grove to ensure we have one to report harvest for
const groveData = {
  farmerAddress: '0.0.123456',
  groveName: 'Test Grove',
  location: 'Test Location',
  coordinates: { lat: 9.770641, lng: -83.651711 },
  treeCount: 8000,
  coffeeVariety: 'Arabica',
  expectedYieldPerTree: 100
};

console.log('Registering grove...');
const registerGroveReq = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/farmer-verification/register-grove',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Grove registration response:', data);
    
    // Now test harvest reporting
    setTimeout(() => {
      console.log('\nTesting harvest reporting...');
      const harvestData = {
        groveName: 'Test Grove',
        farmerAddress: '0.0.123456',
        yieldKg: 500,
        qualityGrade: 85,
        salePricePerKg: 4.50
      };

      const harvestReq = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/harvest/report',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          console.log('Harvest reporting response:', data);
        });
      });

      harvestReq.on('error', (error) => {
        console.error('Harvest reporting error:', error);
      });

      harvestReq.write(JSON.stringify(harvestData));
      harvestReq.end();
    }, 2000);
  });
});

registerGroveReq.on('error', (error) => {
  console.error('Grove registration error:', error);
});

registerGroveReq.write(JSON.stringify(groveData));
registerGroveReq.end();