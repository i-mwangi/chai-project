/**
 * Quick test script to verify investment endpoints are working
 * Run with: tsx test-investment-endpoints.ts
 */

const API_BASE_URL = 'http://localhost:3002'

async function testEndpoints() {
    console.log('🧪 Testing Investment Endpoints...\n')

    try {
        // Test 1: Register a grove
        console.log('1️⃣ Registering a test grove...')
        const groveData = {
            farmerAddress: '0.0.test-farmer-' + Date.now(),
            groveName: 'Test Grove ' + Date.now(),
            location: 'Test Location',
            treeCount: 100,
            coffeeVariety: 'Arabica',
            totalTokensIssued: 100,
            tokensPerTree: 1
        }

        const groveResponse = await fetch(`${API_BASE_URL}/api/farmer-verification/register-grove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(groveData)
        })

        const groveResult = await groveResponse.json()
        console.log('   Grove registration:', groveResult.success ? '✅ Success' : '❌ Failed')
        if (!groveResult.success) {
            console.log('   Error:', groveResult.error)
            return
        }

        // Get grove ID
        console.log('\n2️⃣ Getting grove ID...')
        const grovesResponse = await fetch(`${API_BASE_URL}/api/investment/available-groves`)
        const grovesResult = await grovesResponse.json()
        const grove = grovesResult.groves.find((g: any) => g.groveName === groveData.groveName)
        
        if (!grove) {
            console.log('   ❌ Could not find grove')
            return
        }
        console.log(`   ✅ Found grove with ID: ${grove.id}`)

        // Test 2: Purchase tokens
        console.log('\n3️⃣ Purchasing tokens...')
        const investorAddress = '0.0.test-investor-' + Date.now()
        const purchaseData = {
            groveId: grove.id,
            tokenAmount: 10,
            investorAddress: investorAddress
        }

        const purchaseResponse = await fetch(`${API_BASE_URL}/api/investment/purchase-tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(purchaseData)
        })

        const purchaseResult = await purchaseResponse.json()
        console.log('   Purchase:', purchaseResult.success ? '✅ Success' : '❌ Failed')
        console.log('   Full response:', JSON.stringify(purchaseResult, null, 2))
        if (purchaseResult.success && purchaseResult.data) {
            console.log('   Details:', {
                tokens: purchaseResult.data.tokenAmount,
                price: `$${purchaseResult.data.pricePerToken}`,
                total: `$${purchaseResult.data.totalCost}`
            })
        } else if (!purchaseResult.success) {
            console.log('   Error:', purchaseResult.error)
            return
        }

        // Test 3: Get portfolio
        console.log('\n4️⃣ Fetching portfolio...')
        const portfolioResponse = await fetch(`${API_BASE_URL}/api/investment/portfolio?investorAddress=${investorAddress}`)
        const portfolioResult = await portfolioResponse.json()
        
        console.log('   Portfolio:', portfolioResult.success ? '✅ Success' : '❌ Failed')
        if (portfolioResult.success) {
            console.log('   Holdings:', portfolioResult.portfolio.holdings.length)
            console.log('   Total Investment:', `$${portfolioResult.portfolio.totalInvestment}`)
            console.log('   Total Tokens:', portfolioResult.portfolio.totalHoldings)
            
            if (portfolioResult.portfolio.holdings.length > 0) {
                console.log('\n   📊 Portfolio Details:')
                portfolioResult.portfolio.holdings.forEach((h: any, i: number) => {
                    console.log(`      ${i + 1}. ${h.groveName}`)
                    console.log(`         - Tokens: ${h.tokenAmount}`)
                    console.log(`         - Location: ${h.location}`)
                    console.log(`         - Variety: ${h.coffeeVariety}`)
                })
            }
        } else {
            console.log('   Error:', portfolioResult.error)
        }

        console.log('\n✅ All tests completed successfully!')

    } catch (error) {
        console.error('\n❌ Test failed with error:', error)
        console.log('\n💡 Make sure the API server is running on port 3002')
        console.log('   Run: npm start (or your server start command)')
    }
}

testEndpoints()
