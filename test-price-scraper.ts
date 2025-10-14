/**
 * Test script for coffee price scraper
 */

import { CoffeePriceScraper } from './providers/coffee-price-scraper.js'

async function testScraper() {
    const scraper = new CoffeePriceScraper()
    
    console.log('\n☕ Live Coffee Price Scraper Test')
    console.log('=' .repeat(60))
    console.log('Fetching real-time prices from financial websites...\n')
    
    try {
        const prices = await scraper.fetchAllPrices()
        
        if (prices.length === 0) {
            console.log('❌ No prices could be fetched')
            console.log('This might be due to:')
            console.log('  - Network connectivity issues')
            console.log('  - Website structure changes')
            console.log('  - Rate limiting or blocking')
            return
        }
        
        console.log(`✅ Successfully fetched ${prices.length} prices:\n`)
        
        prices.forEach(price => {
            console.log(`${price.variety.padEnd(12)} $${price.price.toFixed(2)}/kg`)
            console.log(`${''.padEnd(12)} Source: ${price.source}`)
            console.log(`${''.padEnd(12)} Updated: ${price.timestamp.toLocaleString()}`)
            console.log()
        })
        
        console.log('=' .repeat(60))
        console.log('\n💡 These prices will be used in your app automatically')
        console.log('   when API keys are not configured.\n')
        
    } catch (error) {
        console.error('❌ Error testing scraper:', error)
    }
}

testScraper()
