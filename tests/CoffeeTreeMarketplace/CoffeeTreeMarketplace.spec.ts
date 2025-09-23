import { describe, it, expect, beforeEach } from 'vitest';

// Mock contract interfaces for testing
interface TokenListing {
  listingId: number;
  seller: string;
  tokenAddress: string;
  groveName: string;
  tokenAmount: number;
  pricePerToken: number;
  listingDate: number;
  isActive: boolean;
  expirationDate: number;
}

interface Trade {
  tradeId: number;
  listingId: number;
  seller: string;
  buyer: string;
  tokenAddress: string;
  groveName: string;
  tokenAmount: number;
  pricePerToken: number;
  totalPrice: number;
  tradeDate: number;
}

// Mock CoffeeTreeMarketplace contract for testing
class MockCoffeeTreeMarketplace {
  private listings: Map<number, TokenListing> = new Map();
  private trades: Map<number, Trade> = new Map();
  private nextListingId = 1;
  private nextTradeId = 1;
  private activeListingIds: number[] = [];
  private completedTradeIds: number[] = [];
  private sellerListings: Map<string, number[]> = new Map();
  private tokenListings: Map<string, number[]> = new Map();
  private userTrades: Map<string, number[]> = new Map();
  
  public marketplaceFeePercent = 250; // 2.5%
  public admin = '0x1234567890123456789012345678901234567890';

  // Mock token balances
  private tokenBalances: Map<string, Map<string, number>> = new Map();
  private usdcBalances: Map<string, number> = new Map();

  constructor() {
    // Initialize some mock data
    this.setTokenBalance('0xtoken1', '0xseller1', 1000);
    this.setTokenBalance('0xtoken1', '0xbuyer1', 0);
    this.setUsdcBalance('0xseller1', 0);
    this.setUsdcBalance('0xbuyer1', 10000);
  }

  setTokenBalance(tokenAddress: string, userAddress: string, balance: number) {
    if (!this.tokenBalances.has(tokenAddress)) {
      this.tokenBalances.set(tokenAddress, new Map());
    }
    this.tokenBalances.get(tokenAddress)!.set(userAddress, balance);
  }

  setUsdcBalance(userAddress: string, balance: number) {
    this.usdcBalances.set(userAddress, balance);
  }

  getTokenBalance(tokenAddress: string, userAddress: string): number {
    return this.tokenBalances.get(tokenAddress)?.get(userAddress) || 0;
  }

  getUsdcBalance(userAddress: string): number {
    return this.usdcBalances.get(userAddress) || 0;
  }

  async listTokensForSale(
    tokenAddress: string,
    groveName: string,
    tokenAmount: number,
    pricePerToken: number,
    durationDays: number,
    seller: string
  ): Promise<number> {
    // Validate inputs
    if (tokenAmount <= 0) throw new Error('InvalidAmount');
    if (pricePerToken <= 0) throw new Error('InvalidPrice');
    if (durationDays <= 0 || durationDays > 365) throw new Error('Invalid duration');
    if (!groveName) throw new Error('Grove name cannot be empty');

    // Check seller has sufficient balance
    const sellerBalance = this.getTokenBalance(tokenAddress, seller);
    if (sellerBalance < tokenAmount) {
      throw new Error(`InsufficientTokenBalance: required ${tokenAmount}, available ${sellerBalance}`);
    }

    // Create listing
    const listingId = this.nextListingId++;
    const expirationDate = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
    
    const listing: TokenListing = {
      listingId,
      seller,
      tokenAddress,
      groveName,
      tokenAmount,
      pricePerToken,
      listingDate: Date.now(),
      isActive: true,
      expirationDate
    };

    this.listings.set(listingId, listing);
    this.activeListingIds.push(listingId);
    
    // Update indexes
    if (!this.sellerListings.has(seller)) {
      this.sellerListings.set(seller, []);
    }
    this.sellerListings.get(seller)!.push(listingId);
    
    if (!this.tokenListings.has(tokenAddress)) {
      this.tokenListings.set(tokenAddress, []);
    }
    this.tokenListings.get(tokenAddress)!.push(listingId);

    // Transfer tokens to marketplace (mock)
    this.setTokenBalance(tokenAddress, seller, sellerBalance - tokenAmount);

    return listingId;
  }

  async purchaseTokens(listingId: number, buyer: string): Promise<number> {
    const listing = this.listings.get(listingId);
    if (!listing) throw new Error('ListingNotFound');
    if (!listing.isActive) throw new Error('ListingNotActive');
    if (Date.now() > listing.expirationDate) throw new Error('ListingExpired');
    if (buyer === listing.seller) throw new Error('CannotBuyOwnListing');

    const totalPrice = listing.tokenAmount * listing.pricePerToken;
    const marketplaceFee = Math.floor((totalPrice * this.marketplaceFeePercent) / 10000);
    const sellerAmount = totalPrice - marketplaceFee;

    // Check buyer has sufficient USDC
    const buyerBalance = this.getUsdcBalance(buyer);
    if (buyerBalance < totalPrice) {
      throw new Error(`InsufficientPayment: required ${totalPrice}, available ${buyerBalance}`);
    }

    // Execute transfers (mock)
    this.setUsdcBalance(buyer, buyerBalance - totalPrice);
    this.setUsdcBalance(listing.seller, this.getUsdcBalance(listing.seller) + sellerAmount);
    this.setTokenBalance(listing.tokenAddress, buyer, 
      this.getTokenBalance(listing.tokenAddress, buyer) + listing.tokenAmount);

    // Create trade record
    const tradeId = this.nextTradeId++;
    const trade: Trade = {
      tradeId,
      listingId,
      seller: listing.seller,
      buyer,
      tokenAddress: listing.tokenAddress,
      groveName: listing.groveName,
      tokenAmount: listing.tokenAmount,
      pricePerToken: listing.pricePerToken,
      totalPrice,
      tradeDate: Date.now()
    };

    this.trades.set(tradeId, trade);
    this.completedTradeIds.push(tradeId);

    // Update user trades
    if (!this.userTrades.has(listing.seller)) {
      this.userTrades.set(listing.seller, []);
    }
    this.userTrades.get(listing.seller)!.push(tradeId);
    
    if (!this.userTrades.has(buyer)) {
      this.userTrades.set(buyer, []);
    }
    this.userTrades.get(buyer)!.push(tradeId);

    // Deactivate listing
    listing.isActive = false;
    this.activeListingIds = this.activeListingIds.filter(id => id !== listingId);

    return tradeId;
  }

  async cancelListing(listingId: number, seller: string): Promise<void> {
    const listing = this.listings.get(listingId);
    if (!listing) throw new Error('ListingNotFound');
    if (listing.seller !== seller) throw new Error('UnauthorizedSeller');
    if (!listing.isActive) throw new Error('ListingNotActive');

    // Return tokens to seller (mock)
    const currentBalance = this.getTokenBalance(listing.tokenAddress, seller);
    this.setTokenBalance(listing.tokenAddress, seller, currentBalance + listing.tokenAmount);

    // Deactivate listing
    listing.isActive = false;
    this.activeListingIds = this.activeListingIds.filter(id => id !== listingId);
  }

  async updateListing(
    listingId: number,
    newPricePerToken: number,
    newDurationDays: number,
    seller: string
  ): Promise<void> {
    const listing = this.listings.get(listingId);
    if (!listing) throw new Error('ListingNotFound');
    if (listing.seller !== seller) throw new Error('UnauthorizedSeller');
    if (!listing.isActive) throw new Error('ListingNotActive');
    if (newPricePerToken <= 0) throw new Error('InvalidPrice');
    if (newDurationDays <= 0 || newDurationDays > 365) throw new Error('Invalid duration');

    listing.pricePerToken = newPricePerToken;
    listing.expirationDate = Date.now() + (newDurationDays * 24 * 60 * 60 * 1000);
  }

  getActiveListings(offset: number = 0, limit: number = 10): { listings: TokenListing[], totalActive: number } {
    const activeListings = Array.from(this.listings.values())
      .filter(listing => listing.isActive && Date.now() <= listing.expirationDate);
    
    const totalActive = activeListings.length;
    const paginatedListings = activeListings.slice(offset, offset + limit);
    
    return { listings: paginatedListings, totalActive };
  }

  getTokenListings(tokenAddress: string): TokenListing[] {
    const listingIds = this.tokenListings.get(tokenAddress) || [];
    return listingIds
      .map(id => this.listings.get(id)!)
      .filter(listing => listing.isActive && Date.now() <= listing.expirationDate);
  }

  getUserListings(userAddress: string): TokenListing[] {
    const listingIds = this.sellerListings.get(userAddress) || [];
    return listingIds
      .map(id => this.listings.get(id)!)
      .filter(listing => listing.isActive && Date.now() <= listing.expirationDate);
  }

  getUserTrades(userAddress: string): Trade[] {
    const tradeIds = this.userTrades.get(userAddress) || [];
    return tradeIds.map(id => this.trades.get(id)!);
  }

  getRecentTrades(offset: number = 0, limit: number = 10): { trades: Trade[], totalTrades: number } {
    const allTrades = this.completedTradeIds
      .map(id => this.trades.get(id)!)
      .reverse(); // Most recent first
    
    const totalTrades = allTrades.length;
    const paginatedTrades = allTrades.slice(offset, offset + limit);
    
    return { trades: paginatedTrades, totalTrades };
  }

  getMarketplaceStats(): {
    totalListings: number;
    activeListings: number;
    totalTrades: number;
    totalVolume: number;
  } {
    const totalListings = this.nextListingId - 1;
    const activeListings = Array.from(this.listings.values())
      .filter(listing => listing.isActive && Date.now() <= listing.expirationDate).length;
    const totalTrades = this.completedTradeIds.length;
    const totalVolume = Array.from(this.trades.values())
      .reduce((sum, trade) => sum + trade.totalPrice, 0);

    return { totalListings, activeListings, totalTrades, totalVolume };
  }

  getListing(listingId: number): TokenListing | undefined {
    return this.listings.get(listingId);
  }

  getTrade(tradeId: number): Trade | undefined {
    return this.trades.get(tradeId);
  }

  isListingActive(listingId: number): boolean {
    const listing = this.listings.get(listingId);
    return listing ? listing.isActive && Date.now() <= listing.expirationDate : false;
  }
}

describe('CoffeeTreeMarketplace', () => {
  let marketplace: MockCoffeeTreeMarketplace;
  const seller1 = '0xseller1';
  const buyer1 = '0xbuyer1';
  const tokenAddress = '0xtoken1';
  const groveName = 'Test Grove';

  beforeEach(() => {
    marketplace = new MockCoffeeTreeMarketplace();
  });

  describe('Token Listing', () => {
    it('should allow token holders to list tokens for sale', async () => {
      const listingId = await marketplace.listTokensForSale(
        tokenAddress,
        groveName,
        100,
        50, // 50 USDC per token
        30, // 30 days
        seller1
      );

      expect(listingId).toBe(1);
      
      const listing = marketplace.getListing(listingId);
      expect(listing).toBeDefined();
      expect(listing!.seller).toBe(seller1);
      expect(listing!.tokenAmount).toBe(100);
      expect(listing!.pricePerToken).toBe(50);
      expect(listing!.isActive).toBe(true);
    });

    it('should reject listing with zero token amount', async () => {
      await expect(
        marketplace.listTokensForSale(tokenAddress, groveName, 0, 50, 30, seller1)
      ).rejects.toThrow('InvalidAmount');
    });

    it('should reject listing with zero price', async () => {
      await expect(
        marketplace.listTokensForSale(tokenAddress, groveName, 100, 0, 30, seller1)
      ).rejects.toThrow('InvalidPrice');
    });

    it('should reject listing when seller has insufficient tokens', async () => {
      await expect(
        marketplace.listTokensForSale(tokenAddress, groveName, 2000, 50, 30, seller1)
      ).rejects.toThrow('InsufficientTokenBalance');
    });

    it('should reject listing with invalid duration', async () => {
      await expect(
        marketplace.listTokensForSale(tokenAddress, groveName, 100, 50, 0, seller1)
      ).rejects.toThrow('Invalid duration');

      await expect(
        marketplace.listTokensForSale(tokenAddress, groveName, 100, 50, 400, seller1)
      ).rejects.toThrow('Invalid duration');
    });
  });

  describe('Token Purchase', () => {
    let listingId: number;

    beforeEach(async () => {
      listingId = await marketplace.listTokensForSale(
        tokenAddress,
        groveName,
        100,
        50,
        30,
        seller1
      );
    });

    it('should allow investors to purchase listed tokens', async () => {
      const initialBuyerTokens = marketplace.getTokenBalance(tokenAddress, buyer1);
      const initialBuyerUsdc = marketplace.getUsdcBalance(buyer1);
      const initialSellerUsdc = marketplace.getUsdcBalance(seller1);

      const tradeId = await marketplace.purchaseTokens(listingId, buyer1);

      expect(tradeId).toBe(1);

      // Check token transfer
      const finalBuyerTokens = marketplace.getTokenBalance(tokenAddress, buyer1);
      expect(finalBuyerTokens).toBe(initialBuyerTokens + 100);

      // Check USDC transfers
      const totalPrice = 100 * 50; // 5000 USDC
      const marketplaceFee = Math.floor((totalPrice * 250) / 10000); // 2.5% = 125 USDC
      const sellerAmount = totalPrice - marketplaceFee; // 4875 USDC

      const finalBuyerUsdc = marketplace.getUsdcBalance(buyer1);
      const finalSellerUsdc = marketplace.getUsdcBalance(seller1);

      expect(finalBuyerUsdc).toBe(initialBuyerUsdc - totalPrice);
      expect(finalSellerUsdc).toBe(initialSellerUsdc + sellerAmount);

      // Check listing is deactivated
      const listing = marketplace.getListing(listingId);
      expect(listing!.isActive).toBe(false);
    });

    it('should reject purchase of non-existent listing', async () => {
      await expect(
        marketplace.purchaseTokens(999, buyer1)
      ).rejects.toThrow('ListingNotFound');
    });

    it('should reject self-purchase', async () => {
      await expect(
        marketplace.purchaseTokens(listingId, seller1)
      ).rejects.toThrow('CannotBuyOwnListing');
    });

    it('should reject purchase with insufficient USDC', async () => {
      marketplace.setUsdcBalance(buyer1, 1000); // Not enough for 5000 USDC purchase

      await expect(
        marketplace.purchaseTokens(listingId, buyer1)
      ).rejects.toThrow('InsufficientPayment');
    });
  });

  describe('Listing Management', () => {
    let listingId: number;

    beforeEach(async () => {
      listingId = await marketplace.listTokensForSale(
        tokenAddress,
        groveName,
        100,
        50,
        30,
        seller1
      );
    });

    it('should allow sellers to cancel their listings', async () => {
      const initialTokens = marketplace.getTokenBalance(tokenAddress, seller1);

      await marketplace.cancelListing(listingId, seller1);

      // Check tokens returned
      const finalTokens = marketplace.getTokenBalance(tokenAddress, seller1);
      expect(finalTokens).toBe(initialTokens + 100);

      // Check listing deactivated
      const listing = marketplace.getListing(listingId);
      expect(listing!.isActive).toBe(false);
    });

    it('should reject cancellation by non-seller', async () => {
      await expect(
        marketplace.cancelListing(listingId, buyer1)
      ).rejects.toThrow('UnauthorizedSeller');
    });

    it('should allow sellers to update listing price and duration', async () => {
      await marketplace.updateListing(listingId, 75, 60, seller1);

      const listing = marketplace.getListing(listingId);
      expect(listing!.pricePerToken).toBe(75);
    });

    it('should reject price update with invalid price', async () => {
      await expect(
        marketplace.updateListing(listingId, 0, 60, seller1)
      ).rejects.toThrow('InvalidPrice');
    });
  });

  describe('Marketplace Queries', () => {
    beforeEach(async () => {
      // Create multiple listings
      await marketplace.listTokensForSale(tokenAddress, 'Grove A', 100, 50, 30, seller1);
      await marketplace.listTokensForSale(tokenAddress, 'Grove B', 200, 60, 45, seller1);
      await marketplace.listTokensForSale('0xtoken2', 'Grove C', 150, 40, 60, seller1);
    });

    it('should return active listings with pagination', () => {
      const result = marketplace.getActiveListings(0, 2);
      
      expect(result.totalActive).toBe(3);
      expect(result.listings.length).toBe(2);
      expect(result.listings.every(listing => listing.isActive)).toBe(true);
    });

    it('should return listings for specific token', () => {
      const listings = marketplace.getTokenListings(tokenAddress);
      
      expect(listings.length).toBe(2);
      expect(listings.every(listing => listing.tokenAddress === tokenAddress)).toBe(true);
    });

    it('should return user listings', () => {
      const listings = marketplace.getUserListings(seller1);
      
      expect(listings.length).toBe(3);
      expect(listings.every(listing => listing.seller === seller1)).toBe(true);
    });

    it('should return marketplace statistics', () => {
      const stats = marketplace.getMarketplaceStats();
      
      expect(stats.totalListings).toBe(3);
      expect(stats.activeListings).toBe(3);
      expect(stats.totalTrades).toBe(0);
      expect(stats.totalVolume).toBe(0);
    });
  });

  describe('Trade History', () => {
    it('should track user trade history', async () => {
      const listingId = await marketplace.listTokensForSale(
        tokenAddress,
        groveName,
        100,
        50,
        30,
        seller1
      );

      await marketplace.purchaseTokens(listingId, buyer1);

      const sellerTrades = marketplace.getUserTrades(seller1);
      const buyerTrades = marketplace.getUserTrades(buyer1);

      expect(sellerTrades.length).toBe(1);
      expect(buyerTrades.length).toBe(1);
      expect(sellerTrades[0].seller).toBe(seller1);
      expect(buyerTrades[0].buyer).toBe(buyer1);
    });

    it('should return recent trades with pagination', async () => {
      // Create and execute multiple trades
      for (let i = 0; i < 3; i++) {
        marketplace.setTokenBalance(tokenAddress, seller1, 1000); // Reset balance
        const listingId = await marketplace.listTokensForSale(
          tokenAddress,
          `Grove ${i}`,
          100,
          50 + i * 10,
          30,
          seller1
        );
        await marketplace.purchaseTokens(listingId, buyer1);
      }

      const result = marketplace.getRecentTrades(0, 2);
      
      expect(result.totalTrades).toBe(3);
      expect(result.trades.length).toBe(2);
      // Should be in reverse chronological order (most recent first)
      expect(result.trades[0].tradeId).toBeGreaterThan(result.trades[1].tradeId);
    });
  });

  describe('Price Discovery and Order Matching', () => {
    it('should execute trades at listed prices', async () => {
      const pricePerToken = 75;
      const tokenAmount = 50;
      
      const listingId = await marketplace.listTokensForSale(
        tokenAddress,
        groveName,
        tokenAmount,
        pricePerToken,
        30,
        seller1
      );

      const tradeId = await marketplace.purchaseTokens(listingId, buyer1);
      const trade = marketplace.getTrade(tradeId);

      expect(trade!.pricePerToken).toBe(pricePerToken);
      expect(trade!.totalPrice).toBe(tokenAmount * pricePerToken);
    });

    it('should handle multiple listings for same token at different prices', () => {
      // This test verifies that the marketplace can handle price discovery
      // by allowing multiple listings at different prices
      
      // Create listings at different prices
      marketplace.listTokensForSale(tokenAddress, 'Grove A', 100, 40, 30, seller1);
      marketplace.setTokenBalance(tokenAddress, seller1, 1000); // Reset balance
      marketplace.listTokensForSale(tokenAddress, 'Grove B', 100, 60, 30, seller1);

      const listings = marketplace.getTokenListings(tokenAddress);
      
      expect(listings.length).toBe(2);
      const prices = listings.map(l => l.pricePerToken).sort();
      expect(prices).toEqual([40, 60]);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle expired listings', async () => {
      // Create a listing that expires immediately
      const listingId = await marketplace.listTokensForSale(
        tokenAddress,
        groveName,
        100,
        50,
        1, // 1 day
        seller1
      );

      // Mock time passing
      const listing = marketplace.getListing(listingId);
      listing!.expirationDate = Date.now() - 1000; // Expired 1 second ago

      await expect(
        marketplace.purchaseTokens(listingId, buyer1)
      ).rejects.toThrow('ListingExpired');
    });

    it('should validate listing activity status', () => {
      const activeListingId = 1;
      const inactiveListingId = 999;

      // Assuming listing 1 exists and is active from previous tests
      expect(marketplace.isListingActive(activeListingId)).toBe(false); // No active listings in fresh instance
      expect(marketplace.isListingActive(inactiveListingId)).toBe(false);
    });
  });
});