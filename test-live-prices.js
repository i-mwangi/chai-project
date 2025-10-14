/**
 * Test live coffee price scraping
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

async function getArabicaPrice() {
    try {
        const url = 'https://finance.yahoo.com/quote/KC=F'
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': userAgent },
            timeout: 10000
        })

        const $ = cheerio.load(data)
        const priceText = $('fin-streamer[data-symbol="KC=F"]').first().text()
        
        if (priceText) {
            const price = parseFloat(priceText.replace(/,/g, ''))
            return {
                variety: 'Arabica',
                pricePerLb: price,
                pricePerKg: (price * 2.20462).toFixed(2),
                source: 'Yahoo Finance (ICE Coffee C)',
                timestamp: new Date().toISOString()
            }
        }
    } catch (error) {
        console.error('Error fetching Arabica:', error.message)
    }
    return null
}

async function getRobustaPrice() {
    try {
        const url = 'https://www.investing.com/commodities/robusta-coffee-10'
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': userAgent },
            timeout: 10000
        })

        const $ = cheerio.load(data)
        const priceText = $('span[data-test="instrument-price-last"]').first().text()
        
        if (priceText) {
            const price = parseFloat(priceText.replace(/,/g, ''))
            return {
                variety: 'Robusta',
                pricePerTon: price,
                pricePerKg: (price / 1000).toFixed(2),
                source: 'Investing.com',
                timestamp: new Date().toISOString()
            }
        }
    } catch (error) {
        console.error('Error fetching Robusta:', error.message)
    }
    return null
}

async function main() {
    console.log('\n☕ Live Coffee Prices')
    console.log('='.repeat(60))
    console.log('Fetching real-time prices from financial websites...\n')

    const [arabica, robusta] = await Promise.all([
        getArabicaPrice(),
        getRobustaPrice()
    ])

    if (arabica) {
        console.log('✅ ARABICA (Coffee C Futures)')
        console.log(`   Price: $${arabica.pricePerLb} USD/lb`)
        console.log(`   Price: $${arabica.pricePerKg} USD/kg`)
        console.log(`   Source: ${arabica.source}`)
        console.log(`   Time: ${new Date(arabica.timestamp).toLocaleString()}`)
        console.log()
    } else {
        console.log('❌ ARABICA - Failed to fetch')
        console.log()
    }

    if (robusta) {
        console.log('✅ ROBUSTA')
        console.log(`   Price: $${robusta.pricePerTon} USD/ton`)
        console.log(`   Price: $${robusta.pricePerKg} USD/kg`)
        console.log(`   Source: ${robusta.source}`)
        console.log(`   Time: ${new Date(robusta.timestamp).toLocaleString()}`)
        console.log()
    } else {
        console.log('❌ ROBUSTA - Failed to fetch')
        console.log()
    }

    // Estimate specialty and organic prices
    if (arabica) {
        const specialtyPrice = (arabica.pricePerKg * 1.35).toFixed(2)
        const organicPrice = (arabica.pricePerKg * 1.25).toFixed(2)
        
        console.log('📊 ESTIMATED PRICES (based on Arabica)')
        console.log(`   Specialty: $${specialtyPrice} USD/kg (+35% premium)`)
        console.log(`   Organic: $${organicPrice} USD/kg (+25% premium)`)
        console.log()
    }

    console.log('='.repeat(60))
    console.log('\n💡 These prices update automatically in your app every 30 minutes')
    console.log('💡 No manual updates needed - the system handles it!\n')
}

main().catch(console.error)
