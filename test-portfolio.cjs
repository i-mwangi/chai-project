const http = require('http');

// Test portfolio after marketplace purchase
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
        const result = JSON.parse(portfolioData);
        console.log('Portfolio Holdings Count:', result.portfolio.holdings.length);
        if (result.portfolio.holdings.length > 0) {
            console.log('First Holding Grove:', result.portfolio.holdings[0].groveName);
            console.log('First Holding Tokens:', result.portfolio.holdings[0].tokenAmount);
            console.log('Total Investment:', result.portfolio.totalInvestment);
        } else {
            console.log('No holdings found');
        }
    });
});

portfolioReq.on('error', (error) => {
    console.error('Portfolio Request Error:', error);
});

portfolioReq.end();