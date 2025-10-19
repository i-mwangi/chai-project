# Smart Contracts Documentation

This document provides comprehensive information about the smart contracts that power the Chai Platform on the Hedera network.

## 📋 Overview

The Chai Platform smart contracts are written in Solidity and deployed on the Hedera network. These contracts handle core platform functionality including:

- Coffee grove registration and tokenization
- Token management and transfers
- Revenue distribution to token holders
- Marketplace for token trading
- Farmer and investor verification
- Price oracle integration

## 🏗️ Contract Architecture

```
Core Contracts
├── CoffeeTreeIssuer.sol      # Grove registration and tokenization
├── CoffeeTreeManager.sol     # Token management and transfers
├── CoffeeTreeMarketplace.sol # Token trading marketplace
├── CoffeeRevenueReserve.sol  # Revenue distribution
├── PriceOracle.sol           # Coffee price feeds
└── FarmerVerification.sol    # Farmer identity verification

Utility Contracts
├── KES.sol                   # Sample token contract
├── Lender.sol                # Lending functionality
└── system-contracts/         # Hedera system contracts
```

## 🎯 Core Contracts

### CoffeeTreeIssuer.sol

The main contract for registering coffee groves and tokenizing them.

**Key Functions:**
- `registerCoffeeGrove()` - Register a new coffee grove
- `tokenizeGrove()` - Create tokens for a registered grove
- `reportHarvest()` - Report harvest data and revenue
- `distributeRevenue()` - Distribute revenue to token holders

**Events:**
- `CoffeeGroveRegistered`
- `CoffeeGroveTokenized`
- `HarvestReported`
- `RevenueDistributed`

### CoffeeTreeManager.sol

Manages token operations for coffee tree tokens.

**Key Functions:**
- `transfer()` - Transfer tokens between accounts
- `approve()` - Approve token spending
- `transferFrom()` - Transfer tokens on behalf of another account
- `balanceOf()` - Get token balance for an account

### CoffeeTreeMarketplace.sol

Enables trading of coffee tree tokens.

**Key Functions:**
- `listTokens()` - List tokens for sale
- `buyTokens()` - Purchase listed tokens
- `cancelListing()` - Cancel a token listing
- `updatePrice()` - Update listing price

### CoffeeRevenueReserve.sol

Handles revenue distribution from coffee sales to token holders.

**Key Functions:**
- `depositRevenue()` - Deposit revenue for distribution
- `claimRevenue()` - Claim revenue share for token holdings
- `getRevenueShare()` - Calculate revenue share for an account

### PriceOracle.sol

Provides coffee price feeds for the platform.

**Key Functions:**
- `updatePrice()` - Update coffee price (admin only)
- `getPrice()` - Get current coffee price
- `getHistoricalPrice()` - Get historical price data

### FarmerVerification.sol

Manages farmer identity verification process.

**Key Functions:**
- `submitVerification()` - Submit verification request
- `approveFarmer()` - Approve farmer verification (admin only)
- `rejectFarmer()` - Reject farmer verification (admin only)
- `isVerifiedFarmer()` - Check if farmer is verified

## 🛠️ Development

### Prerequisites

- Solidity 0.8.29
- Hedera Solidity SDK
- Hardhat or Foundry (depending on setup)

### Compilation

```bash
# Compile contracts
# (Uses Hardhat or Foundry depending on configuration)
```

### Deployment

```bash
# Deploy to Hedera Testnet
pnpm run deploy
```

### Testing

```bash
# Run contract tests
pnpm run test:contracts
```

## 🔧 Contract Addresses

After deployment, update your `.env` file with the deployed contract addresses:

```env
USDC_TOKEN_ID=0.0.11111
ISSUER_CONTRACT_ID=0.0.22222
LENDER_CONTRACT_ID=0.0.33333
PRICE_ORACLE_CONTRACT_ID=0.0.44444
REVENUE_RESERVE_CONTRACT_ID=0.0.55555
TREE_MANAGER_CONTRACT_ID=0.0.66666
MARKETPLACE_CONTRACT_ID=0.0.77777
```

## 📡 Integration Patterns

### Frontend Integration

```javascript
// Connect to contract
const contract = new ethers.Contract(
  ISSUER_CONTRACT_ID,
  issuerAbi,
  signer
);

// Register a coffee grove
await contract.registerCoffeeGrove(
  groveName,
  location,
  treeCount,
  coffeeVariety,
  expectedYieldPerTree
);
```

### API Integration

```typescript
// API service for contract interaction
class CoffeeTreeService {
  async registerGrove(data: GroveRegistrationData) {
    const contract = this.getContract('issuer');
    return await contract.registerCoffeeGrove(
      data.groveName,
      data.location,
      data.treeCount,
      data.coffeeVariety,
      data.expectedYieldPerTree
    );
  }
}
```

## 🔒 Security Considerations

### Best Practices

1. **Access Control** - Use proper modifiers for function access
2. **Input Validation** - Validate all inputs to prevent exploits
3. **Gas Optimization** - Optimize for gas efficiency
4. **Event Logging** - Log important events for transparency
5. **Upgrade Patterns** - Use upgradeable patterns for long-term maintenance

### Common Vulnerabilities

- Reentrancy attacks
- Integer overflow/underflow
- Access control issues
- Gas limit problems
- Front-running attacks

### Audit Recommendations

- Regular security audits
- Code review processes
- Automated testing
- Formal verification where possible

## 🔄 Upgradeability

The contracts follow upgradeable patterns where appropriate:

### Proxy Pattern
```solidity
// Implementation contract
contract CoffeeTreeIssuerImplementation {
    // Contract logic
}

// Proxy contract
contract CoffeeTreeIssuerProxy {
    // Delegates calls to implementation
}
```

### Migration Process
1. Deploy new implementation
2. Update proxy to point to new implementation
3. Verify functionality
4. Monitor for issues

## 📊 Gas Optimization

### Techniques Used

1. **Storage Optimization** - Efficient data structures
2. **Function Modifiers** - Reduce redundant checks
3. **Batch Operations** - Combine multiple operations
4. **Event Data** - Optimize event logging

### Gas Cost Analysis

Regular monitoring of gas costs for common operations:
- Grove registration
- Token transfers
- Revenue distribution
- Marketplace transactions

## 🧪 Testing

### Unit Tests

```solidity
// Test contract registration
function testRegisterGrove() public {
    // Arrange
    string memory groveName = "Test Grove";
    
    // Act
    issuer.registerCoffeeGrove(
        groveName,
        "Test Location",
        100,
        "Arabica",
        5
    );
    
    // Assert
    CoffeeTreeIssuer.CoffeeGrove memory grove = issuer.coffeeGroves(groveName);
    assertEq(grove.treeCount, 100);
}
```

### Integration Tests

```typescript
// Test end-to-end flow
describe("Coffee Grove Tokenization", () => {
  it("should register and tokenize a grove", async () => {
    // Register grove
    await issuer.registerCoffeeGrove(...);
    
    // Tokenize grove
    await issuer.tokenizeGrove(...);
    
    // Verify tokenization
    expect(await manager.totalSupply()).toBeGreaterThan(0);
  });
});
```

## 📈 Monitoring

### Event Monitoring

All important actions emit events for monitoring:

```solidity
event CoffeeGroveRegistered(
    bytes32 indexed groveName, 
    address indexed farmer, 
    uint64 treeCount,
    string location,
    string coffeeVariety
);
```

### Analytics

- Transaction volume tracking
- User adoption metrics
- Revenue distribution analysis
- Market activity monitoring

## 📚 Resources

- [Hedera Smart Contract Documentation](https://docs.hedera.com/hedera/sdks-and-apis/sdks/smart-contracts)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hedera Improvement Proposals](https://hips.hedera.com/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/)

## 🆘 Support

For issues or questions:
1. Check existing [GitHub Issues](https://github.com/your-username/chai-platform/issues)
2. Review Hedera documentation
3. Contact the development team
4. Join the Hedera community on [Discord](https://hedera.com/discord)