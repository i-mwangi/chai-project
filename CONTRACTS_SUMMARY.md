# Chai Platform - Smart Contracts Summary

## Contract Overview

### ✅ Already Compiled (Ready to Deploy)

| Contract | Purpose | Dependencies | Status |
|----------|---------|--------------|--------|
| **PriceOracle** | Coffee price feeds | None | ✅ Ready |
| **TempUSDC** | Test USDC token | None | ✅ Ready |
| **KES** | Sample token | None | ✅ Ready |
| **Lender** | Lending functionality | None | ✅ Ready |

### 🔨 Need Compilation

| Contract | Purpose | Dependencies | Priority |
|----------|---------|--------------|----------|
| **FarmerVerification** | Farmer identity verification | None | 🔴 High |
| **CoffeeTreeManager** | Token management | None | 🔴 High |
| **CoffeeTreeMarketplace** | Token trading | Manager | 🟡 Medium |
| **CoffeeRevenueReserve** | Revenue distribution | Manager | 🔴 High |
| **CoffeeTreeIssuer** | Main platform contract | All above | 🔴 Critical |

## Deployment Order

```
Phase 1: Independent Contracts
├── 1. PriceOracle
├── 2. TempUSDC (testnet) or USDC (mainnet)
└── 3. Lender (optional)

Phase 2: Compile Coffee Contracts
└── Run: compile-contracts.bat

Phase 3: Coffee Platform Contracts
├── 4. FarmerVerification
├── 5. CoffeeTreeManager
├── 6. CoffeeTreeMarketplace
├── 7. CoffeeRevenueReserve
└── 8. CoffeeTreeIssuer (main)
```

## Quick Commands

### Deploy Everything
```bash
deploy-all-contracts.bat
```

### Deploy Individual Contract
```bash
pnpm run deploy ContractName
```

### Compile Coffee Contracts
```bash
compile-contracts.bat
```

### View Deployed Contracts
```bash
show-deployed-contracts.bat
```

## Contract Interactions

### CoffeeTreeIssuer (Main Contract)
```solidity
// Register a coffee grove
registerCoffeeGrove(
    string groveName,
    string location,
    uint64 treeCount,
    string coffeeVariety,
    uint64 expectedYieldPerTree
)

// Tokenize a grove
tokenizeGrove(bytes32 groveName, uint64 tokensPerTree)

// Report harvest
reportHarvest(bytes32 groveName, uint64 harvestAmount, uint64 revenue)

// Distribute revenue
distributeRevenue(bytes32 groveName)
```

### PriceOracle
```solidity
// Update coffee price (admin only)
updatePrice(address tokenId, uint64 price)

// Get current price
getPrice(address tokenId) returns (uint64)
```

### CoffeeTreeMarketplace
```solidity
// List tokens for sale
listTokens(address groveToken, uint64 amount, uint64 pricePerToken)

// Buy tokens
buyTokens(uint256 listingId, uint64 amount)

// Cancel listing
cancelListing(uint256 listingId)
```

### CoffeeRevenueReserve
```solidity
// Deposit revenue
depositRevenue(uint64 amount)

// Claim revenue share
claimRevenue(uint256 distributionId)

// Get revenue share
getRevenueShare(address holder) returns (uint64)
```

## Environment Variables Required

```env
# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT
HEDERA_OPERATOR_KEY=YOUR_PRIVATE_KEY

# Deployed Contract IDs (update after deployment)
USDC_TOKEN_ID=0.0.XXXXX
PRICE_ORACLE_CONTRACT_ID=0.0.XXXXX
ISSUER_CONTRACT_ID=0.0.XXXXX
LENDER_CONTRACT_ID=0.0.XXXXX
REVENUE_RESERVE_CONTRACT_ID=0.0.XXXXX
TREE_MANAGER_CONTRACT_ID=0.0.XXXXX
MARKETPLACE_CONTRACT_ID=0.0.XXXXX
```

## Gas Costs (Approximate)

| Operation | Gas | HBAR Cost (Testnet) |
|-----------|-----|---------------------|
| Deploy Contract | 2,000,000 | ~10-50 HBAR |
| Register Grove | 100,000 | ~0.1 HBAR |
| Tokenize Grove | 150,000 | ~0.15 HBAR |
| Transfer Tokens | 50,000 | ~0.05 HBAR |
| Report Harvest | 80,000 | ~0.08 HBAR |
| Distribute Revenue | 200,000 | ~0.2 HBAR |

## Testing

### Test Individual Contract
```bash
# After deployment, test with:
pnpm run test
```

### Test Full Platform
```bash
pnpm run test:e2e
```

### Test Specific Flow
```bash
pnpm run test:e2e:integration
```

## Monitoring

### View on HashScan
```
https://hashscan.io/testnet/contract/0.0.YOUR_CONTRACT_ID
```

### Monitor Events
```bash
# Start event indexers
pnpm run index

# Monitor specific contract
pnpm run issuer:index:events
```

## Troubleshooting

### Contract Deployment Fails
- Check HBAR balance (need ~100 HBAR for all contracts)
- Verify .env has correct credentials
- Ensure contract is compiled (check abi/ folder)

### "Insufficient Gas" Error
- Increase gas limit in deploy.ts
- Current: 2,000,000 (line 11)
- Try: 3,000,000 or higher

### Contract Not Found
- Run compile-contracts.bat first
- Check abi/ContractName.json exists
- Verify contract name matches file name

### Transaction Fails
- Check contract is deployed
- Verify contract ID in .env
- Ensure account has HBAR for gas
- Check function parameters are correct

## Security Considerations

### Before Mainnet Deployment
- [ ] Complete security audit
- [ ] Test all functions on testnet
- [ ] Verify access controls
- [ ] Test upgrade mechanisms
- [ ] Review gas optimizations
- [ ] Test edge cases
- [ ] Verify event emissions
- [ ] Test error handling

### Access Control
- Admin functions protected by modifiers
- Farmer verification required for grove registration
- Token transfers follow ERC-20 standard
- Revenue distribution requires proper authorization

## Next Steps After Deployment

1. **Initialize Contracts**
   ```bash
   pnpm run init-db
   ```

2. **Start Services**
   ```bash
   pnpm run index    # Event indexers
   pnpm run api      # API server
   pnpm run frontend # Frontend
   ```

3. **Configure Admin**
   - Set admin account in contracts
   - Configure price oracle
   - Set up farmer verification

4. **Test Platform**
   - Register test grove
   - Tokenize grove
   - Test marketplace
   - Test revenue distribution

## Resources

- [Full Deployment Guide](./HEDERA_DEPLOYMENT_GUIDE.md)
- [Quick Start](./DEPLOYMENT_QUICK_START.md)
- [Smart Contracts Docs](./SMART_CONTRACTS.md)
- [Hedera Documentation](https://docs.hedera.com/)
- [HashScan Explorer](https://hashscan.io/)
