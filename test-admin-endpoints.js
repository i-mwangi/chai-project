// Test admin verification endpoints
async function testAdminEndpoints() {
    const baseUrl = 'http://localhost:3001';
    
    console.log('Testing admin verification endpoints...\n');
    
    // Test 1: Get pending verifications
    console.log('1. Testing GET /api/investor-verification/pending');
    try {
        const response = await fetch(`${baseUrl}/api/investor-verification/pending`);
        console.log('Status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Pending verifications:', JSON.stringify(data, null, 2));
        } else {
            console.log('Error:', await response.text());
        }
    } catch (error) {
        console.error('Request failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Get verification metrics
    console.log('2. Testing GET /api/investor-verification/metrics');
    try {
        const response = await fetch(`${baseUrl}/api/investor-verification/metrics`);
        console.log('Status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Verification metrics:', JSON.stringify(data, null, 2));
        } else {
            console.log('Error:', await response.text());
        }
    } catch (error) {
        console.error('Request failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Test process verification endpoint (this will fail without valid data, but we can test the validation)
    console.log('3. Testing POST /api/investor-verification/process (validation test)');
    try {
        const response = await fetch(`${baseUrl}/api/investor-verification/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Missing required fields to test validation
            })
        });
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Request failed:', error.message);
    }
}

testAdminEndpoints();