/**
 * Debug script to check portfolio endpoint behavior
 */

const testInvestorAddress = '0.0.789012' // Valid Hedera address format

async function testPortfolioEndpoint() {
    console.log('🔍 Debugging Portfolio Endpoint\n')
    console.log(`Test Investor Address: ${testInvestorAddress}\n`)
    
    // Test 1: Call backend directly (port 3001)
    console.log('1️⃣ Testing Backend API (port 3001) directly...')
    try {
        const backendResponse = await fetch(`http://localhost:3001/api/investment/portfolio?investorAddress=${testInvestorAddress}`)
        const backendData = await backendResponse.json()
        console.log('   Status:', backendResponse.status)
        console.log('   Response:', JSON.stringify(backendData, null, 2))
    } catch (error) {
        console.log('   ❌ Error:', error.message)
    }
    
    // Test 2: Call frontend mock server (port 3002)
    console.log('\n2️⃣ Testing Frontend Mock Server (port 3002)...')
    try {
        const frontendResponse = await fetch(`http://localhost:3002/api/investment/portfolio?investorAddress=${testInvestorAddress}`)
        const frontendData = await frontendResponse.json()
        console.log('   Status:', frontendResponse.status)
        console.log('   Response:', JSON.stringify(frontendData, null, 2))
    } catch (error) {
        console.log('   ❌ Error:', error.message)
    }
    
    // Test 3: Make a purchase and check if it appears
    console.log('\n3️⃣ Making a test purchase...')
    
    // First register a grove
    const groveData = {
        farmerAddress: '0.0.123456', // Valid Hedera address format
        groveName: 'Debug Grove ' + Date.now(),
        location: 'Test Location',
        treeCount: 100,
        coffeeVariety: 'Arabica',
        totalTokensIssued: 100,
        tokensPerTree: 1
    }
    
    const groveResponse = await fetch('http://localhost:3002/api/farmer-verification/register-grove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groveData)
    })
    
    const groveResult = await groveResponse.json()
    console.log('   Grove registered:', groveResult.success ? '✅' : '❌')
    if (!groveResult.success) {
        console.log('   Error:', groveResult.error || groveResult.message)
        return
    }
    
    if (groveResult.success) {
        // Get grove ID
        const grovesResponse = await fetch('http://localhost:3002/api/investment/available-groves')
        const grovesResult = await grovesResponse.json()
        const grove = grovesResult.groves.find((g: any) => g.groveName === groveData.groveName)
        
        if (grove) {
            console.log(`   Grove ID: ${grove.id}`)
            
            // Make purchase via frontend (port 3002)
            console.log('\n4️⃣ Purchasing tokens via frontend (port 3002)...')
            const purchaseResponse = await fetch('http://localhost:3002/api/investment/purchase-tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groveId: grove.id,
                    tokenAmount: 10,
                    investorAddress: testInvestorAddress
                })
            })
            
            const purchaseResult = await purchaseResponse.json()
            console.log('   Purchase:', purchaseResult.success ? '✅' : '❌')
            console.log('   Response:', JSON.stringify(purchaseResult, null, 2))
            
            // Check portfolio on backend (port 3001)
            console.log('\n5️⃣ Checking portfolio on BACKEND (port 3001)...')
            const backendPortfolioResponse = await fetch(`http://localhost:3001/api/investment/portfolio?investorAddress=${testInvestorAddress}`)
            const backendPortfolioData = await backendPortfolioResponse.json()
            console.log('   Holdings count:', backendPortfolioData.portfolio?.holdings?.length || 0)
            console.log('   Response:', JSON.stringify(backendPortfolioData, null, 2))
            
            // Check portfolio on frontend (port 3002)
            console.log('\n6️⃣ Checking portfolio on FRONTEND (port 3002)...')
            const frontendPortfolioResponse = await fetch(`http://localhost:3002/api/investment/portfolio?investorAddress=${testInvestorAddress}`)
            const frontendPortfolioData = await frontendPortfolioResponse.json()
            console.log('   Holdings count:', frontendPortfolioData.portfolio?.holdings?.length || 0)
            console.log('   Response:', JSON.stringify(frontendPortfolioData, null, 2))
            
            // Analysis
            console.log('\n📊 Analysis:')
            const backendHasHoldings = (backendPortfolioData.portfolio?.holdings?.length || 0) > 0
            const frontendHasHoldings = (frontendPortfolioData.portfolio?.holdings?.length || 0) > 0
            
            if (backendHasHoldings && frontendHasHoldings) {
                console.log('✅ SUCCESS: Purchase is in both backend database and frontend!')
            } else if (backendHasHoldings && !frontendHasHoldings) {
                console.log('⚠️  Purchase is in backend but frontend is not proxying correctly')
            } else if (!backendHasHoldings && frontendHasHoldings) {
                console.log('⚠️  Purchase is only in frontend mock storage (not reaching backend)')
                console.log('💡 The proxy is not working - purchase went to mock implementation')
            } else {
                console.log('❌ Purchase failed on both servers')
            }
        }
    }
}

testPortfolioEndpoint()
