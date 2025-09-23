#!/usr/bin/env node

/**
 * Test script for investor verification document submission endpoint
 */

import http from 'http';

const API_BASE_URL = 'http://localhost:3001';

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, data: response });
                } catch (error) {
                    resolve({ statusCode: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testDocumentSubmission() {
    console.log('Testing Investor Verification Document Submission Endpoint...\n');

    // Test 1: Valid basic verification submission
    console.log('Test 1: Valid basic verification submission');
    try {
        const validBasicSubmission = {
            investorAddress: '0x1234567890123456789012345678901234567890',
            documents: {
                identityDocument: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
                proofOfAddress: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH'
            },
            verificationType: 'basic'
        };

        const response = await makeRequest('POST', '/api/investor-verification/submit-documents', validBasicSubmission);
        console.log('Status Code:', response.statusCode);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('✅ Test 1 passed\n');
    } catch (error) {
        console.log('❌ Test 1 failed:', error.message);
    }

    // Test 2: Valid accredited verification submission
    console.log('Test 2: Valid accredited verification submission');
    try {
        const validAccreditedSubmission = {
            investorAddress: '0x2234567890123456789012345678901234567890',
            documents: {
                identityDocument: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdI',
                proofOfAddress: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdJ',
                financialStatement: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdK',
                accreditationProof: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdL'
            },
            verificationType: 'accredited'
        };

        const response = await makeRequest('POST', '/api/investor-verification/submit-documents', validAccreditedSubmission);
        console.log('Status Code:', response.statusCode);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('✅ Test 2 passed\n');
    } catch (error) {
        console.log('❌ Test 2 failed:', error.message);
    }

    // Test 3: Missing required fields
    console.log('Test 3: Missing required fields');
    try {
        const invalidSubmission = {
            investorAddress: '0x3234567890123456789012345678901234567890'
            // Missing documents and verificationType
        };

        const response = await makeRequest('POST', '/api/investor-verification/submit-documents', invalidSubmission);
        console.log('Status Code:', response.statusCode);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('✅ Test 3 passed (correctly rejected)\n');
    } catch (error) {
        console.log('❌ Test 3 failed:', error.message);
    }

    // Test 4: Invalid investor address format
    console.log('Test 4: Invalid investor address format');
    try {
        const invalidAddressSubmission = {
            investorAddress: 'invalid-address',
            documents: {
                identityDocument: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdM',
                proofOfAddress: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdN'
            },
            verificationType: 'basic'
        };

        const response = await makeRequest('POST', '/api/investor-verification/submit-documents', invalidAddressSubmission);
        console.log('Status Code:', response.statusCode);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('✅ Test 4 passed (correctly rejected)\n');
    } catch (error) {
        console.log('❌ Test 4 failed:', error.message);
    }

    // Test 5: Invalid document hash format
    console.log('Test 5: Invalid document hash format');
    try {
        const invalidHashSubmission = {
            investorAddress: '0x4234567890123456789012345678901234567890',
            documents: {
                identityDocument: 'invalid-hash',
                proofOfAddress: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdO'
            },
            verificationType: 'basic'
        };

        const response = await makeRequest('POST', '/api/investor-verification/submit-documents', invalidHashSubmission);
        console.log('Status Code:', response.statusCode);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('✅ Test 5 passed (correctly rejected)\n');
    } catch (error) {
        console.log('❌ Test 5 failed:', error.message);
    }

    // Test 6: Accredited verification missing required documents
    console.log('Test 6: Accredited verification missing required documents');
    try {
        const incompleteAccreditedSubmission = {
            investorAddress: '0x5234567890123456789012345678901234567890',
            documents: {
                identityDocument: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdP',
                proofOfAddress: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdQ'
                // Missing financialStatement and accreditationProof
            },
            verificationType: 'accredited'
        };

        const response = await makeRequest('POST', '/api/investor-verification/submit-documents', incompleteAccreditedSubmission);
        console.log('Status Code:', response.statusCode);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('✅ Test 6 passed (correctly rejected)\n');
    } catch (error) {
        console.log('❌ Test 6 failed:', error.message);
    }

    // Test 7: Invalid verification type
    console.log('Test 7: Invalid verification type');
    try {
        const invalidTypeSubmission = {
            investorAddress: '0x6234567890123456789012345678901234567890',
            documents: {
                identityDocument: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdR',
                proofOfAddress: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdS'
            },
            verificationType: 'invalid-type'
        };

        const response = await makeRequest('POST', '/api/investor-verification/submit-documents', invalidTypeSubmission);
        console.log('Status Code:', response.statusCode);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('✅ Test 7 passed (correctly rejected)\n');
    } catch (error) {
        console.log('❌ Test 7 failed:', error.message);
    }

    console.log('All tests completed!');
}

// Check if API server is running first
async function checkServerHealth() {
    try {
        const response = await makeRequest('GET', '/health');
        if (response.statusCode === 200) {
            console.log('✅ API server is running\n');
            return true;
        } else {
            console.log('❌ API server health check failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Cannot connect to API server. Please make sure it\'s running on port 3001');
        console.log('   Run: npm run start or node api/server.ts\n');
        return false;
    }
}

async function main() {
    const serverRunning = await checkServerHealth();
    if (serverRunning) {
        await testDocumentSubmission();
    }
}

main().catch(console.error);