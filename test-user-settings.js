/**
 * Test User Settings API
 * Simple test to verify user settings functionality
 */

// Use fetch to test the API endpoint directly
async function testUserSettings() {
    console.log('Testing user settings API...');
    
    try {
        // Test GET request
        console.log('Testing GET /api/user/settings/0.0.123456');
        const response = await fetch('http://localhost:3001/api/user/settings/0.0.123456');
        
        if (response.ok) {
            const data = await response.json();
            console.log('GET response:', data);
        } else {
            console.log('GET failed with status:', response.status);
            const text = await response.text();
            console.log('Response body:', text);
        }
        
        // Test PUT request
        console.log('Testing PUT /api/user/settings/0.0.123456');
        const putResponse = await fetch('http://localhost:3001/api/user/settings/0.0.123456', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                skipFarmerVerification: true,
                demoBypass: true
            })
        });
        
        if (putResponse.ok) {
            const data = await putResponse.json();
            console.log('PUT response:', data);
        } else {
            console.log('PUT failed with status:', putResponse.status);
            const text = await putResponse.text();
            console.log('Response body:', text);
        }
    } catch (error) {
        console.error('Test failed with error:', error.message);
    }
}

// Run the test
testUserSettings();