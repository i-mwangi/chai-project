/**
 * Test the available groves API endpoint
 */

async function testAPI() {
    try {
        const response = await fetch('http://localhost:3001/api/investment/available-groves');
        const data = await response.json();
        
        console.log('\n=== Available Groves API Response ===\n');
        console.log(`Success: ${data.success}`);
        console.log(`Total groves: ${data.groves?.length || 0}\n`);
        
        if (data.groves) {
            data.groves.forEach((grove: any) => {
                const status = grove.healthScore >= 80 ? '🟢' : grove.healthScore >= 60 ? '🟡' : '🔴';
                console.log(`${status} ${grove.groveName}`);
                console.log(`   Health Score: ${grove.healthScore}`);
                console.log(`   Location: ${grove.location}`);
                console.log(`   Variety: ${grove.coffeeVariety}`);
                console.log(`   Tokens Available: ${grove.tokensAvailable}`);
                console.log('---');
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure the API server is running: npm run api');
    }
}

testAPI();
