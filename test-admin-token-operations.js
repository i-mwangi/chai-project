/**
 * Test script for Admin Token Operations
 * Tests the backend API endpoints for token minting, burning, and KYC management
 */

const API_BASE_URL = 'http://localhost:3001';

// Test data
const testGroveId = '1';
const testAccountAddress = '0.0.123456';
const testMintAmount = 100;
const testBurnAmount = 50;

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
}

/**
 * Test token minting
 */
async function testMintTokens() {
    console.log('\n=== Testing Token Minting ===');
    try {
        const result = await apiRequest('/api/admin/mint-tokens', {
            method: 'POST',
            body: JSON.stringify({
                groveId: testGroveId,
                amount: testMintAmount
            })
        });
        
        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));
        
        if (result.data.success) {
            console.log('✓ Token minting test passed');
            return true;
        } else {
            console.log('✗ Token minting test failed:', result.data.error);
            return false;
        }
    } catch (error) {
        console.log('✗ Token minting test error:', error.message);
        return false;
    }
}

/**
 * Test token burning
 */
async function testBurnTokens() {
    console.log('\n=== Testing Token Burning ===');
    try {
        const result = await apiRequest('/api/admin/burn-tokens', {
            method: 'POST',
            body: JSON.stringify({
                groveId: testGroveId,
                amount: testBurnAmount
            })
        });
        
        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));
        
        if (result.data.success) {
            console.log('✓ Token burning test passed');
            return true;
        } else {
            console.log('✗ Token burning test failed:', result.data.error);
            return false;
        }
    } catch (error) {
        console.log('✗ Token burning test error:', error.message);
        return false;
    }
}

/**
 * Test getting token supply
 */
async function testGetTokenSupply() {
    console.log('\n=== Testing Get Token Supply ===');
    try {
        const result = await apiRequest(`/api/admin/token-supply?groveId=${testGroveId}`);
        
        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));
        
        if (result.data.success) {
            console.log('✓ Get token supply test passed');
            return true;
        } else {
            console.log('✗ Get token supply test failed:', result.data.error);
            return false;
        }
    } catch (error) {
        console.log('✗ Get token supply test error:', error.message);
        return false;
    }
}

/**
 * Test granting KYC
 */
async function testGrantKYC() {
    console.log('\n=== Testing Grant KYC ===');
    try {
        const result = await apiRequest('/api/admin/grant-kyc', {
            method: 'POST',
            body: JSON.stringify({
                groveId: testGroveId,
                accountAddress: testAccountAddress
            })
        });
        
        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));
        
        if (result.data.success) {
            console.log('✓ Grant KYC test passed');
            return true;
        } else {
            console.log('✗ Grant KYC test failed:', result.data.error);
            return false;
        }
    } catch (error) {
        console.log('✗ Grant KYC test error:', error.message);
        return false;
    }
}

/**
 * Test checking KYC status
 */
async function testCheckKYCStatus() {
    console.log('\n=== Testing Check KYC Status ===');
    try {
        const result = await apiRequest(
            `/api/admin/kyc-status?groveId=${testGroveId}&accountAddress=${testAccountAddress}`
        );
        
        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));
        
        if (result.data.success !== undefined) {
            console.log('✓ Check KYC status test passed');
            return true;
        } else {
            console.log('✗ Check KYC status test failed');
            return false;
        }
    } catch (error) {
        console.log('✗ Check KYC status test error:', error.message);
        return false;
    }
}

/**
 * Test revoking KYC (expected to fail as not implemented in contract)
 */
async function testRevokeKYC() {
    console.log('\n=== Testing Revoke KYC ===');
    try {
        const result = await apiRequest('/api/admin/revoke-kyc', {
            method: 'POST',
            body: JSON.stringify({
                groveId: testGroveId,
                accountAddress: testAccountAddress
            })
        });
        
        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));
        
        // This should return 501 (Not Implemented)
        if (result.status === 501) {
            console.log('✓ Revoke KYC test passed (correctly returns not implemented)');
            return true;
        } else {
            console.log('✗ Revoke KYC test failed: expected 501 status');
            return false;
        }
    } catch (error) {
        console.log('✗ Revoke KYC test error:', error.message);
        return false;
    }
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('===========================================');
    console.log('Admin Token Operations API Tests');
    console.log('===========================================');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Test Grove ID:', testGroveId);
    console.log('Test Account:', testAccountAddress);
    
    const results = {
        mintTokens: await testMintTokens(),
        burnTokens: await testBurnTokens(),
        getTokenSupply: await testGetTokenSupply(),
        grantKYC: await testGrantKYC(),
        checkKYCStatus: await testCheckKYCStatus(),
        revokeKYC: await testRevokeKYC()
    };
    
    console.log('\n===========================================');
    console.log('Test Summary');
    console.log('===========================================');
    
    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;
    
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✓' : '✗'} ${test}`);
    });
    
    console.log(`\nTotal: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('\n✓ All tests passed!');
    } else {
        console.log(`\n✗ ${total - passed} test(s) failed`);
    }
}

// Run tests
runAllTests().catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
});
