import { 
  Client, 
  AccountId, 
  PrivateKey, 
  ContractId, 
  Hbar, 
  ContractExecuteTransaction, 
  ContractCallQuery,
  AccountCreateTransaction,
  AccountBalanceQuery,
  TransferTransaction,
  ContractFunctionParameters
} from '@hashgraph/sdk';
import { deployContract } from '../setup/test-helpers';

/**
 * Coffee Tree Platform Helper
 * 
 * Provides high-level methods for interacting with the coffee tree platform
 * during testing. Abstracts away low-level contract interactions and provides
 * retry mechanisms and error handling.
 */
export class CoffeeTreePlatform {
  public client: Client;
  private operatorId: AccountId;
  private operatorKey: PrivateKey;
  
  // Contract instances
  private issuerContract: ContractId;
  private verificationContract: ContractId;
  private reserveContract: ContractId;
  private oracleContract: ContractId;
  private marketplaceContract: ContractId;
  
  // Retry configuration
  private retryEnabled = false;
  private maxRetries = 0;
  private retryDelay = 0;
  
  constructor(client: Client) {
    this.client = client;
    this.operatorId = client.operatorAccountId!;
    this.operatorKey = client.operatorPrivateKey!;
  }
  
  async initialize(): Promise<void> {
    // Deploy all contracts
    this.verificationContract = await deployContract(this.client, 'FarmerVerification', []);
    this.oracleContract = await deployContract(this.client, 'CoffeePriceOracle', []);
    this.reserveContract = await deployContract(this.client, 'CoffeeRevenueReserve', []);
    this.marketplaceContract = await deployContract(this.client, 'CoffeeTreeMarketplace', []);
    
    this.issuerContract = await deployContract(this.client, 'CoffeeTreeIssuer', [
      this.verificationContract.toString(),
      this.oracleContract.toString(),
      this.reserveContract.toString(),
      this.marketplaceContract.toString()
    ]);
    
    // Initialize contracts with default values
    await this.initializeContracts();
  }
  
  private async initializeContracts(): Promise<void> {
    // Set up price oracle with initial coffee prices
    await this.executeWithRetry(async () => {
      return new ContractExecuteTransaction()
        .setContractId(this.oracleContract)
        .setGas(100000)
        .setFunction('updateCoffeePrice', ['Arabica', 8_000_000])
        .execute(this.client);
    });
    
    await this.executeWithRetry(async () => {
      return new ContractExecuteTransaction()
        .setContractId(this.oracleContract)
        .setGas(100000)
        .setFunction('updateCoffeePrice', ['Robusta', 6_000_000])
        .execute(this.client);
    });
  }
  
  enableRetries(maxRetries: number, delayMs: number): void {
    this.retryEnabled = true;
    this.maxRetries = maxRetries;
    this.retryDelay = delayMs;
  }
  
  disableRetries(): void {
    this.retryEnabled = false;
    this.maxRetries = 0;
    this.retryDelay = 0;
  }
  
  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.retryEnabled) {
      return operation();
    }
    
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.maxRetries) {
          console.log(`Attempt ${attempt + 1} failed, retrying in ${this.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }
    
    throw lastError!;
  }
  
  async createTestAccount(initialBalance: number = 1000_000_000_000): Promise<{ id: AccountId; key: PrivateKey }> {
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;
    
    const newAccount = await new AccountCreateTransaction()
      .setKey(newAccountPublicKey)
      .setInitialBalance(Hbar.fromTinybars(initialBalance))
      .execute(this.client);
    
    const getReceipt = await newAccount.getReceipt(this.client);
    const newAccountId = getReceipt.accountId;
    
    return {
      id: newAccountId!,
      key: newAccountPrivateKey
    };
  }
  
  async verifyFarmer(farmer: { id: AccountId; key: PrivateKey }): Promise<void> {
    await this.executeWithRetry(async () => {
      return new ContractExecuteTransaction()
        .setContractId(this.verificationContract)
        .setGas(100000)
        .setFunction('verifyFarmer', [farmer.id.toString(), true])
        .execute(this.client);
    });
  }
  
  async registerGrove(
    farmer: { id: AccountId; key: PrivateKey },
    groveName: string,
    groveData: {
      location: string;
      treeCount: number;
      coffeeVariety: string;
      expectedYieldPerTree: number;
    }
  ): Promise<void> {
    // Validate input data
    if (!groveName || groveName.trim() === '') {
      throw new Error('Invalid grove name');
    }
    if (groveData.treeCount <= 0) {
      throw new Error('Invalid tree count');
    }
    if (!groveData.coffeeVariety || groveData.coffeeVariety.trim() === '') {
      throw new Error('Invalid coffee variety');
    }
    if (groveData.expectedYieldPerTree <= 0) {
      throw new Error('Invalid expected yield');
    }
    
    await this.executeWithRetry(async () => {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.issuerContract)
        .setGas(200000)
        .setFunction('registerCoffeeGrove', [
          groveName,
          groveData.location,
          groveData.treeCount,
          groveData.coffeeVariety,
          groveData.expectedYieldPerTree
        ])
        .freezeWith(this.client)
        .sign(farmer.key);
      
      return transaction.execute(this.client);
    });
  }
  
  async tokenizeGrove(
    farmer: { id: AccountId; key: PrivateKey },
    groveName: string,
    tokenizationData: {
      tokensPerTree: number;
      pricePerToken: number;
    }
  ): Promise<string> {
    const result = await this.executeWithRetry(async () => {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.issuerContract)
        .setGas(300000)
        .setFunction('tokenizeCoffeeGrove', [
          groveName,
          tokenizationData.tokensPerTree,
          tokenizationData.pricePerToken
        ])
        .freezeWith(this.client)
        .sign(farmer.key);
      
      return transaction.execute(this.client);
    });
    
    const receipt = await result.getReceipt(this.client);
    
    // Return a mock token address for testing
    return `0x${groveName.replace(/\s+/g, '').toLowerCase()}`;
  }
  
  async purchaseTokens(
    investor: { id: AccountId; key: PrivateKey },
    groveName: string,
    purchase: {
      tokens: number;
      value: number;
    }
  ): Promise<void> {
    // Validate input data
    if (purchase.tokens <= 0) {
      throw new Error('Invalid token amount');
    }
    
    await this.executeWithRetry(async () => {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.issuerContract)
        .setGas(200000)
        .setPayableAmount(Hbar.fromTinybars(purchase.value))
        .setFunction('purchaseTreeTokens', [groveName, purchase.tokens])
        .freezeWith(this.client)
        .sign(investor.key);
      
      return transaction.execute(this.client);
    });
  }
  
  async reportHarvest(
    farmer: { id: AccountId; key: PrivateKey },
    groveName: string,
    harvestData: {
      totalYieldKg: number;
      qualityGrade: number;
      salePricePerKg: number;
    }
  ): Promise<void> {
    // Validate input data
    if (harvestData.totalYieldKg <= 0) {
      throw new Error('Invalid yield');
    }
    if (harvestData.qualityGrade <= 0 || harvestData.qualityGrade > 100) {
      throw new Error('Invalid quality grade');
    }
    if (harvestData.salePricePerKg <= 0) {
      throw new Error('Invalid sale price');
    }
    
    await this.executeWithRetry(async () => {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.issuerContract)
        .setGas(200000)
        .setFunction('reportHarvest', [
          groveName,
          harvestData.totalYieldKg,
          harvestData.qualityGrade,
          harvestData.salePricePerKg
        ])
        .freezeWith(this.client)
        .sign(farmer.key);
      
      return transaction.execute(this.client);
    });
  }
  
  async distributeRevenue(
    farmer: { id: AccountId; key: PrivateKey },
    groveName: string
  ): Promise<void> {
    await this.executeWithRetry(async () => {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.issuerContract)
        .setGas(500000)
        .setFunction('distributeRevenue', [groveName])
        .freezeWith(this.client)
        .sign(farmer.key);
      
      return transaction.execute(this.client);
    });
  }
  
  async listTokensForSale(
    seller: { id: AccountId; key: PrivateKey },
    groveName: string,
    amount: number,
    price: number
  ): Promise<void> {
    await this.executeWithRetry(async () => {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.marketplaceContract)
        .setGas(200000)
        .setFunction('listTokensForSale', [groveName, amount, price])
        .freezeWith(this.client)
        .sign(seller.key);
      
      return transaction.execute(this.client);
    });
  }
  
  async purchaseListedTokens(
    buyer: { id: AccountId; key: PrivateKey },
    groveName: string,
    amount: number,
    price: number
  ): Promise<void> {
    await this.executeWithRetry(async () => {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.marketplaceContract)
        .setGas(200000)
        .setPayableAmount(Hbar.fromTinybars(amount * price))
        .setFunction('purchaseListedTokens', [groveName, amount])
        .freezeWith(this.client)
        .sign(buyer.key);
      
      return transaction.execute(this.client);
    });
  }
  
  async getTokenBalance(groveName: string, accountId: AccountId): Promise<number> {
    const tokenAddress = `0x${groveName.replace(/\s+/g, '').toLowerCase()}`;
    
    const result = await this.executeWithRetry(async () => {
      const query = new ContractCallQuery()
        .setContractId(tokenAddress)
        .setGas(50000)
        .setFunction('balanceOf', [accountId.toString()]);
      
      return query.execute(this.client);
    });
    
    return result.getUint64(0);
  }
  
  async getAccountBalance(accountId: AccountId): Promise<number> {
    const balance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(this.client);
    
    return balance.hbars.toTinybars().toNumber();
  }
  
  async getGroveInfo(groveName: string): Promise<{
    totalTokensSold: number;
    totalHarvests: number;
    lastDistributionDate: number;
  }> {
    const result = await this.executeWithRetry(async () => {
      const query = new ContractCallQuery()
        .setContractId(this.issuerContract)
        .setGas(50000)
        .setFunction('getGroveInfo', [groveName]);
      
      return query.execute(this.client);
    });
    
    return {
      totalTokensSold: result.getUint64(0),
      totalHarvests: result.getUint64(1),
      lastDistributionDate: result.getUint64(2)
    };
  }
  
  async transferFunds(
    from: { id: AccountId; key: PrivateKey },
    to: AccountId,
    amount: number
  ): Promise<void> {
    await this.executeWithRetry(async () => {
      const transaction = new TransferTransaction()
        .addHbarTransfer(from.id, Hbar.fromTinybars(-amount))
        .addHbarTransfer(to, Hbar.fromTinybars(amount))
        .freezeWith(this.client)
        .sign(from.key);
      
      return transaction.execute(this.client);
    });
  }
  
  async waitForTransaction(transactionId: string): Promise<void> {
    // Wait for transaction to be processed
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  async getContractInfo(contractId: ContractId): Promise<any> {
    const result = await this.executeWithRetry(async () => {
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(50000)
        .setFunction('getContractInfo', []);
      
      return query.execute(this.client);
    });
    
    return {
      isInitialized: result.getBool(0),
      totalGroves: result.getUint64(1),
      totalTransactions: result.getUint64(2)
    };
  }
  
  async simulateNetworkFailure(failureRate: number = 0.3): Promise<void> {
    // Simulate network failures by randomly throwing errors
    if (Math.random() < failureRate) {
      throw new Error('Simulated network failure');
    }
  }
  
  async cleanup(): Promise<void> {
    // Cleanup resources if needed
    this.retryEnabled = false;
  }
  
  async getAccountTokenBalance(accountId: string | { toString(): string }): Promise<number> {
    try {
      // Convert accountId to string if it's an object with toString method
      const accountIdStr = typeof accountId === 'string' 
        ? accountId 
        : accountId.toString();
        
      const contractCallQuery = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction('balanceOf', new ContractFunctionParameters().addAddress(accountIdStr));

      const result = await contractCallQuery.execute(this.client);
      return result.getUint256(0).toNumber();
    } catch (error) {
      console.error('Error getting account token balance:', error);
      return 0;
    }
  }
}
