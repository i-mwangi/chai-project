// Simple test for investor verification API
import fetch from 'node-fetch';

async function testInvestorAPI() {
    const testAddress = '0.0.123456';
    const url = `http://localhost:3001/api/investor-verification/status/${testAddress}`;
    
    console.log('Testing investor verification API...');
    console.log('URL:', url);
    
    try {
        const response = await fetch(url);
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('Error response:', await response.text());
        }
    } catch (error) {
        console.error('Request failed:', error.message);
    }
}

testInvestorAPI();