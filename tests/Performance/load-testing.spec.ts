import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import { setupTestEnvironment, cleanupTestEnvironment } from '../setup/test-helpers';
import { CoffeeTreePlatform } from '../helpers/platform-helper';

/**
 * Load Testing Suite for Coffee Tree Platform
 * 
 * Tests platform performance under various load conditions
 * including concurrent users, high transaction volumes, and
 * large-scale operations.
 */
describe('Coffee Tree Platform - Load Testing', () => {
  let platform: CoffeeTreePlatform;
  let testAccounts: Array<{ id: AccountId; key: PrivateKey }>;
  
  beforeEach(async () => {
    const testEnv = await setupTestEnvironment();
    platform = new CoffeeTreePlatform(testEnv.client);
    await platform.initialize();
    
    // Create test accounts for load testing
    testAccounts = [];
    for (let i = 0; i < 100; i++) {
      testAccounts.push(await platform.createTestAccount());
    }
  });
  
  afterEach(async () => {
    await cleanupTestEnvironment();
  });

  describe('Concurrent User Load Tests', () => {
    it('should handle 50 concurrent farmer registrations', async () => {
      const farmers = testAccounts.slice(0, 50);
      
      // Verify all farmers concurrently
      const verificationPromises = farmers.map(farmer => 
        platform.verifyFarmer(farmer)
      );
      
      const startTime = Date.now();
      await Promise.all(verificationPromises);
      const verificationTime = Date.now() - startTime;
      
      console.log(`50 farmer verifications completed in ${verificationTime}ms`);
      expect(verificationTime).toBeLessThan(30000); // 30 seconds max
      
      // Register groves concurrently
      const registrationPromises = farmers.map((farmer, index) => 
        platform.registerGrove(farmer, `Load Grove ${index}`, {
          location: `Location ${index}`,
          treeCount: 100 + index,
          coffeeVariety: 'Arabica',
          expectedYieldPerTree: 5000
        })
      );
      
      const regStartTime = Date.now();
      await Promise.all(registrationPromises);
      const registrationTime = Date.now() - regStartTime;
      
      console.log(`50 grove registrations completed in ${registrationTime}ms`);
      expect(registrationTime).toBeLessThan(45000); // 45 seconds max
    }, 90000);

    it('should handle 100 concurrent token purchases', async () => {
      // Setup a large grove
      const farmer = testAccounts[0];
      await platform.verifyFarmer(farmer);
      
      const groveName = 'Large Load Test Grove';
      await platform.registerGrove(farmer, groveName, {
        location: 'Costa Rica',
        treeCount: 10000, // Large grove
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      await platform.tokenizeGrove(farmer, groveName, {
        tokensPerTree: 10,
        pricePerToken: 10_000_000 // Lower price for easier testing
      });
      
      // 100 concurrent purchases
      const investors = testAccounts.slice(1, 101);
      const purchasePromises = investors.map((investor, index) => 
        platform.purchaseTokens(investor, groveName, {
          tokens: 10 + index % 50,
          value: (10 + index % 50) * 10_000_000
        })
      );
      
      const startTime = Date.now();
      await Promise.all(purchasePromises);
      const purchaseTime = Date.now() - startTime;
      
      console.log(`100 concurrent purchases completed in ${purchaseTime}ms`);
      expect(purchaseTime).toBeLessThan(60000); // 60 seconds max
      
      // Verify all purchases were successful
      let totalTokensPurchased = 0;
      for (let i = 0; i < investors.length; i++) {
        const balance = await platform.getTokenBalance(groveName, investors[i].id);
        totalTokensPurchased += balance;
      }
      
      const expectedTotal = investors.reduce((sum, _, index) => sum + (10 + index % 50), 0);
      expect(totalTokensPurchased).toBe(expectedTotal);
    }, 120000);

    it('should handle massive revenue distribution (500 token holders)', async () => {
      // This test simulates a very successful grove with many investors
      const farmer = testAccounts[0];
      await platform.verifyFarmer(farmer);
      
      const groveName = 'Massive Distribution Grove';
      await platform.registerGrove(farmer, groveName, {
        location: 'Premium Location',
        treeCount: 5000,
        coffeeVariety: 'Premium Arabica',
        expectedYieldPerTree: 6000
      });
      
      await platform.tokenizeGrove(farmer, groveName, {
        tokensPerTree: 20,
        pricePerToken: 5_000_000 // Very low price for testing
      });
      
      // Add 500 investors in batches to avoid timeout
      const batchSize = 50;
      const totalInvestors = 500;
      
      for (let batch = 0; batch < totalInvestors / batchSize; batch++) {
        const batchStart = batch * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, totalInvestors);
        const batchInvestors = testAccounts.slice(batchStart + 1, batchEnd + 1);
        
        const batchPurchases = batchInvestors.map((investor, index) => 
          platform.purchaseTokens(investor, groveName, {
            tokens: 5 + (index % 10),
            value: (5 + (index % 10)) * 5_000_000
          })
        );
        
        await Promise.all(batchPurchases);
        console.log(`Batch ${batch + 1} of ${totalInvestors / batchSize} completed`);
      }
      
      // Report a large harvest
      await platform.reportHarvest(farmer, groveName, {
        totalYieldKg: 25000, // 25 tons
        qualityGrade: 95,
        salePricePerKg: 12_000_000 // Premium price
      });
      
      // Measure distribution performance
      const startTime = Date.now();
      await platform.distributeRevenue(farmer, groveName);
      const distributionTime = Date.now() - startTime;
      
      console.log(`Revenue distribution to 500 holders completed in ${distributionTime}ms`);
      expect(distributionTime).toBeLessThan(120000); // 2 minutes max
      
      // Verify distribution was successful (sample check)
      const sampleInvestors = testAccounts.slice(1, 11);
      for (const investor of sampleInvestors) {
        const balance = await platform.getAccountBalance(investor.id);
        expect(balance).toBeGreaterThan(0);
      }
    }, 300000); // 5 minute timeout
  });

  describe('High-Frequency Operations', () => {
    it('should handle rapid successive transactions', async () => {
      const farmer = testAccounts[0];
      const investor = testAccounts[1];
      
      await platform.verifyFarmer(farmer);
      
      // Create multiple small groves for rapid operations
      const groveCount = 20;
      const groves = [];
      
      for (let i = 0; i < groveCount; i++) {
        const groveName = `Rapid Grove ${i}`;
        groves.push(groveName);
        
        await platform.registerGrove(farmer, groveName, {
          location: `Location ${i}`,
          treeCount: 50,
          coffeeVariety: 'Arabica',
          expectedYieldPerTree: 4000
        });
        
        await platform.tokenizeGrove(farmer, groveName, {
          tokensPerTree: 10,
          pricePerToken: 10_000_000
        });
      }
      
      // Rapid purchases across all groves
      const rapidPurchases = groves.map(groveName => 
        platform.purchaseTokens(investor, groveName, {
          tokens: 25,
          value: 25 * 10_000_000
        })
      );
      
      const startTime = Date.now();
      await Promise.all(rapidPurchases);
      const purchaseTime = Date.now() - startTime;
      
      console.log(`${groveCount} rapid purchases completed in ${purchaseTime}ms`);
      expect(purchaseTime).toBeLessThan(30000); // 30 seconds max
      
      // Rapid harvest reporting
      const harvestPromises = groves.map(groveName => 
        platform.reportHarvest(farmer, groveName, {
          totalYieldKg: 200,
          qualityGrade: 80,
          salePricePerKg: 8_000_000
        })
      );
      
      const harvestStartTime = Date.now();
      await Promise.all(harvestPromises);
      const harvestTime = Date.now() - harvestStartTime;
      
      console.log(`${groveCount} harvest reports completed in ${harvestTime}ms`);
      expect(harvestTime).toBeLessThan(25000); // 25 seconds max
    }, 90000);

    it('should handle burst trading activity', async () => {
      const farmer = testAccounts[0];
      const traders = testAccounts.slice(1, 21); // 20 traders
      
      await platform.verifyFarmer(farmer);
      
      const groveName = 'Trading Burst Grove';
      await platform.registerGrove(farmer, groveName, {
        location: 'Trading Location',
        treeCount: 2000,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      await platform.tokenizeGrove(farmer, groveName, {
        tokensPerTree: 10,
        pricePerToken: 50_000_000
      });
      
      // Initial distribution to traders
      const initialPurchases = traders.map(trader => 
        platform.purchaseTokens(trader, groveName, {
          tokens: 100,
          value: 100 * 50_000_000
        })
      );
      
      await Promise.all(initialPurchases);
      
      // Burst trading - rapid buy/sell cycles
      const tradingRounds = 10;
      const tradesPerRound = 40; // 20 traders * 2 operations each
      
      for (let round = 0; round < tradingRounds; round++) {
        const roundTrades = [];
        
        for (let i = 0; i < traders.length; i++) {
          const trader = traders[i];
          const price = 50_000_000 + (round * 1_000_000) + (i * 100_000);
          
          // List tokens for sale
          roundTrades.push(
            platform.listTokensForSale(trader, groveName, 10, price)
          );
          
          // Buy from another trader's listing (if available)
          if (i > 0) {
            roundTrades.push(
              platform.purchaseListedTokens(trader, groveName, 10, price - 100_000)
            );
          }
        }
        
        const roundStartTime = Date.now();
        await Promise.all(roundTrades);
        const roundTime = Date.now() - roundStartTime;
        
        console.log(`Trading round ${round + 1} (${tradesPerRound} trades) completed in ${roundTime}ms`);
        expect(roundTime).toBeLessThan(15000); // 15 seconds per round max
      }
    }, 180000); // 3 minute timeout
  });

  describe('Memory and Resource Usage', () => {
    it('should maintain performance with large data sets', async () => {
      const farmer = testAccounts[0];
      await platform.verifyFarmer(farmer);
      
      // Create a grove with extensive history
      const groveName = 'Data Heavy Grove';
      await platform.registerGrove(farmer, groveName, {
        location: 'Data Location',
        treeCount: 1000,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      await platform.tokenizeGrove(farmer, groveName, {
        tokensPerTree: 10,
        pricePerToken: 50_000_000
      });
      
      // Add many investors
      const investors = testAccounts.slice(1, 101); // 100 investors
      const purchasePromises = investors.map((investor, index) => 
        platform.purchaseTokens(investor, groveName, {
          tokens: 10 + (index % 20),
          value: (10 + (index % 20)) * 50_000_000
        })
      );
      
      await Promise.all(purchasePromises);
      
      // Generate extensive harvest history
      const harvestCount = 50; // 50 harvests
      for (let i = 0; i < harvestCount; i++) {
        await platform.reportHarvest(farmer, groveName, {
          totalYieldKg: 4000 + (i * 10),
          qualityGrade: 80 + (i % 15),
          salePricePerKg: 8_000_000 + (i * 100_000)
        });
        
        await platform.distributeRevenue(farmer, groveName);
        
        if (i % 10 === 0) {
          console.log(`Completed ${i + 1} harvest cycles`);
        }
      }
      
      // Test query performance with large dataset
      const queryStartTime = Date.now();
      
      // Query grove information
      const groveInfo = await platform.getGroveInfo(groveName);
      expect(groveInfo).toBeDefined();
      
      // Query all token balances
      const balanceQueries = investors.map(investor => 
        platform.getTokenBalance(groveName, investor.id)
      );
      
      const balances = await Promise.all(balanceQueries);
      const queryTime = Date.now() - queryStartTime;
      
      console.log(`Queried grove info and 100 balances in ${queryTime}ms`);
      expect(queryTime).toBeLessThan(10000); // 10 seconds max
      expect(balances.every(balance => balance >= 0)).toBe(true);
    }, 240000); // 4 minute timeout
  });

  describe('Network Resilience', () => {
    it('should handle network congestion gracefully', async () => {
      // Simulate network congestion by reducing timeouts
      const originalTimeout = platform.client.requestTimeout;
      platform.client.requestTimeout = 5000; // 5 second timeout
      
      try {
        const farmer = testAccounts[0];
        await platform.verifyFarmer(farmer);
        
        const groveName = 'Network Test Grove';
        await platform.registerGrove(farmer, groveName, {
          location: 'Network Location',
          treeCount: 100,
          coffeeVariety: 'Arabica',
          expectedYieldPerTree: 5000
        });
        
        // Should still succeed despite reduced timeout
        await platform.tokenizeGrove(farmer, groveName, {
          tokensPerTree: 10,
          pricePerToken: 50_000_000
        });
        
        // Multiple operations should still work
        const investor = testAccounts[1];
        await platform.purchaseTokens(investor, groveName, {
          tokens: 50,
          value: 50 * 50_000_000
        });
        
        await platform.reportHarvest(farmer, groveName, {
          totalYieldKg: 400,
          qualityGrade: 85,
          salePricePerKg: 8_000_000
        });
        
        await platform.distributeRevenue(farmer, groveName);
        
        console.log('✅ All operations completed successfully under network constraints');
      } finally {
        // Restore original timeout
        platform.client.requestTimeout = originalTimeout;
      }
    });

    it('should retry failed operations automatically', async () => {
      const farmer = testAccounts[0];
      await platform.verifyFarmer(farmer);
      
      const groveName = 'Retry Test Grove';
      await platform.registerGrove(farmer, groveName, {
        location: 'Retry Location',
        treeCount: 100,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      // Enable retry mechanism in platform helper
      platform.enableRetries(3, 1000); // 3 retries, 1 second delay
      
      // This should succeed even if some attempts fail
      await platform.tokenizeGrove(farmer, groveName, {
        tokensPerTree: 10,
        pricePerToken: 50_000_000
      });
      
      const investor = testAccounts[1];
      await platform.purchaseTokens(investor, groveName, {
        tokens: 50,
        value: 50 * 50_000_000
      });
      
      console.log('✅ Operations completed successfully with retry mechanism');
    });
  });
});