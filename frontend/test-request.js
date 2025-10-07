import http from 'http';

// Test request to our server
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/app.html?groveId=3&amount=35404',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
    
    res.on('data', (chunk) => {
        console.log(`Body: ${chunk}`);
    });
    
    res.on('end', () => {
        console.log('Request completed');
    });
});

req.on('error', (error) => {
    console.error('Request error:', error);
});

req.end();