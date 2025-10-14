// Test portfolio API to see if investments are being recorded
import http from 'http';

const testPortfolioAPI = (investorAddress: string) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: `/api/investment/portfolio?investorAddress=${investorAddress}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('=== Portfolio API Test ===');
                    console.log('Status Code:', res.statusCode);
                    console.log('Investor Address:', investorAddress);
                    console.log('\nResponse:');
                    console.log(JSON.stringify(response, null, 2));
                    
                    if (response.success && response.portfolio) {
                        console.log('\n=== Portfolio Summary ===');
                        console.log('Total Investment:', response.portfolio.totalInvestment);
                        console.log('Total Holdings:', response.portfolio.totalHoldings);
                        console.log('Number of Holdings:', response.portfolio.holdings?.length || 0);
                        
                        if (response.portfolio.holdings && response.portfolio.holdings.length > 0) {
                            console.log('\n=== Holdings Details ===');
                            response.portfolio.holdings.forEach((holding: any, index: number) => {
                                console.log(`\n${index + 1}. ${holding.groveName}`);
                                console.log(`   Grove ID: ${holding.groveId}`);
                                console.log(`   Tokens: ${holding.tokenAmount}`);
                                console.log(`   Purchase Price: $${holding.purchasePrice}`);
                                console.log(`   Purchase Date: ${holding.purchaseDate}`);
                            });
                        } else {
                            console.log('\n⚠️  NO HOLDINGS FOUND!');
                            console.log('This means either:');
                            console.log('1. The investment transaction failed');
                            console.log('2. The token purchase was not recorded in the database');
                            console.log('3. The investor address does not match');
                        }
                    }
                    
                    resolve(response);
                } catch (error) {
                    console.error('Error parsing response:', error);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error('Request error:', error);
            reject(error);
        });

        req.end();
    });
};

// Test with a sample investor address
// Replace this with your actual investor address from the wallet
const investorAddress = process.argv[2] || '0.0.123456';

console.log('Testing portfolio for investor:', investorAddress);
console.log('Usage: npx tsx test-portfolio-api.ts <investor-address>\n');

testPortfolioAPI(investorAddress).catch(console.error);
