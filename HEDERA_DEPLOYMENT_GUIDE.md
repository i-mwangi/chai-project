# Hedera Contract Deployment Guide

## Overview

This guide walks you through deploying the Chai Platform smart contracts to Hedera testnet or mainnet.

## Prerequisites

1. **Hedera Account**: Create an account on [Hedera Portal](https://portal.hedera.com/)
   - For testnet: Get free test HBAR from the faucet
   - For mainnet: Fund your account with HBAR

2. **Required Tools**:
   - Node.js and pnpm installed
   - solc compiler (already in dependencies)
   - jq (for JSON processing in compilation script)

3. **Environment Setup**: Update your `.env` file with:
   ```env
   HEDERA_NETWORK=testnet  # or mainnet
   HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
   HEDERA_OPERATOR_KEY=YOUR_PRIVATE_KEY_HERE
   ```

## Contract Architecture

The platform consists of these contracts:

### Core Contracts (Already Compiled)
- **PriceOracle** - Coffee price feeds (independent)
- **Lender** - Lending functionality (independent)
- **KES** - Sample token contract (independent)
- **TempUSDC** - Test USDC token for testnet (independent)

### Coffee Platform Contracts (Need Compilation)
- **FarmerVerification** - Farmer identity verification
- **CoffeeTreeManager** - Token management
- **CoffeeTreeMarketplace** - Token trading
- **CoffeeRevenueReserve** - Revenue distribution
- **CoffeeTreeIssuer** - Main contract (depends on all above)

## Deployment Steps

### Step 1: Deploy Independent Contracts

These contracts have no dependencies and can be deployed first:

```bash
# Deploy Price Oracle
pnpm run deploy PriceOracle

# Deploy test USDC (testnet only)
pnpm run deploy TempUSDC

# Deploy KES token (if needed)
pnpm run deploy KES

# Deploy Lender contract
pnpm run deploy Lender
```

After each deployment, note the contract ID (format: `0.0.XXXXX`) and update your `.env` file:

```env
PRICE_ORACLE_CONTRACT_ID=0.0.XXXXX
USDC_TOKEN_ID=0.0.XXXXX
# ... etc
```

### Step 2: Compile Coffee Platform Contracts

The coffee-specific contracts need to be compiled before deployment. On Windows, you'll need to adapt the bash script or compile manually.

#### Option A: Manual Compilation (Windows-friendly)

```bash
# Install solc globally if not available
npm install -g solc

# Compile each contract
solc --optimize --combined-json abi,bin contracts/FarmerVerification.sol > abi/FarmerVerification.json
solc --optimize --combined-json abi,bin contracts/CoffeeTreeManager.sol > abi/CoffeeTreeManager.json
solc --optimize --combined-json abi,bin contracts/CoffeeTreeMarketplace.sol > abi/CoffeeTreeMarketplace.json
solc --optimize --combined-json abi,bin contracts/CoffeeRevenueReserve.sol > abi/CoffeeRevenueReserve.json
solc --optimize --combined-json abi,bin contracts/CoffeeTreeIssuer.sol > abi/CoffeeTreeIssuer.json
```

Note: You'll need to extract the specific contract from the combined JSON output.

#### Option B: Use the Bash Script (Git Bash/WSL)

```bash
# Make script executable
chmod +x scripts/msol

# Compile contracts
./scripts/msol FarmerVerification
./scripts/msol CoffeeTreeManager
./scripts/msol CoffeeTreeMarketplace
./scripts/msol CoffeeRevenueReserve
./scripts/msol CoffeeTreeIssuer
```

### Step 3: Deploy Coffee Platform Contracts

Deploy in this order due to dependencies:

```bash
# 1. Deploy Farmer Verification (independent)
pnpm run deploy FarmerVerification

# 2. Deploy Coffee Tree Manager
pnpm run deploy CoffeeTreeManager

# 3. Deploy Coffee Tree Marketplace
pnpm run deploy CoffeeTreeMarketplace

# 4. Deploy Coffee Revenue Reserve
pnpm run deploy CoffeeRevenueReserve

# 5. Deploy Coffee Tree Issuer (main contract)
pnpm run deploy CoffeeTreeIssuer
```

### Step 4: Update Configuration

After all deployments, update your `.env` file with all contract IDs:

```env
# Smart Contract Addresses
USDC_TOKEN_ID=0.0.XXXXX
ISSUER_CONTRACT_ID=0.0.XXXXX
LENDER_CONTRACT_ID=0.0.XXXXX
PRICE_ORACLE_CONTRACT_ID=0.0.XXXXX
REVENUE_RESERVE_CONTRACT_ID=0.0.XXXXX
TREE_MANAGER_CONTRACT_ID=0.0.XXXXX
MARKETPLACE_CONTRACT_ID=0.0.XXXXX
```

### Step 5: Initialize Contracts

Some contracts may need initialization:

```bash
# Initialize the database with contract addresses
pnpm run init-db

# Start the indexers to listen for contract events
pnpm run index
```

## Verification

After deployment, verify your contracts:

1. **Check on HashScan**: Visit `https://hashscan.io/testnet/contract/0.0.YOUR_CONTRACT_ID`
2. **Test basic functions**: Use the frontend or API to interact with contracts
3. **Monitor events**: Run the indexers to ensure events are being captured

```bash
# Test the setup
pnpm run test:e2e
```

## Deployment Costs

Approximate costs on Hedera testnet (free test HBAR):
- Contract deployment: ~10-50 HBAR per contract
- Contract execution: ~0.001-0.1 HBAR per transaction

For mainnet, ensure you have sufficient HBAR balance.

## Troubleshooting

### Common Issues

**"Insufficient gas" error**:
- Increase gas limit in `deploy.ts` (currently set to 2,000,000)

**"Contract bytecode too large"**:
- Enable optimization in solc compilation
- Split large contracts into smaller modules

**"Invalid contract ID"**:
- Ensure contract deployed successfully
- Check HashScan for deployment status
- Verify contract ID format (0.0.XXXXX)

**Compilation errors**:
- Ensure all dependencies are in `contracts/` folder
- Check Solidity version compatibility (0.8.29)
- Verify import paths in contract files

## Mainnet Deployment

When ready for mainnet:

1. Update `.env`:
   ```env
   HEDERA_NETWORK=mainnet
   HEDERA_OPERATOR_ID=0.0.YOUR_MAINNET_ACCOUNT
   HEDERA_OPERATOR_KEY=YOUR_MAINNET_PRIVATE_KEY
   ```

2. Fund your account with sufficient HBAR (estimate 500-1000 HBAR for all contracts)

3. Deploy using the same steps as testnet

4. **Important**: Test thoroughly on testnet before mainnet deployment!

## Next Steps

After deployment:

1. Configure the frontend with contract addresses
2. Set up the API server with contract integration
3. Initialize price oracle with coffee prices
4. Configure admin accounts and permissions
5. Test the complete flow: registration → tokenization → trading → revenue distribution

## Resources

- [Hedera Documentation](https://docs.hedera.com/)
- [Hedera Smart Contracts Guide](https://docs.hedera.com/hedera/sdks-and-apis/sdks/smart-contracts)
- [HashScan Explorer](https://hashscan.io/)
- [Hedera Portal](https://portal.hedera.com/)

## Support

For issues or questions:
- Check the [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) documentation
- Review contract code in `contracts/` folder
- Test with the provided test suite
