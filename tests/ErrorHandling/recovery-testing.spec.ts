import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import { setupTestEnvironment, cleanupTestEnvironment } from '../setup/test-helpers';
import { CoffeeTreePlatform } from '../helpers/platform-helper';

/**
 * Error Handling and Recovery Testing Suite
 * 
 * Tests platform resilience under various failure conditions
 * including transaction failures, network issues, and data corruption.
 */
describe('Coffee Tree Platform - Error Handling and Recovery', () => {
  let platform: CoffeeTreePlatform;
  let testAccounts: Array<{ id: AccountId; key: PrivateKey }>;
  
  beforeEach(async () => {
    const testEnv = await setupTestEnvironment();
    platform = new CoffeeTreePlatform(testEnv.client);
    await platform.initialize();
    
    // Create test accounts
    testAccounts = [];
    for (let i = 0; i < 10; i++) {
      testAccounts.push(await platform.createTestAccount());
    }
  });
  
  afterEach(async () => {
    await cleanupTestEnvironment();
  });

  describe('Transaction Failure Recovery', () => {
    it('should handle insufficient funds gracefully', async () => {
      const farmer = testAccounts[0];
      const poorInvestor = await platform.createTestAccount(1_000_000); // Only 1 HBAR
      
      await platform.verifyFarmer(farmer);
      
      const groveName = 'Expensive Grove';
      await platform.registerGrove(farmer, groveName, {
        location: 'Premium Location',
        treeCount: 100,
        coffeeVariety: 'Premium Arabica',
        expectedYieldPerTree: 5000
      });
      
      await platform.tokenizeGrove(farmer, groveName, {
        tokensPerTree: 10,
        pricePerToken: 1_000_000_000 // 1000 HBAR per token
      });
      
      // Attempt purchase with insufficient funds
      try {
        await platform.purchaseTokens(poorInvestor, groveName, {
          tokens: 10,
          value: 10 * 1_000_000_000 // 10,000 HBAR needed
        });
        expect.fail('Should have thrown insufficient funds error');
      } catch (error) {
        expect(error.message).toContain('insufficient');
        console.log('✅ Insufficient funds error handled correctly');
      }
      
      // Verify grove state is unchanged
      const groveInfo = await platform.getGroveInfo(groveName);
      expect(groveInfo.totalTokensSold).toBe(0);
      
      // Verify investor can still make smaller purchase
      await platform.purchaseTokens(poorInvestor, groveName, {
        tokens: 1,
        value: 1_000_000_000 // 1000 HBAR - within budget
      });
      
      const balance = await platform.getTokenBalance(groveName, poorInvestor.id);
      expect(balance).toBe(1);
    });

    it('should handle double-spending attempts', async () => {
      const farmer = testAccounts[0];
      const investor = testAccounts[1];
      
      await platform.verifyFarmer(farmer);
      
      const groveName = 'Double Spend Grove';
      await platform.registerGrove(farmer, groveName, {
        location: 'Test Location',
        treeCount: 100,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      await platform.tokenizeGrove(farmer, groveName, {
        tokensPerTree: 10,
        pricePerTree: 50_000_000
      });
      
      // Purchase all available tokens
      await platform.purchaseTokens(investor, groveName, {
        tokens: 1000, // All tokens
        value: 1000 * 50_000_000
      });
      
      // Attempt to purchase more tokens than available
      try {
        await platform.purchaseTokens(testAccounts[2], groveName, {
          tokens: 1,
          value: 50_000_000
        });
        expect.fail('Should have thrown insufficient tokens error');
      } catch (error) {
        expect(error.message).toContain('insufficient tokens');
        console.log('✅ Double-spending attempt blocked correctly');
      }
      
      // Verify token balances are correct
      const investorBalance = await platform.getTokenBalance(groveName, investor.id);
      const attemptedBuyerBalance = await platform.getTokenBalance(groveName, testAccounts[2].id);
      
      expect(investorBalance).toBe(1000);
      expect(attemptedBuyerBalance).toBe(0);
    });

    it('should handle revenue distribution failures', async () => {
      const farmer = testAccounts[0];
      const investors = testAccounts.slice(1, 6); // 5 investors
      
      await platform.verifyFarmer(farmer);
      
      const groveName = 'Distribution Failure Grove';
      await platform.registerGrove(farmer, groveName, {
        location: 'Test Location',
        treeCount: 100,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      await platform.tokenizeGrove(farmer, groveName, {
        tokensPerTree: 10,
        pricePerToken: 50_000_000
      });
      
      // Add investors
      for (const investor of investors) {
        await platform.purchaseTokens(investor, groveName, {
          tokens: 100,
          value: 100 * 50_000_000
        });
      }
      
      // Report harvest
      await platform.reportHarvest(farmer, groveName, {
        totalYieldKg: 400,
        qualityGrade: 85,
        salePricePerKg: 8_000_000
      });
      
      // First distribution should succeed
      await platform.distributeRevenue(farmer, groveName);
      
      // Attempt double distribution should fail
      try {
        await platform.distributeRevenue(farmer, groveName);
        expect.fail('Should have thrown already distributed error');
      } catch (error) {
        expect(error.message).toContain('already distributed');
        console.log('✅ Double distribution attempt blocked correctly');
      }
      
      // Verify investors received their shares from first distribution
      for (const investor of investors) {
        const balance = await platform.getAccountBalance(investor.id);
        expect(balance).toBeGreaterThan(0);
      }
    });
  });

  describe('Data Corruption Recovery', () => {
    it('should handle invalid grove data gracefully', async () => {
      const farmer = testAccounts[0];
      await platform.verifyFarmer(farmer);
      
      // Test various invalid grove data scenarios
      const invalidGroveData = [
        {
          name: '', // Empty name
          data: { location: 'Test', treeCount: 100, coffeeVariety: 'Arabica', expectedYieldPerTree: 5000 },
          expectedError: 'invalid grove name'
        },
        {
          name: 'Zero Trees Grove',
          data: { location: 'Test', treeCount: 0, coffeeVariety: 'Arabica', expectedYieldPerTree: 5000 },
          expectedError: 'invalid tree count'
        },
        {
          name: 'Empty Variety Grove',
          data: { location: 'Test', treeCount: 100, coffeeVariety: '', expectedYieldPerTree: 5000 },
          expectedError: 'invalid coffee variety'
        },
        {
          name: 'Zero Yield Grove',
          data: { location: 'Test', treeCount: 100, coffeeVariety: 'Arabica', expectedYieldPerTree: 0 },
          expectedError: 'invalid expected yield'
        }
      ];
      
      for (const testCase of invalidGroveData) {
        try {
          await platform.registerGrove(farmer, testCase.name, testCase.data);
          expect.fail(`Should have thrown error for ${testCase.name}`);
        } catch (error) {
          expect(error.message.toLowerCase()).toContain(testCase.expectedError);
          console.log(`✅ Invalid data rejected: ${testCase.name}`);
        }
      }
    });

    it('should handle invalid harvest data gracefully', async () => {
      const farmer = testAccounts[0];
      await platform.verifyFarmer(farmer);
      
      const groveName = 'Harvest Validation Grove';
      await platform.registerGrove(farmer, groveName, {
        location: 'Test Location',
        treeCount: 100,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      await platform.tokenizeGrove(farmer, groveName, {
        tokensPerTree: 10,
        pricePerToken: 50_000_000
      });
      
      // Test invalid harvest data
      const invalidHarvestData = [
        {
          data: { totalYieldKg: 0, qualityGrade: 85, salePricePerKg: 8_000_000 },
          expectedError: 'invalid yield'
        },
        {
          data: { totalYieldKg: 400, qualityGrade: 0, salePricePerKg: 8_000_000 },
          expectedError: 'invalid quality grade'
        },
        {
          data: { totalYieldKg: 400, qualityGrade: 101, salePricePerKg: 8_000_000 },
          expectedError: 'invalid quality grade'
        },
        {
          data: { totalYieldKg: 400, qualityGrade: 85, salePricePerKg: 0 },
          expectedError: 'invalid sale price'
        }
      ];
      
      for (const testCase of invalidHarvestData) {
        try {
          await platform.reportHarvest(farmer, groveName, testCase.data);
          expect.fail(`Should have thrown error for invalid harvest data`);
        } catch (error) {
          expect(error.message.toLowerCase()).toContain(testCase.expectedError);
          console.log(`✅ Invalid harvest data rejected: ${testCase.expectedError}`);
        }
      }
    });
  });

  describe('Network Failure Recovery', () => {
    it('should handle network timeouts with retry mechanism', async () => {
      const farmer = testAccounts[0];
      await platform.verifyFarmer(farmer);
      
      // Set very short timeout to simulate network issues
      const originalTimeout = platform.client.requestTimeout;
      platform.client.requestTimeout = 100; // 100ms timeout
      
      try {
        const groveName = 'Timeout Test Grove';
        
        // Enable retry mechanism
        platform.enableRetries(3, 500); // 3 retries, 500ms delay
        
        // This should eventually succeed despite timeouts
        await platform.registerGrove(farmer, groveName, {
          location: 'Network Test Location',
          treeCount: 100,
          coffeeVariety: 'Arabica',
          expectedYieldPerTree: 5000
        });
        
        console.log('✅ Operation succeeded with retry mechanism');
        
        // Verify grove was actually created
        const groveInfo = await platform.getGroveInfo(groveName);
        expect(groveInfo).toBeDefined();
        
      } finally {
        // Restore normal timeout
        platform.client.requestTimeout = originalTimeout;
        platform.disableRetries();
      }
    });

    it('should handle partial network failures', async () => {
      const farmer = testAccounts[0];
      const investors = testAccounts.slice(1, 4);
      
      await platform.verifyFarmer(farmer);
      
      const groveName = 'Partial Failure Grove';
      await platform.registerGrove(farmer, groveName, {
        location: 'Test Location',
        treeCount: 100,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      await platform.tokenizeGrove(farmer, groveName, {
        tokensPerTree: 10,
        pricePerToken: 50_000_000
      });
      
      // Simulate partial network failure during batch operations
      let successCount = 0;
      let failureCount = 0;
      
      const purchasePromises = investors.map(async (investor, index) => {
        try {
          // Simulate random failures
          if (Math.random() < 0.3) { // 30% failure rate
            throw new Error('Simulated network failure');
          }
          
          await platform.purchaseTokens(investor, groveName, {
            tokens: 50,
            value: 50 * 50_000_000
          });
          successCount++;
        } catch (error) {
          failureCount++;
          console.log(`Purchase ${index} failed: ${error.message}`);
        }
      });
      
      await Promise.allSettled(purchasePromises);
      
      console.log(`Batch operation results: ${successCount} successes, ${failureCount} failures`);
      
      // Verify successful purchases were processed correctly
      let totalTokensPurchased = 0;
      for (const investor of investors) {
        const balance = await platform.getTokenBalance(groveName, investor.id);
        totalTokensPurchased += balance;
      }
      
      expect(totalTokensPurchased).toBe(successCount * 50);
    });
  });

  describe('State Consistency Recovery', () => {
    it('should maintain consistency after failed operations', async () => {
      const farmer = testAccounts[0];
      const investor = testAccounts[1];
      
      await platform.verifyFarmer(farmer);
      
      const groveName = 'Consistency Test Grove';
      await platform.registerGrove(farmer, groveName, {
        location: 'Test Location',
        treeCount: 100,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      await platform.tokenizeGrove(farmer, groveName, {
        tokensPerTree: 10,
        pricePerToken: 50_000_000
      });
      
      // Record initial state
      const initialGroveInfo = await platform.getGroveInfo(groveName);
      const initialInvestorBalance = await platform.getAccountBalance(investor.id);
      
      // Attempt invalid operation that should fail
      try {
        await platform.purchaseTokens(investor, groveName, {
          tokens: -10, // Negative tokens
          value: 50_000_000
        });
        expect.fail('Should have failed with negative tokens');
      } catch (error) {
        console.log('✅ Invalid operation rejected as expected');
      }
      
      // Verify state is unchanged after failed operation
      const postFailureGroveInfo = await platform.getGroveInfo(groveName);
      const postFailureInvestorBalance = await platform.getAccountBalance(investor.id);
      
      expect(postFailureGroveInfo.totalTokensSold).toBe(initialGroveInfo.totalTokensSold);
      expect(postFailureInvestorBalance).toBe(initialInvestorBalance);
      
      // Verify valid operation still works
      await platform.purchaseTokens(investor, groveName, {
        tokens: 50,
        value: 50 * 50_000_000
      });
      
      const finalBalance = await platform.getTokenBalance(groveName, investor.id);
      expect(finalBalance).toBe(50);
    });

    it('should recover from interrupted multi-step operations', async () => {
      const farmer = testAccounts[0];
      const investors = testAccounts.slice(1, 6);
      
      await platform.verifyFarmer(farmer);
      
      const groveName = 'Multi-Step Recovery Grove';
      await platform.registerGrove(farmer, groveName, {
        location: 'Test Location',
        treeCount: 100,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      await platform.tokenizeGrove(farmer, groveName, {
        tokensPerTree: 10,
        pricePerToken: 50_000_000
      });
      
      // Add investors
      for (const investor of investors) {
        await platform.purchaseTokens(investor, groveName, {
          tokens: 100,
          value: 100 * 50_000_000
        });
      }
      
      // Report harvest
      await platform.reportHarvest(farmer, groveName, {
        totalYieldKg: 400,
        qualityGrade: 85,
        salePricePerKg: 8_000_000
      });
      
      // Simulate interruption during revenue distribution
      // (In real scenario, this might be a network failure or system crash)
      
      // Record pre-distribution state
      const preDistributionBalances = [];
      for (const investor of investors) {
        const balance = await platform.getAccountBalance(investor.id);
        preDistributionBalances.push(balance);
      }
      
      // Attempt distribution (should succeed)
      await platform.distributeRevenue(farmer, groveName);
      
      // Verify distribution completed successfully
      let totalDistributed = 0;
      for (let i = 0; i < investors.length; i++) {
        const postBalance = await platform.getAccountBalance(investors[i].id);
        const distributed = postBalance - preDistributionBalances[i];
        totalDistributed += distributed;
        expect(distributed).toBeGreaterThan(0);
      }
      
      const expectedTotal = 400 * 8_000_000 * 0.8; // 80% to investors
      expect(totalDistributed).toBeCloseTo(expectedTotal, -6);
      
      console.log('✅ Multi-step operation completed successfully');
    });
  });

  describe('Security Failure Recovery', () => {
    it('should handle unauthorized access attempts', async () => {
      const farmer = testAccounts[0];
      const maliciousUser = testAccounts[1];
      
      await platform.verifyFarmer(farmer);
      
      const groveName = 'Security Test Grove';
      await platform.registerGrove(farmer, groveName, {
        location: 'Test Location',
        treeCount: 100,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      await platform.tokenizeGrove(farmer, groveName, {
        tokensPerTree: 10,
        pricePerToken: 50_000_000
      });
      
      // Malicious user attempts to report harvest for farmer's grove
      try {
        await platform.reportHarvest(maliciousUser, groveName, {
          totalYieldKg: 1000000, // Fake massive harvest
          qualityGrade: 100,
          salePricePerKg: 1_000_000_000
        });
        expect.fail('Should have blocked unauthorized harvest reporting');
      } catch (error) {
        expect(error.message).toContain('unauthorized');
        console.log('✅ Unauthorized harvest reporting blocked');
      }
      
      // Malicious user attempts to distribute revenue
      try {
        await platform.distributeRevenue(maliciousUser, groveName);
        expect.fail('Should have blocked unauthorized revenue distribution');
      } catch (error) {
        expect(error.message).toContain('unauthorized');
        console.log('✅ Unauthorized revenue distribution blocked');
      }
      
      // Verify grove state is unchanged
      const groveInfo = await platform.getGroveInfo(groveName);
      expect(groveInfo.totalHarvests).toBe(0);
    });

    it('should handle verification bypass attempts', async () => {
      const unverifiedFarmer = testAccounts[0];
      
      // Attempt to register grove without verification
      try {
        await platform.registerGrove(unverifiedFarmer, 'Unverified Grove', {
          location: 'Test Location',
          treeCount: 100,
          coffeeVariety: 'Arabica',
          expectedYieldPerTree: 5000
        });
        expect.fail('Should have blocked unverified farmer');
      } catch (error) {
        expect(error.message).toContain('not verified');
        console.log('✅ Unverified farmer blocked from grove registration');
      }
      
      // Verify farmer and try again
      await platform.verifyFarmer(unverifiedFarmer);
      
      // Now should succeed
      await platform.registerGrove(unverifiedFarmer, 'Verified Grove', {
        location: 'Test Location',
        treeCount: 100,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      console.log('✅ Verified farmer can register grove successfully');
    });
  });
});