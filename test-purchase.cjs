const http = require('http');

// Test purchasing tokens
const purchaseData = JSON.stringify({
    groveId: '1',
    tokenAmount: 10,
    investorAddress: '0.0.194774'
});

const purchaseOptions = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/investment/purchase-tokens',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(purchaseData)
    }
};

const purchaseReq = http.request(purchaseOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Purchase Response Status:', res.statusCode);
        console.log('Purchase Response:', JSON.parse(data));
        
        // Now test portfolio
        const portfolioOptions = {
            hostname: 'localhost',
            port: 3002,
            path: '/api/investment/portfolio?investorAddress=0.0.194774',
            method: 'GET'
        };
        
        const portfolioReq = http.request(portfolioOptions, (res) => {
            let portfolioData = '';
            
            res.on('data', (chunk) => {
                portfolioData += chunk;
            });
            
            res.on('end', () => {
                console.log('Portfolio Response Status:', res.statusCode);
                console.log('Portfolio Response:', JSON.parse(portfolioData));
            });
        });
        
        portfolioReq.on('error', (error) => {
            console.error('Portfolio Request Error:', error);
        });
        
        portfolioReq.end();
    });
});

purchaseReq.on('error', (error) => {
    console.error('Purchase Request Error:', error);
});

purchaseReq.write(purchaseData);
purchaseReq.end();