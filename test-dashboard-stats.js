/**
 * Test script to verify dashboard statistics are working
 */

async function testDashboardStats() {
    console.log('Testing Dashboard Statistics API...\n')

    try {
        // Test market overview endpoint
        const response = await fetch('http://localhost:3001/api/market/overview')
        const data = await response.json()

        console.log('API Response:')
        console.log(JSON.stringify(data, null, 2))

        if (data.success) {
            console.log('\n✅ API call successful')
            console.log('\nPlatform Statistics:')
            console.log(`  Total Groves: ${data.totalGroves}`)
            console.log(`  Active Farmers: ${data.activeFarmers}`)
            console.log(`  Total Revenue: $${data.totalRevenue}`)

            if (data.totalGroves > 0) {
                console.log('\n✅ Grove count is correct!')
            } else {
                console.log('\n⚠️  No groves found in database')
            }
        } else {
            console.log('\n❌ API call failed:', data.error)
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message)
        console.log('\nMake sure the API server is running:')
        console.log('  npm run api')
    }
}

testDashboardStats()
