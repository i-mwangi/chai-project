// Check what's actually in the database
import { db } from './db/index.js';
import { tokenHoldings, coffeeGroves } from './db/schema/index.js';
import { eq } from 'drizzle-orm';

async function checkHoldings() {
    console.log('=== Checking Token Holdings in Database ===\n');
    
    try {
        // Get all token holdings
        const holdings = await db
            .select({
                id: tokenHoldings.id,
                holderAddress: tokenHoldings.holderAddress,
                groveId: tokenHoldings.groveId,
                tokenAmount: tokenHoldings.tokenAmount,
                purchasePrice: tokenHoldings.purchasePrice,
                purchaseDate: tokenHoldings.purchaseDate,
                isActive: tokenHoldings.isActive
            })
            .from(tokenHoldings)
            .where(eq(tokenHoldings.isActive, true));

        console.log(`Total active holdings: ${holdings.length}\n`);

        if (holdings.length === 0) {
            console.log('⚠️  NO HOLDINGS FOUND IN DATABASE!');
            console.log('This means token purchases are not being recorded.\n');
            console.log('Possible reasons:');
            console.log('1. Purchase API is failing');
            console.log('2. Database insert is not working');
            console.log('3. No purchases have been made yet');
        } else {
            console.log('Holdings found:\n');
            for (const holding of holdings) {
                console.log(`Holding ID: ${holding.id}`);
                console.log(`  Investor: ${holding.holderAddress}`);
                console.log(`  Grove ID: ${holding.groveId}`);
                console.log(`  Tokens: ${holding.tokenAmount}`);
                console.log(`  Price: $${(holding.purchasePrice / 100).toFixed(2)}`);
                console.log(`  Date: ${new Date(holding.purchaseDate).toLocaleString()}`);
                console.log(`  Active: ${holding.isActive}`);
                console.log('');
            }

            // Get unique investor addresses
            const investors = [...new Set(holdings.map(h => h.holderAddress))];
            console.log(`\nUnique investors: ${investors.length}`);
            investors.forEach(addr => {
                const count = holdings.filter(h => h.holderAddress === addr).length;
                console.log(`  ${addr}: ${count} holding(s)`);
            });
        }

        // Also check groves
        console.log('\n=== Available Groves ===\n');
        const groves = await db.select().from(coffeeGroves).limit(5);
        groves.forEach(grove => {
            console.log(`${grove.id}. ${grove.groveName} (${grove.location})`);
        });

    } catch (error) {
        console.error('Error checking database:', error);
    }

    process.exit(0);
}

checkHoldings();
