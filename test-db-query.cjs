import { db } from './db/index.ts';
import { coffeeGroves } from './db/schema/index.ts';
import { eq, and } from 'drizzle-orm';

async function testQuery() {
  console.log('Testing database query...');
  
  try {
    // First, let's insert a test grove if it doesn't exist
    const existingGrove = await db.query.coffeeGroves.findFirst({
      where: eq(coffeeGroves.groveName, 'Test Grove')
    });
    
    if (!existingGrove) {
      console.log('Inserting test grove...');
      await db.insert(coffeeGroves).values({
        groveName: 'Test Grove',
        farmerAddress: '0.0.123456',
        location: 'Test Location',
        coordinatesLat: 9.770641,
        coordinatesLng: -83.651711,
        treeCount: 8000,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 100,
        verificationStatus: 'verified'
      });
      console.log('Test grove inserted');
    } else {
      console.log('Test grove already exists');
    }
    
    // Now test the query
    console.log('Testing query with separate conditions...');
    const grove1 = await db.query.coffeeGroves.findFirst({
      where: eq(coffeeGroves.groveName, 'Test Grove')
    });
    console.log('Query 1 result:', grove1);
    
    console.log('Testing query with combined conditions...');
    const grove2 = await db.query.coffeeGroves.findFirst({
      where: and(
        eq(coffeeGroves.groveName, 'Test Grove'),
        eq(coffeeGroves.farmerAddress, '0.0.123456')
      )
    });
    console.log('Query 2 result:', grove2);
    
  } catch (error) {
    console.error('Error in test query:', error);
  }
}

testQuery();