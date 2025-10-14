// Test the purchase API directly
import http from 'http';

const testPurchase = (groveId: number, tokenAmount: number, investorAddress: string) => {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            groveId,
            tokenAmount,
            investorAddress
        });

        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/investment/purchase-tokens',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log('=== Testing Purchase API ===');
        console.log('Request:', { groveId, tokenAmount, investorAddress });
        console.log('');

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('Status Code:', res.statusCode);
                    console.log('Response:');
                    console.log(JSON.stringify(response, null, 2));
                    
                    if (response.success) {
                        console.log('\n✅ Purchase successful!');
                        console.log('Holding ID:', response.data.holdingId);
                        console.log('Grove:', response.data.groveName);
                        console.log('Tokens:', response.data.tokenAmount);
                        console.log('Total Cost: $' + response.data.totalCost);
                    } else {
                        console.log('\n❌ Purchase failed:', response.error);
                    }
                    
                    resolve(response);
                } catch (error) {
                    console.error('Error parsing response:', error);
                    console.log('Raw response:', data);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error('Request error:', error);
            console.log('\n❌ Could not connect to API server');
            console.log('Make sure the API server is running on port 3001');
            reject(error);
        });

        req.write(postData);
        req.end();
    });
};

// Test with sample data
const groveId = 1;
const tokenAmount = 10;
const investorAddress = '0.0.TEST_INVESTOR';

console.log('Testing token purchase...\n');

testPurchase(groveId, tokenAmount, investorAddress)
    .then(() => {
        console.log('\n=== Test Complete ===');
        console.log('Now run: npx tsx check-database-holdings.ts');
        console.log('to verify the holding was created');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n=== Test Failed ===');
        process.exit(1);
    });
