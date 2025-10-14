// Test if groves are loading from the API
import http from 'http';

const testGroveAPI = () => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/investment/available-groves',
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
                    console.log('=== Available Groves API Test ===');
                    console.log('Status Code:', res.statusCode);
                    console.log('Success:', response.success);
                    console.log('Number of groves:', response.groves?.length || 0);
                    
                    if (response.groves && response.groves.length > 0) {
                        console.log('\nFirst grove:');
                        console.log(JSON.stringify(response.groves[0], null, 2));
                        
                        console.log('\nAll grove IDs:');
                        response.groves.forEach((grove: any, index: number) => {
                            console.log(`${index + 1}. ${grove.id} - ${grove.groveName}`);
                        });
                    } else {
                        console.log('\n⚠️  NO GROVES FOUND!');
                        console.log('This is why buttons appear inactive - there are no groves to display.');
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

testGroveAPI().catch(console.error);
