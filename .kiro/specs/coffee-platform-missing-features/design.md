# Design Document

## Overview

This design document outlines the architecture and implementation approach for the missing critical features in the Chai Coffee Tree Platform frontend. The design integrates with existing smart contracts (CoffeeRevenueReserve, Lender, CoffeePriceOracle, CoffeeTreeManager) while maintaining consistency with the current frontend architecture.

The implementation will add four major feature modules:
1. **Revenue Distribution Module** - Handles investor earnings and farmer withdrawals
2. **Lending & Liquidity Module** - Manages lending pools and loan operations
3. **Advanced Pricing Module** - Integrates variety-specific and seasonal pricing
4. **Token Management Module** - Provides admin interface for token operations

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Application                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Revenue    │  │   Lending    │  │   Pricing    │      │
│  │ Distribution │  │  & Liquidity │  │    Oracle    │      │
│  │    Module    │  │    Module    │  │    Module    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────┴──────────────────┴──────────────────┴───────┐    │
│  │              API Client Layer                       │    │
│  │         (frontend/js/api.js - extended)            │    │
│  └──────────────────────────┬──────────────────────────┘    │
│                             │                                │
└─────────────────────────────┼────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   Backend API     │
                    │  (api-server.js)  │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│ CoffeeRevenue  │  │     Lender      │  │ CoffeePriceOracle│
│    Reserve     │  │   Contract      │  │    Contract      │
└────────────────┘  └─────────────────┘  └──────────────────┘
```

### Component Architecture

#### 1. Revenue Distribution Module

**Components:**
- `RevenueDistributionManager` - Core distribution logic
- `InvestorEarningsView` - UI for investor earnings display
- `FarmerWithdrawalView` - UI for farmer revenue withdrawal
- `DistributionHistoryView` - Transaction history display

**Data Flow:**
```
Harvest Reported → Calculate Distribution (70/30 split) → 
Create Distribution Record → Batch Process Token Holders → 
Transfer USDC → Update Balances → Emit Events
```

#### 2. Lending & Liquidity Module

**Components:**
- `LendingPoolManager` - Pool operations handler
- `LiquidityProvisionView` - UI for adding/removing liquidity
- `LoanManagementView` - UI for loan operations
- `PoolStatisticsView` - Pool metrics display

**Data Flow:**
```
Provide Liquidity → Transfer USDC → Mint LP Tokens → Update Pool Stats
Take Loan → Lock Collateral → Transfer USDC → Record Loan
Repay Loan → Transfer USDC → Unlock Collateral → Update Status
```

#### 3. Advanced Pricing Module

**Components:**
- `PriceOracleManager` - Price data handler
- `VarietyPricingView` - Variety-specific price display
- `SeasonalPricingView` - Seasonal multiplier display
- `PriceCalculator` - Revenue calculation utility

**Data Flow:**
```
Fetch Prices → Apply Variety Filter → Apply Grade Adjustment → 
Apply Seasonal Multiplier → Calculate Projected Revenue
```

#### 4. Token Management Module

**Components:**
- `TokenAdminPanel` - Admin interface
- `TokenOperationsView` - Mint/burn operations
- `KYCManagementView` - KYC approval interface
- `TokenHolderView` - Holder list display

## Components and Interfaces

### 1. RevenueDistributionManager Class

```javascript
class RevenueDistributionManager {
    constructor(apiClient, walletManager)
    
    // Core Methods
    async createDistribution(harvestId, totalRevenue)
    async processDistributionBatch(distributionId, holders, batchSize = 50)
    async claimEarnings(distributionId, holderAddress)
    async withdrawFarmerShare(groveId, amount, farmerAddress)
    
    // Query Methods
    async getPendingDistributions(holderAddress)
    async getDistributionHistory(holderAddress)
    async getHolderEarnings(holderAddress)
    async getFarmerBalance(farmerAddress)
    
    // Utility Methods
    calculateHolderShare(totalRevenue, tokenBalance, totalSupply)
    validateDistribution(distributionId, holders, tokenAmounts)
}
```

### 2. LendingPoolManager Class

```javascript
class LendingPoolManager {
    constructor(apiClient, walletManager)
    
    // Pool Operations
    async provideLiquidity(assetAddress, amount)
    async withdrawLiquidity(assetAddress, lpTokenAmount)
    async getLendingPools()
    async getPoolStatistics(assetAddress)
    
    // Loan Operations
    async takeOutLoan(assetAddress, loanAmount)
    async repayLoan(assetAddress)
    async getLoanDetails(borrowerAddress, assetAddress)
    async calculateLoanTerms(assetAddress, loanAmount)
    
    // Utility Methods
    calculateCollateralRequired(loanAmount, assetPrice)
    calculateLiquidationPrice(collateralAmount, loanAmount)
    checkLoanHealth(loanDetails, currentPrice)
}
```

### 3. PriceOracleManager Class

```javascript
class PriceOracleManager {
    constructor(apiClient)
    
    // Price Fetching
    async getCoffeePrices(variety, grade)
    async getSeasonalPrice(variety, grade, month)
    async getAllVarietyPrices()
    async getSeasonalMultipliers()
    
    // Price Calculations
    calculateProjectedRevenue(variety, grade, yieldKg, harvestMonth)
    validateSalePrice(variety, grade, proposedPrice)
    
    // Price Updates (Admin)
    async updateCoffeePrice(variety, grade, price)
    async updateSeasonalMultiplier(month, multiplier)
    async batchUpdatePrices(priceUpdates)
}
```

### 4. TokenAdminManager Class

```javascript
class TokenAdminManager {
    constructor(apiClient, walletManager)
    
    // Token Operations
    async mintTokens(groveId, amount)
    async burnTokens(groveId, amount)
    async getTokenSupply(groveId)
    
    // KYC Management
    async grantKYC(groveId, accountAddress)
    async revokeKYC(groveId, accountAddress)
    async checkKYCStatus(groveId, accountAddress)
    
    // Token Holder Management
    async getTokenHolders(groveId)
    async getHolderBalance(groveId, holderAddress)
}
```

## Data Models

### Distribution Record

```javascript
{
    distributionId: number,
    harvestId: string,
    groveId: string,
    groveName: string,
    totalRevenue: number,
    farmerShare: number,      // 30%
    investorShare: number,    // 70%
    distributionDate: string,
    completed: boolean,
    totalHolders: number,
    successfulTransfers: number,
    failedTransfers: number,
    holders: [
        {
            address: string,
            tokenBalance: number,
            shareAmount: number,
            claimed: boolean,
            transactionHash: string
        }
    ]
}
```

### Lending Pool

```javascript
{
    assetAddress: string,
    assetName: string,
    lpTokenAddress: string,
    totalLiquidity: number,
    availableLiquidity: number,
    totalBorrowed: number,
    utilizationRate: number,
    currentAPY: number,
    totalLPTokens: number,
    providers: [
        {
            address: string,
            lpTokenBalance: number,
            sharePercentage: number
        }
    ]
}
```

### Loan Record

```javascript
{
    loanId: string,
    borrowerAddress: string,
    assetAddress: string,
    loanAmountUSDC: number,
    collateralAmount: number,
    collateralizationRatio: number,  // 125%
    liquidationPrice: number,        // 90% of current price
    repaymentAmount: number,         // 110% of loan
    interestRate: number,
    loanDate: string,
    dueDate: string,
    status: 'active' | 'repaid' | 'liquidated',
    healthFactor: number
}
```

### Coffee Price Data

```javascript
{
    variety: 'ARABICA' | 'ROBUSTA' | 'SPECIALTY' | 'ORGANIC',
    grade: number,              // 1-10
    basePrice: number,          // USDC per kg
    lastUpdated: string,
    isActive: boolean,
    seasonalMultipliers: {
        1: number,  // January
        2: number,  // February
        // ... through 12
    }
}
```

## Error Handling

### Error Types

```javascript
class DistributionError extends Error {
    constructor(message, distributionId, failedHolders) {
        super(message);
        this.name = 'DistributionError';
        this.distributionId = distributionId;
        this.failedHolders = failedHolders;
    }
}

class LoanError extends Error {
    constructor(message, loanId, errorCode) {
        super(message);
        this.name = 'LoanError';
        this.loanId = loanId;
        this.errorCode = errorCode;
    }
}

class InsufficientBalanceError extends Error {
    constructor(required, available) {
        super(`Insufficient balance: required ${required}, available ${available}`);
        this.name = 'InsufficientBalanceError';
        this.required = required;
        this.available = available;
    }
}
```

### Error Handling Strategy

1. **Network Errors**: Retry up to 3 times with exponential backoff
2. **Validation Errors**: Display user-friendly message immediately
3. **Transaction Failures**: Log error, show transaction hash, allow retry
4. **Batch Processing Errors**: Continue with remaining items, log failures
5. **State Inconsistencies**: Refresh data from blockchain, reconcile state

## Testing Strategy

### Unit Tests

1. **RevenueDistributionManager**
   - Test distribution calculation (70/30 split)
   - Test holder share calculation
   - Test batch processing logic
   - Test error handling for failed transfers

2. **LendingPoolManager**
   - Test collateral calculation (125% ratio)
   - Test liquidation price calculation
   - Test loan health factor calculation
   - Test liquidity provision/withdrawal

3. **PriceOracleManager**
   - Test variety price fetching
   - Test seasonal multiplier application
   - Test projected revenue calculation
   - Test price validation logic

4. **TokenAdminManager**
   - Test token minting/burning
   - Test KYC grant/revoke
   - Test holder balance queries

### Integration Tests

1. **End-to-End Distribution Flow**
   - Report harvest → Calculate distribution → Process batches → Verify balances

2. **Loan Lifecycle**
   - Take loan → Check health → Repay loan → Verify collateral return

3. **Liquidity Provision**
   - Provide liquidity → Receive LP tokens → Withdraw → Verify USDC return

4. **Price Oracle Integration**
   - Fetch prices → Calculate revenue → Validate against market rates

### UI/UX Tests

1. **Responsive Design**: Test on mobile, tablet, desktop
2. **Loading States**: Verify spinners and progress indicators
3. **Error Messages**: Ensure user-friendly error display
4. **Real-time Updates**: Test balance refresh after transactions
5. **Accessibility**: Verify keyboard navigation and screen reader support

## Security Considerations

### 1. Transaction Security

- **Signature Verification**: All transactions must be signed by wallet
- **Amount Validation**: Validate all amounts before submission
- **Slippage Protection**: Implement max slippage for price-sensitive operations
- **Nonce Management**: Handle transaction nonce properly to prevent replay attacks

### 2. Data Validation

- **Input Sanitization**: Sanitize all user inputs
- **Range Checks**: Validate amounts are within acceptable ranges
- **Address Validation**: Verify Hedera account ID format
- **Price Validation**: Check prices against oracle bounds (50%-200%)

### 3. Access Control

- **Admin Functions**: Restrict token management to admin addresses
- **User Authorization**: Verify user owns tokens before operations
- **Rate Limiting**: Implement rate limits on API calls
- **Session Management**: Secure wallet connection state

### 4. Error Disclosure

- **Sensitive Data**: Never expose private keys or sensitive contract data
- **Error Messages**: Provide helpful but not exploitable error messages
- **Logging**: Log errors server-side without exposing to client

## Performance Optimization

### 1. Caching Strategy

- **Price Data**: Cache for 5 minutes
- **Balance Data**: Cache for 30 seconds
- **Distribution History**: Cache for 1 hour
- **Pool Statistics**: Cache for 2 minutes

### 2. Batch Processing

- **Distribution Batches**: Process 50 holders per transaction
- **Price Updates**: Batch multiple price updates
- **Balance Queries**: Batch multiple balance checks

### 3. Lazy Loading

- **Transaction History**: Load 20 items at a time with pagination
- **Token Holders**: Load 50 holders per page
- **Distribution Details**: Load on-demand when expanded

### 4. Optimistic UI Updates

- **Balance Updates**: Update UI immediately, confirm on-chain
- **Transaction Status**: Show pending state, update on confirmation
- **Distribution Progress**: Update progress bar in real-time

## Deployment Strategy

### Phase 1: Revenue Distribution (Week 1-2)

1. Implement RevenueDistributionManager
2. Add investor earnings view to investor portal
3. Add farmer withdrawal view to farmer dashboard
4. Integrate with CoffeeRevenueReserve contract
5. Test distribution flow end-to-end

### Phase 2: Lending & Liquidity (Week 3-4)

1. Implement LendingPoolManager
2. Add liquidity provision UI
3. Add loan management UI
4. Integrate with Lender contract
5. Test loan lifecycle

### Phase 3: Advanced Pricing (Week 5)

1. Implement PriceOracleManager
2. Update harvest reporting with variety/grade selection
3. Add seasonal pricing display
4. Integrate with CoffeePriceOracle contract
5. Test price calculations

### Phase 4: Token Management (Week 6)

1. Implement TokenAdminManager
2. Add admin panel UI
3. Add KYC management interface
4. Integrate with CoffeeTreeManager contract
5. Test token operations

### Phase 5: Integration & Testing (Week 7)

1. Integration testing across all modules
2. Performance optimization
3. Security audit
4. Bug fixes and refinements

### Phase 6: Deployment (Week 8)

1. Deploy to staging environment
2. User acceptance testing
3. Deploy to production
4. Monitor and support

## Monitoring and Maintenance

### Metrics to Track

1. **Distribution Success Rate**: % of successful transfers
2. **Average Distribution Time**: Time to complete full distribution
3. **Loan Health**: Number of loans near liquidation
4. **Pool Utilization**: Lending pool utilization rates
5. **Price Update Frequency**: How often prices are updated
6. **Transaction Failure Rate**: % of failed transactions

### Alerts

1. **Distribution Failures**: Alert if >10% of transfers fail
2. **Low Liquidity**: Alert if pool utilization >90%
3. **Loan Liquidation Risk**: Alert if loan health <1.1
4. **Stale Prices**: Alert if prices not updated in 24 hours
5. **High Error Rate**: Alert if error rate >5%

### Maintenance Tasks

1. **Weekly**: Review failed distributions and retry
2. **Weekly**: Check loan health and send warnings
3. **Daily**: Update coffee prices from market data
4. **Monthly**: Audit token supply and holder balances
5. **Quarterly**: Security review and dependency updates
