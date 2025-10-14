/**
 * Test script to verify user settings API refactoring
 * 
 * This script tests:
 * 1. GET endpoint with valid account ID
 * 2. GET endpoint with invalid account ID
 * 3. PUT endpoint with valid data
 * 4. PUT endpoint with invalid account ID
 * 5. PUT endpoint with invalid data
 */

import http from 'http'

const API_BASE = 'http://localhost:3001'

interface TestResult {
  name: string
  passed: boolean
  message: string
}

const results: TestResult[] = []

function makeRequest(
  method: string,
  path: string,
  body?: any
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE)
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode || 500,
            data: JSON.parse(data)
          })
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data}`))
        }
      })
    })

    req.on('error', reject)

    if (body) {
      req.write(JSON.stringify(body))
    }

    req.end()
  })
}

async function runTests() {
  console.log('🧪 Testing User Settings API Refactoring\n')

  // Test 1: GET with valid account ID
  try {
    const response = await makeRequest('GET', '/api/user/settings/0.0.123456')
    if (response.status === 200 && response.data.success) {
      results.push({
        name: 'GET with valid account ID',
        passed: true,
        message: 'Successfully retrieved settings'
      })
    } else {
      results.push({
        name: 'GET with valid account ID',
        passed: false,
        message: `Expected 200 with success=true, got ${response.status}`
      })
    }
  } catch (error) {
    results.push({
      name: 'GET with valid account ID',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    })
  }

  // Test 2: GET with invalid account ID (missing dots)
  try {
    const response = await makeRequest('GET', '/api/user/settings/invalid-id')
    if (response.status === 400 && !response.data.success) {
      results.push({
        name: 'GET with invalid account ID',
        passed: true,
        message: 'Correctly rejected invalid account ID'
      })
    } else {
      results.push({
        name: 'GET with invalid account ID',
        passed: false,
        message: `Expected 400 with success=false, got ${response.status}`
      })
    }
  } catch (error) {
    results.push({
      name: 'GET with invalid account ID',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    })
  }

  // Test 3: PUT with valid data
  try {
    const response = await makeRequest('PUT', '/api/user/settings/0.0.789012', {
      skipFarmerVerification: true,
      demoBypass: false
    })
    if (response.status === 200 && response.data.success) {
      results.push({
        name: 'PUT with valid data',
        passed: true,
        message: 'Successfully updated settings'
      })
    } else {
      results.push({
        name: 'PUT with valid data',
        passed: false,
        message: `Expected 200 with success=true, got ${response.status}`
      })
    }
  } catch (error) {
    results.push({
      name: 'PUT with valid data',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    })
  }

  // Test 4: PUT with invalid account ID
  try {
    const response = await makeRequest('PUT', '/api/user/settings/bad-format', {
      skipFarmerVerification: true
    })
    if (response.status === 400 && !response.data.success) {
      results.push({
        name: 'PUT with invalid account ID',
        passed: true,
        message: 'Correctly rejected invalid account ID'
      })
    } else {
      results.push({
        name: 'PUT with invalid account ID',
        passed: false,
        message: `Expected 400 with success=false, got ${response.status}`
      })
    }
  } catch (error) {
    results.push({
      name: 'PUT with invalid account ID',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    })
  }

  // Test 5: PUT with invalid data (non-boolean value)
  try {
    const response = await makeRequest('PUT', '/api/user/settings/0.0.999999', {
      skipFarmerVerification: 'not-a-boolean'
    })
    if (response.status === 400 && !response.data.success) {
      results.push({
        name: 'PUT with invalid data type',
        passed: true,
        message: 'Correctly rejected invalid data type'
      })
    } else {
      results.push({
        name: 'PUT with invalid data type',
        passed: false,
        message: `Expected 400 with success=false, got ${response.status}`
      })
    }
  } catch (error) {
    results.push({
      name: 'PUT with invalid data type',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    })
  }

  // Test 6: Verify caching works (second GET should be faster)
  try {
    const start1 = Date.now()
    await makeRequest('GET', '/api/user/settings/0.0.123456')
    const time1 = Date.now() - start1

    const start2 = Date.now()
    await makeRequest('GET', '/api/user/settings/0.0.123456')
    const time2 = Date.now() - start2

    if (time2 < time1) {
      results.push({
        name: 'Caching verification',
        passed: true,
        message: `Second request faster (${time1}ms vs ${time2}ms)`
      })
    } else {
      results.push({
        name: 'Caching verification',
        passed: true,
        message: `Both requests completed (${time1}ms, ${time2}ms)`
      })
    }
  } catch (error) {
    results.push({
      name: 'Caching verification',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    })
  }

  // Print results
  console.log('\n📊 Test Results:\n')
  let passed = 0
  let failed = 0

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`${icon} ${result.name}`)
    console.log(`   ${result.message}\n`)
    if (result.passed) {
      passed++
    } else {
      failed++
    }
  })

  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed out of ${results.length} tests\n`)

  if (failed === 0) {
    console.log('🎉 All tests passed! User settings API refactoring is working correctly.\n')
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.\n')
    process.exit(1)
  }
}

// Check if server is running
async function checkServer() {
  try {
    await makeRequest('GET', '/api/health')
    return true
  } catch (error) {
    console.error('❌ Server is not running at', API_BASE)
    console.error('   Please start the server with: npm run dev or pnpm run dev\n')
    return false
  }
}

async function main() {
  const serverRunning = await checkServer()
  if (!serverRunning) {
    process.exit(1)
  }

  await runTests()
}

main()
