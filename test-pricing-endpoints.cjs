#!/usr/bin/env node

/**
 * Test script for Price Oracle API endpoints
 * 
 * This script tests the pricing endpoints to ensure they work correctly
 * in both mock mode (without contract) and with contract integration.
 */

const http = require('http');

const API_BASE = 'http://localhost:3001';

// Helper function to make HTTP requests
function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_BASE);
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

// Test functions
async function testGetCoffeePrices() {
    console.log('\n=== Testing GET /api/pricing/coffee-prices ===');
    
    try {
        const response = await makeRequest('GET', '/api/pricing/coffee-prices?variety=ARABICA&grade=5');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200 && response.data.success) {
            console.log('✓ Coffee prices endpoint working');
            return true;
        } else {
            console.log('✗ Coffee prices endpoint failed');
            return false;
        }
    } catch (error) {
        console.error('✗ Error:', error.message);
        return false;
    }
}

async function testGetSeasonalPrice() {
    console.log('\n=== Testing GET /api/pricing/seasonal-price ===');
    
    try {
        const response = await makeRequest('GET', '/api/pricing/seasonal-price?variety=SPECIALTY&grade=8&month=6');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200 && response.data.success) {
            console.log('✓ Seasonal price endpoint working');
            return true;
        } else {
            console.log('✗ Seasonal price endpoint failed');
            return false;
        }
    } catch (error) {
        console.error('✗ Error:', error.message);
        return false;
    }
}

async function testCalculateProjectedRevenue() {
    console.log('\n=== Testing POST /api/pricing/projected-revenue ===');
    
    try {
        const body = {
            groveTokenAddress: '0.0.123456',
            variety: 'ORGANIC',
            grade: 7,
            expectedYieldKg: 1000,
            harvestMonth: 5
        };
        
        const response = await makeRequest('POST', '/api/pricing/projected-revenue', body);
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200 && response.data.success) {
            console.log('✓ Projected revenue endpoint working');
            return true;
        } else {
            console.log('✗ Projected revenue endpoint failed');
            return false;
        }
    } catch (error) {
        console.error('✗ Error:', error.message);
        return false;
    }
}

async function testValidatePrice() {
    console.log('\n=== Testing POST /api/pricing/validate-price ===');
    
    try {
        const body = {
            variety: 'ROBUSTA',
            grade: 6,
            proposedPrice: 3.5,
            harvestMonth: 8
        };
        
        const response = await makeRequest('POST', '/api/pricing/validate-price', body);
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200 && response.data.success) {
            console.log('✓ Price validation endpoint working');
            return true;
        } else {
            console.log('✗ Price validation endpoint failed');
            return false;
        }
    } catch (error) {
        console.error('✗ Error:', error.message);
        return false;
    }
}

async function testInvalidRequests() {
    console.log('\n=== Testing Invalid Requests ===');
    
    let allPassed = true;
    
    // Test missing parameters
    try {
        const response = await makeRequest('GET', '/api/pricing/coffee-prices?variety=ARABICA');
        if (response.status === 400) {
            console.log('✓ Missing grade parameter correctly rejected');
        } else {
            console.log('✗ Missing grade parameter not rejected');
            allPassed = false;
        }
    } catch (error) {
        console.error('✗ Error:', error.message);
        allPassed = false;
    }
    
    // Test missing body parameters
    try {
        const response = await makeRequest('POST', '/api/pricing/projected-revenue', {
            variety: 'ARABICA',
            grade: 5
        });
        if (response.status === 400) {
            console.log('✓ Incomplete projected revenue request correctly rejected');
        } else {
            console.log('✗ Incomplete projected revenue request not rejected');
            allPassed = false;
        }
    } catch (error) {
        console.error('✗ Error:', error.message);
        allPassed = false;
    }
    
    return allPassed;
}

async function testAllVarieties() {
    console.log('\n=== Testing All Coffee Varieties ===');
    
    const varieties = ['ARABICA', 'ROBUSTA', 'SPECIALTY', 'ORGANIC'];
    let allPassed = true;
    
    for (const variety of varieties) {
        try {
            const response = await makeRequest('GET', `/api/pricing/coffee-prices?variety=${variety}&grade=5`);
            if (response.status === 200 && response.data.success) {
                console.log(`✓ ${variety}: $${response.data.price.toFixed(2)}/kg`);
            } else {
                console.log(`✗ ${variety} failed`);
                allPassed = false;
            }
        } catch (error) {
            console.error(`✗ ${variety} error:`, error.message);
            allPassed = false;
        }
    }
    
    return allPassed;
}

// Main test runner
async function runTests() {
    console.log('========================================');
    console.log('Price Oracle API Endpoint Tests');
    console.log('========================================');
    console.log('Note: These tests run in mock mode if contract is not configured');
    
    const results = {
        coffeePrices: await testGetCoffeePrices(),
        seasonalPrice: await testGetSeasonalPrice(),
        projectedRevenue: await testCalculateProjectedRevenue(),
        validatePrice: await testValidatePrice(),
        invalidRequests: await testInvalidRequests(),
        allVarieties: await testAllVarieties()
    };
    
    console.log('\n========================================');
    console.log('Test Summary');
    console.log('========================================');
    
    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;
    
    Object.entries(results).forEach(([test, result]) => {
        console.log(`${result ? '✓' : '✗'} ${test}`);
    });
    
    console.log(`\nTotal: ${passed}/${total} test suites passed`);
    
    if (passed === total) {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('\n❌ Some tests failed');
        process.exit(1);
    }
}

// Run tests
runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
