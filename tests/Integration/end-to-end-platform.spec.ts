import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Client, AccountId, PrivateKey, ContractId, Hbar, ContractExecuteTransaction, ContractCallQuery } from '@hashgraph/sdk';
import { deployContract, setupTestEnvironment, cleanupTestEnvironment } from '../setup/test-helpers';
import { CoffeeTreeIssuer } from '../../contracts/CoffeeTreeIssuer.sol';
import { FarmerVerification } from '../../contracts/FarmerVerification.sol';
import { CoffeeRevenueReserve } from '../../contracts/CoffeeRevenueReserve.sol';
import { CoffeePriceOracle } from '../../contracts/CoffeePriceOracle.sol';
import { CoffeeTreeMarketplace } from '../../contracts/CoffeeTreeMarketplace.sol';

/**
 * End-to-End Integration Tests for Coffee Tree Platform
 * 
 * These tests validate complete user journeys from grove registration
 * through revenue distribution, including error scenarios and performance
 * under load conditions.
 */
describe('Coffee Tree Platform - End-to-End Integration Tests', () => {
  let client: Client;
  let operatorId: AccountId;
  let operatorKey: PrivateKey;
  
  // Contract instances
  let issuerContract: ContractId;
  let verificationContract: ContractId;
  let reserveContract: ContractId;
  let oracleContract: ContractId;
  let marketplaceContract: ContractId;
  
  // Test accounts
  let farmerAccount: { id: AccountId; key: PrivateKey };
  let investor1Account: { id: AccountId; key: PrivateKey };
  let investor2Account: { id: AccountId; key: PrivateKey };
  let adminAccount: { id: AccountId; key: PrivateKey };
  
  beforeEach(async () => {
    const testEnv = await setupTestEnvironment();
    client = testEnv.client;
    operatorId = testEnv.operatorId;
    operatorKey = testEnv.operatorKey;
    
    // Create test accounts
    farmerAccount = await createTestAccount(client, operatorId, operatorKey);
    investor1Account = await createTestAccount(client, operatorId, operatorKey);
    investor2Account = await createTestAccount(client, operatorId, operatorKey);
    adminAccount = await createTestAccount(client, operatorId, operatorKey);
    
    // Deploy all contracts
    verificationContract = await deployContract(client, 'FarmerVerification', []);
    oracleContract = await deployContract(client, 'CoffeePriceOracle', []);
    reserveContract = await deployContract(client, 'CoffeeRevenueReserve', []);
    marketplaceContract = await deployContract(client, 'CoffeeTreeMarketplace', []);
    
    issuerContract = await deployContract(client, 'CoffeeTreeIssuer', [
      verificationContract.toString(),
      oracleContract.toString(),
      reserveContract.toString(),
      marketplaceContract.toString()
    ]);
    
    // Initialize contracts
    await initializeContracts();
  });
  
  afterEach(async () => {
    await cleanupTestEnvironment();
  });

  describe('Complete Farmer-to-Investor Journey', () => {
    it('should handle full platform workflow from grove registration to revenue distribution', async () => {
      // Step 1: Farmer Verification
      console.log('Step 1: Farmer Verification');
      await verifyFarmer(farmerAccount);
      
      // Step 2: Grove Registration
      console.log('Step 2: Grove Registration');
      const groveName = 'Test Grove E2E';
      const groveData = {
        location: 'Costa Rica, Central Valley',
        treeCount: 100,
        coffeeVariety: 'Arabica Caturra',
        expectedYieldPerTree: 5000 // grams per tree
      };
      
      await registerGrove(farmerAccount, groveName, groveData);
      
      // Step 3: Tree Tokenization
      console.log('Step 3: Tree Tokenization');
      const tokenizationData = {
        tokensPerTree: 10,
        pricePerToken: 50_000_000 // 50 HBAR in tinybars
      };
      
      const groveTokenAddress = await tokenizeGrove(farmerAccount, groveName, tokenizationData);
      
      // Step 4: Investor Purchases
      console.log('Step 4: Investor Purchases');
      const investor1Purchase = { tokens: 200, value: 200 * tokenizationData.pricePerToken };
      const investor2Purchase = { tokens: 300, value: 300 * tokenizationData.pricePerToken };
      
      await purchaseTokens(investor1Account, groveName, investor1Purchase);
      await purchaseTokens(investor2Account, groveName, investor2Purchase);
      
      // Verify token balances
      const investor1Balance = await getTokenBalance(groveTokenAddress, investor1Account.id);
      const investor2Balance = await getTokenBalance(groveTokenAddress, investor2Account.id);
      
      expect(investor1Balance).toBe(investor1Purchase.tokens);
      expect(investor2Balance).toBe(investor2Purchase.tokens);
      
      // Step 5: Harvest Reporting
      console.log('Step 5: Harvest Reporting');
      const harvestData = {
        totalYieldKg: 400, // 400kg total harvest
        qualityGrade: 85,
        salePricePerKg: 8_000_000 // 8 HBAR per kg
      };
      
      const totalRevenue = harvestData.totalYieldKg * harvestData.salePricePerKg;
      await reportHarvest(farmerAccount, groveName, harvestData);
      
      // Step 6: Revenue Distribution
      console.log('Step 6: Revenue Distribution');
      const initialInvestor1Balance = await getAccountBalance(investor1Account.id);
      const initialInvestor2Balance = await getAccountBalance(investor2Account.id);
      
      await distributeRevenue(farmerAccount, groveName);
      
      // Verify revenue distribution
      const finalInvestor1Balance = await getAccountBalance(investor1Account.id);
      const finalInvestor2Balance = await getAccountBalance(investor2Account.id);
      
      const totalInvestorTokens = investor1Purchase.tokens + investor2Purchase.tokens;
      const expectedInvestor1Share = Math.floor((totalRevenue * 0.8 * investor1Purchase.tokens) / totalInvestorTokens);
      const expectedInvestor2Share = Math.floor((totalRevenue * 0.8 * investor2Purchase.tokens) / totalInvestorTokens);
      
      expect(finalInvestor1Balance - initialInvestor1Balance).toBeCloseTo(expectedInvestor1Share, -6);
      expect(finalInvestor2Balance - initialInvestor2Balance).toBeCloseTo(expectedInvestor2Share, -6);
      
      // Step 7: Secondary Market Trading
      console.log('Step 7: Secondary Market Trading');
      const tradeAmount = 50;
      const tradePrice = 55_000_000; // 55 HBAR per token (10% premium)
      
      await listTokensForSale(investor1Account, groveName, tradeAmount, tradePrice);
      await purchaseListedTokens(investor2Account, groveName, tradeAmount, tradePrice);
      
      // Verify trade execution
      const finalInvestor1Tokens = await getTokenBalance(groveTokenAddress, investor1Account.id);
      const finalInvestor2Tokens = await getTokenBalance(groveTokenAddress, investor2Account.id);
      
      expect(finalInvestor1Tokens).toBe(investor1Purchase.tokens - tradeAmount);
      expect(finalInvestor2Tokens).toBe(investor2Purchase.tokens + tradeAmount);
      
      console.log('✅ Complete farmer-to-investor journey successful');
    }, 60000); // 60 second timeout for full workflow
  });

  describe('Load Testing - Multiple Concurrent Operations', () => {
    it('should handle multiple concurrent grove registrations', async () => {
      // Verify multiple farmers
      const farmers = await Promise.all([
        createTestAccount(client, operatorId, operatorKey),
        createTestAccount(client, operatorId, operatorKey),
        createTestAccount(client, operatorId, operatorKey),
        createTestAccount(client, operatorId, operatorKey),
        createTestAccount(client, operatorId, operatorKey)
      ]);
      
      await Promise.all(farmers.map(farmer => verifyFarmer(farmer)));
      
      // Register groves concurrently
      const groveRegistrations = farmers.map((farmer, index) => 
        registerGrove(farmer, `Load Test Grove ${index}`, {
          location: `Test Location ${index}`,
          treeCount: 50 + index * 10,
          coffeeVariety: 'Arabica',
          expectedYieldPerTree: 4000 + index * 200
        })
      );
      
      const startTime = Date.now();
      await Promise.all(groveRegistrations);
      const endTime = Date.now();
      
      console.log(`Concurrent grove registrations completed in ${endTime - startTime}ms`);
      expect(endTime - startTime).toBeLessThan(30000); // Should complete within 30 seconds
    }, 45000);

    it('should handle multiple concurrent token purchases', async () => {
      // Setup a grove
      await verifyFarmer(farmerAccount);
      const groveName = 'Load Test Purchase Grove';
      await registerGrove(farmerAccount, groveName, {
        location: 'Test Location',
        treeCount: 1000,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      await tokenizeGrove(farmerAccount, groveName, {
        tokensPerTree: 10,
        pricePerToken: 50_000_000
      });
      
      // Create multiple investors
      const investors = await Promise.all([
        createTestAccount(client, operatorId, operatorKey),
        createTestAccount(client, operatorId, operatorKey),
        createTestAccount(client, operatorId, operatorKey),
        createTestAccount(client, operatorId, operatorKey),
        createTestAccount(client, operatorId, operatorKey),
        createTestAccount(client, operatorId, operatorKey),
        createTestAccount(client, operatorId, operatorKey),
        createTestAccount(client, operatorId, operatorKey),
        createTestAccount(client, operatorId, operatorKey),
        createTestAccount(client, operatorId, operatorKey)
      ]);
      
      // Concurrent purchases
      const purchases = investors.map((investor, index) => 
        purchaseTokens(investor, groveName, {
          tokens: 50 + index * 10,
          value: (50 + index * 10) * 50_000_000
        })
      );
      
      const startTime = Date.now();
      await Promise.all(purchases);
      const endTime = Date.now();
      
      console.log(`Concurrent token purchases completed in ${endTime - startTime}ms`);
      expect(endTime - startTime).toBeLessThan(45000); // Should complete within 45 seconds
    }, 60000);

    it('should handle multiple concurrent revenue distributions', async () => {
      // Setup multiple groves with investors
      await verifyFarmer(farmerAccount);
      
      const groves = ['Grove A', 'Grove B', 'Grove C', 'Grove D', 'Grove E'];
      
      // Register and tokenize groves
      for (const groveName of groves) {
        await registerGrove(farmerAccount, groveName, {
          location: `Location ${groveName}`,
          treeCount: 100,
          coffeeVariety: 'Arabica',
          expectedYieldPerTree: 5000
        });
        
        await tokenizeGrove(farmerAccount, groveName, {
          tokensPerTree: 10,
          pricePerToken: 50_000_000
        });
        
        // Add investors to each grove
        await purchaseTokens(investor1Account, groveName, { tokens: 200, value: 200 * 50_000_000 });
        await purchaseTokens(investor2Account, groveName, { tokens: 300, value: 300 * 50_000_000 });
        
        // Report harvest
        await reportHarvest(farmerAccount, groveName, {
          totalYieldKg: 400,
          qualityGrade: 85,
          salePricePerKg: 8_000_000
        });
      }
      
      // Concurrent revenue distributions
      const distributions = groves.map(groveName => 
        distributeRevenue(farmerAccount, groveName)
      );
      
      const startTime = Date.now();
      await Promise.all(distributions);
      const endTime = Date.now();
      
      console.log(`Concurrent revenue distributions completed in ${endTime - startTime}ms`);
      expect(endTime - startTime).toBeLessThan(60000); // Should complete within 60 seconds
    }, 90000);
  });

  describe('Error Handling and Recovery', () => {
    it('should handle failed transactions gracefully', async () => {
      await verifyFarmer(farmerAccount);
      
      // Test invalid grove registration
      try {
        await registerGrove(farmerAccount, '', { // Empty grove name
          location: 'Test Location',
          treeCount: 0, // Invalid tree count
          coffeeVariety: '',
          expectedYieldPerTree: 0
        });
        expect.fail('Should have thrown an error for invalid grove data');
      } catch (error) {
        expect(error.message).toContain('Invalid grove data');
      }
      
      // Test purchase with insufficient funds
      const groveName = 'Error Test Grove';
      await registerGrove(farmerAccount, groveName, {
        location: 'Test Location',
        treeCount: 100,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      await tokenizeGrove(farmerAccount, groveName, {
        tokensPerTree: 10,
        pricePerToken: 1_000_000_000_000 // Extremely high price
      });
      
      try {
        await purchaseTokens(investor1Account, groveName, {
          tokens: 100,
          value: 100 * 1_000_000_000_000 // More than account balance
        });
        expect.fail('Should have thrown an error for insufficient funds');
      } catch (error) {
        expect(error.message).toContain('insufficient');
      }
    });

    it('should recover from partial failures in batch operations', async () => {
      await verifyFarmer(farmerAccount);
      
      const groveName = 'Recovery Test Grove';
      await registerGrove(farmerAccount, groveName, {
        location: 'Test Location',
        treeCount: 100,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      await tokenizeGrove(farmerAccount, groveName, {
        tokensPerTree: 10,
        pricePerToken: 50_000_000
      });
      
      // Add investors
      await purchaseTokens(investor1Account, groveName, { tokens: 200, value: 200 * 50_000_000 });
      await purchaseTokens(investor2Account, groveName, { tokens: 300, value: 300 * 50_000_000 });
      
      // Report harvest
      await reportHarvest(farmerAccount, groveName, {
        totalYieldKg: 400,
        qualityGrade: 85,
        salePricePerKg: 8_000_000
      });
      
      // Test double distribution (should fail gracefully)
      await distributeRevenue(farmerAccount, groveName);
      
      try {
        await distributeRevenue(farmerAccount, groveName);
        expect.fail('Should have thrown an error for double distribution');
      } catch (error) {
        expect(error.message).toContain('already distributed');
      }
      
      // Verify system state is still consistent
      const groveInfo = await getGroveInfo(groveName);
      expect(groveInfo.lastDistributionDate).toBeDefined();
    });

    it('should handle network interruptions and timeouts', async () => {
      await verifyFarmer(farmerAccount);
      
      const groveName = 'Network Test Grove';
      await registerGrove(farmerAccount, groveName, {
        location: 'Test Location',
        treeCount: 100,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      // Simulate network timeout by setting very short timeout
      const originalTimeout = client.requestTimeout;
      client.requestTimeout = 1; // 1ms timeout
      
      try {
        await tokenizeGrove(farmerAccount, groveName, {
          tokensPerTree: 10,
          pricePerToken: 50_000_000
        });
        expect.fail('Should have timed out');
      } catch (error) {
        expect(error.message).toContain('timeout');
      } finally {
        // Restore normal timeout
        client.requestTimeout = originalTimeout;
      }
      
      // Verify operation can succeed with normal timeout
      await tokenizeGrove(farmerAccount, groveName, {
        tokensPerTree: 10,
        pricePerToken: 50_000_000
      });
    });
  });

  describe('Performance Testing', () => {
    it('should maintain performance with large numbers of token holders', async () => {
      await verifyFarmer(farmerAccount);
      
      const groveName = 'Performance Test Grove';
      await registerGrove(farmerAccount, groveName, {
        location: 'Test Location',
        treeCount: 1000,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      await tokenizeGrove(farmerAccount, groveName, {
        tokensPerTree: 100,
        pricePerToken: 10_000_000 // Lower price for easier testing
      });
      
      // Create 50 investors
      const investors = [];
      for (let i = 0; i < 50; i++) {
        investors.push(await createTestAccount(client, operatorId, operatorKey));
      }
      
      // Each investor buys tokens
      const purchasePromises = investors.map((investor, index) => 
        purchaseTokens(investor, groveName, {
          tokens: 10 + index,
          value: (10 + index) * 10_000_000
        })
      );
      
      await Promise.all(purchasePromises);
      
      // Report harvest
      await reportHarvest(farmerAccount, groveName, {
        totalYieldKg: 4000,
        qualityGrade: 90,
        salePricePerKg: 10_000_000
      });
      
      // Measure revenue distribution performance
      const startTime = Date.now();
      await distributeRevenue(farmerAccount, groveName);
      const endTime = Date.now();
      
      const distributionTime = endTime - startTime;
      console.log(`Revenue distribution to 50 holders completed in ${distributionTime}ms`);
      
      // Should complete within reasonable time even with many holders
      expect(distributionTime).toBeLessThan(30000); // 30 seconds max
      
      // Verify all investors received their share
      let totalDistributed = 0;
      for (const investor of investors) {
        const balance = await getAccountBalance(investor.id);
        expect(balance).toBeGreaterThan(0);
        totalDistributed += balance;
      }
      
      const expectedTotalDistribution = 4000 * 10_000_000 * 0.8; // 80% to investors
      expect(totalDistributed).toBeCloseTo(expectedTotalDistribution, -6);
    }, 120000); // 2 minute timeout

    it('should handle high-frequency trading efficiently', async () => {
      await verifyFarmer(farmerAccount);
      
      const groveName = 'Trading Performance Grove';
      await registerGrove(farmerAccount, groveName, {
        location: 'Test Location',
        treeCount: 1000,
        coffeeVariety: 'Arabica',
        expectedYieldPerTree: 5000
      });
      
      const groveTokenAddress = await tokenizeGrove(farmerAccount, groveName, {
        tokensPerTree: 10,
        pricePerToken: 50_000_000
      });
      
      // Initial token distribution
      await purchaseTokens(investor1Account, groveName, { tokens: 1000, value: 1000 * 50_000_000 });
      await purchaseTokens(investor2Account, groveName, { tokens: 1000, value: 1000 * 50_000_000 });
      
      // Perform rapid trading
      const trades = [];
      for (let i = 0; i < 20; i++) {
        const seller = i % 2 === 0 ? investor1Account : investor2Account;
        const buyer = i % 2 === 0 ? investor2Account : investor1Account;
        
        trades.push(
          listTokensForSale(seller, groveName, 10, 52_000_000 + i * 1_000_000),
          purchaseListedTokens(buyer, groveName, 10, 52_000_000 + i * 1_000_000)
        );
      }
      
      const startTime = Date.now();
      await Promise.all(trades);
      const endTime = Date.now();
      
      const tradingTime = endTime - startTime;
      console.log(`40 rapid trades completed in ${tradingTime}ms`);
      
      expect(tradingTime).toBeLessThan(60000); // Should complete within 60 seconds
      
      // Verify final balances are consistent
      const finalInvestor1Balance = await getTokenBalance(groveTokenAddress, investor1Account.id);
      const finalInvestor2Balance = await getTokenBalance(groveTokenAddress, investor2Account.id);
      
      expect(finalInvestor1Balance + finalInvestor2Balance).toBe(2000); // Total tokens preserved
    }, 90000);
  });

  // Helper functions
  async function createTestAccount(client: Client, operatorId: AccountId, operatorKey: PrivateKey) {
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;
    
    const newAccount = await new AccountCreateTransaction()
      .setKey(newAccountPublicKey)
      .setInitialBalance(Hbar.fromTinybars(1000_000_000_000)) // 1000 HBAR
      .execute(client);
    
    const getReceipt = await newAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;
    
    return {
      id: newAccountId!,
      key: newAccountPrivateKey
    };
  }
  
  async function initializeContracts() {
    // Set up price oracle with initial coffee prices
    await new ContractExecuteTransaction()
      .setContractId(oracleContract)
      .setGas(100000)
      .setFunction('updateCoffeePrice', ['Arabica', 8_000_000])
      .execute(client);
  }
  
  async function verifyFarmer(farmer: { id: AccountId; key: PrivateKey }) {
    await new ContractExecuteTransaction()
      .setContractId(verificationContract)
      .setGas(100000)
      .setFunction('verifyFarmer', [farmer.id.toString(), true])
      .execute(client);
  }
  
  async function registerGrove(
    farmer: { id: AccountId; key: PrivateKey },
    groveName: string,
    groveData: any
  ) {
    const transaction = new ContractExecuteTransaction()
      .setContractId(issuerContract)
      .setGas(200000)
      .setFunction('registerCoffeeGrove', [
        groveName,
        groveData.location,
        groveData.treeCount,
        groveData.coffeeVariety,
        groveData.expectedYieldPerTree
      ])
      .freezeWith(client)
      .sign(farmer.key);
    
    await transaction.execute(client);
  }
  
  async function tokenizeGrove(
    farmer: { id: AccountId; key: PrivateKey },
    groveName: string,
    tokenizationData: any
  ) {
    const transaction = new ContractExecuteTransaction()
      .setContractId(issuerContract)
      .setGas(300000)
      .setFunction('tokenizeCoffeeGrove', [
        groveName,
        tokenizationData.tokensPerTree,
        tokenizationData.pricePerToken
      ])
      .freezeWith(client)
      .sign(farmer.key);
    
    const result = await transaction.execute(client);
    const receipt = await result.getReceipt(client);
    
    // Extract token address from logs (simplified)
    return `0x${groveName.replace(/\s+/g, '').toLowerCase()}`;
  }
  
  async function purchaseTokens(
    investor: { id: AccountId; key: PrivateKey },
    groveName: string,
    purchase: { tokens: number; value: number }
  ) {
    const transaction = new ContractExecuteTransaction()
      .setContractId(issuerContract)
      .setGas(200000)
      .setPayableAmount(Hbar.fromTinybars(purchase.value))
      .setFunction('purchaseTreeTokens', [groveName, purchase.tokens])
      .freezeWith(client)
      .sign(investor.key);
    
    await transaction.execute(client);
  }
  
  async function reportHarvest(
    farmer: { id: AccountId; key: PrivateKey },
    groveName: string,
    harvestData: any
  ) {
    const transaction = new ContractExecuteTransaction()
      .setContractId(issuerContract)
      .setGas(200000)
      .setFunction('reportHarvest', [
        groveName,
        harvestData.totalYieldKg,
        harvestData.qualityGrade,
        harvestData.salePricePerKg
      ])
      .freezeWith(client)
      .sign(farmer.key);
    
    await transaction.execute(client);
  }
  
  async function distributeRevenue(
    farmer: { id: AccountId; key: PrivateKey },
    groveName: string
  ) {
    const transaction = new ContractExecuteTransaction()
      .setContractId(issuerContract)
      .setGas(500000)
      .setFunction('distributeRevenue', [groveName])
      .freezeWith(client)
      .sign(farmer.key);
    
    await transaction.execute(client);
  }
  
  async function listTokensForSale(
    seller: { id: AccountId; key: PrivateKey },
    groveName: string,
    amount: number,
    price: number
  ) {
    const transaction = new ContractExecuteTransaction()
      .setContractId(marketplaceContract)
      .setGas(200000)
      .setFunction('listTokensForSale', [groveName, amount, price])
      .freezeWith(client)
      .sign(seller.key);
    
    await transaction.execute(client);
  }
  
  async function purchaseListedTokens(
    buyer: { id: AccountId; key: PrivateKey },
    groveName: string,
    amount: number,
    price: number
  ) {
    const transaction = new ContractExecuteTransaction()
      .setContractId(marketplaceContract)
      .setGas(200000)
      .setPayableAmount(Hbar.fromTinybars(amount * price))
      .setFunction('purchaseListedTokens', [groveName, amount])
      .freezeWith(client)
      .sign(buyer.key);
    
    await transaction.execute(client);
  }
  
  async function getTokenBalance(tokenAddress: string, accountId: AccountId): Promise<number> {
    // Simplified token balance query
    const query = new ContractCallQuery()
      .setContractId(tokenAddress)
      .setGas(50000)
      .setFunction('balanceOf', [accountId.toString()]);
    
    const result = await query.execute(client);
    return result.getUint64(0);
  }
  
  async function getAccountBalance(accountId: AccountId): Promise<number> {
    const balance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);
    
    return balance.hbars.toTinybars().toNumber();
  }
  
  async function getGroveInfo(groveName: string): Promise<any> {
    const query = new ContractCallQuery()
      .setContractId(issuerContract)
      .setGas(50000)
      .setFunction('getGroveInfo', [groveName]);
    
    const result = await query.execute(client);
    return {
      lastDistributionDate: result.getUint64(0)
    };
  }
});