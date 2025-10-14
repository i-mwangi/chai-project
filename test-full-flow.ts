/**
 * Test the full flow: Register grove -> View groves -> Purchase -> View portfolio
 */

const API_URL = 'http://localhost:3002' // Frontend server

async function testFullFlow() {
    console.log('🧪 Testing Full Investment Flow\n')
    
    const timestamp = Date.now()
    const farmerAddress = '0.0.123456'
    const investorAddress = '0.0.789012'
    const groveName = `Test Grove ${timestamp}`
    
    try {
        // Step 1: Register a grove
        console.log('1️⃣ Registering grove...')
        const registerResponse = await fetch(`${API_URL}/api/farmer-verification/register-grove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                farmerAddress,
                groveName,
                location: 'Test Location',
                treeCount: 100,
                coffeeVariety: 'Arabica',
                totalTokensIssued: 100,
                tokensPerTree: 1
            })
        })
        
        const registerResult = await registerResponse.json()
        console.log('   Result:', registerResult.success ? '✅ Success' : '❌ Failed')
        if (!registerResult.success) {
            console.log('   Error:', registerResult.error)
            return
        }
        
        // Step 2: View available groves
        console.log('\n2️⃣ Fetching available groves...')
        const grovesResponse = await fetch(`${API_URL}/api/investment/available-groves`)
        const grovesResult = await grovesResponse.json()
        
        console.log(`   Found ${grovesResult.groves?.length || 0} groves`)
        const ourGrove = grovesResult.groves?.find((g: any) => g.groveName === groveName)
        
        if (!ourGrove) {
            console.log('   ❌ Our grove not found in the list!')
            console.log('   Available groves:')
            grovesResult.groves?.forEach((g: any) => {
                console.log(`      - ${g.groveName} (ID: ${g.id})`)
            })
            return
        }
        
        console.log(`   ✅ Found our grove: ${ourGrove.groveName} (ID: ${ourGrove.id})`)
        
        // Step 3: Purchase tokens
        console.log('\n3️⃣ Purchasing 10 tokens...')
        const purchaseResponse = await fetch(`${API_URL}/api/investment/purchase-tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                groveId: ourGrove.id,
                tokenAmount: 10,
                investorAddress
            })
        })
        
        const purchaseResult = await purchaseResponse.json()
        console.log('   Result:', purchaseResult.success ? '✅ Success' : '❌ Failed')
        if (!purchaseResult.success) {
            console.log('   Error:', purchaseResult.error)
            return
        }
        
        console.log(`   Purchased ${purchaseResult.data?.tokenAmount || 10} tokens for $${purchaseResult.data?.totalCost || 'N/A'}`)
        
        // Step 4: View portfolio
        console.log('\n4️⃣ Checking portfolio...')
        const portfolioResponse = await fetch(`${API_URL}/api/investment/portfolio?investorAddress=${investorAddress}`)
        const portfolioResult = await portfolioResponse.json()
        
        console.log('   Result:', portfolioResult.success ? '✅ Success' : '❌ Failed')
        
        if (portfolioResult.success) {
            const holdings = portfolioResult.portfolio?.holdings || []
            console.log(`   Holdings: ${holdings.length}`)
            console.log(`   Total Investment: $${portfolioResult.portfolio?.totalInvestment || 0}`)
            console.log(`   Total Tokens: ${portfolioResult.portfolio?.totalHoldings || 0}`)
            
            if (holdings.length > 0) {
                console.log('\n   📊 Portfolio Details:')
                holdings.forEach((h: any, i: number) => {
                    console.log(`      ${i + 1}. ${h.groveName}`)
                    console.log(`         Tokens: ${h.tokenAmount}`)
                    console.log(`         Purchase Price: $${h.purchasePrice}`)
                    console.log(`         Location: ${h.location}`)
                })
            }
            
            // Check if our purchase is there
            const ourHolding = holdings.find((h: any) => h.groveName === groveName)
            if (ourHolding) {
                console.log('\n✅ SUCCESS! Your purchase appears in the portfolio!')
            } else {
                console.log('\n⚠️  Purchase succeeded but not showing in portfolio')
            }
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error)
    }
}

testFullFlow()
