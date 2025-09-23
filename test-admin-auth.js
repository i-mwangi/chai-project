// Test admin authorization for investor verification endpoints
async function testAdminAuth() {
    const baseUrl = 'http://localhost:3001';
    const adminToken = 'admin-secret-token'; // Default token from code
    
    console.log('Testing admin authorization...\n');
    
    // Test 1: Access without authorization (should fail)
    console.log('1. Testing access without authorization (should fail)');
    try {
        const response = await fetch(`${baseUrl}/api/investor-verification/pending`);
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Request failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Access with invalid token (should fail)
    console.log('2. Testing access with invalid token (should fail)');
    try {
        const response = await fetch(`${baseUrl}/api/investor-verification/pending`, {
            headers: {
                'Authorization': 'Bearer invalid-token'
            }
        });
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Request failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Access with valid admin token (should succeed)
    console.log('3. Testing access with valid admin token (should succeed)');
    try {
        const response = await fetch(`${baseUrl}/api/investor-verification/pending`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Request failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 4: Test metrics endpoint with admin token
    console.log('4. Testing metrics endpoint with admin token');
    try {
        const response = await fetch(`${baseUrl}/api/investor-verification/metrics`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Request failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 5: Test process verification endpoint validation
    console.log('5. Testing process verification endpoint validation');
    try {
        const response = await fetch(`${baseUrl}/api/investor-verification/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
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

testAdminAuth();