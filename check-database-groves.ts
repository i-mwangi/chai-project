import { db } from './db/index.js'
import { coffeeGroves } from './db/schema/index.js'

async function checkGroves() {
    const groves = await db.select().from(coffeeGroves)
    console.log(`\nGroves in database: ${groves.length}\n`)
    
    if (groves.length === 0) {
        console.log('❌ No groves found in database!')
    } else {
        groves.forEach(g => {
            console.log(`  - ID: ${g.id}, Name: ${g.groveName}, Farmer: ${g.farmerAddress}`)
        })
    }
}

checkGroves()
