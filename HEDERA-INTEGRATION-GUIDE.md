# Hedera Integration Guide for Farmers

This guide explains how the Chai Coffee platform integrates with Hedera blockchain for farmer operations.

## Overview

The platform now automatically connects farmer operations to Hedera smart contracts:

1. **Grove Tokenization** - Creates HTS tokens when groves are registered
2. **Token Minting** - Mints bonus tokens for high-quality harvests
3. **Revenue Distribution** - Distributes harvest revenue on-chain to token holders

## Setup Requirements

### Environment Variables

Add these to your `.env` file:

```bash
# Hedera Network Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=your_private_key_here

# Smart Contract Addresses
ISSUER_CONTRACT_ID=0.0.CONTRACT_ID
REVENUE_RESERVE_CONTRACT_ID=0.0.CONTRACT_ID
TREE_MANAGER_CONTRACT_ID=0.0.CONTRACT_ID
```

### Contract Deployment

Before using the integration, deploy the required smart contracts:

```bash
# Deploy the Issuer contract
npm run deploy Issuer

# Deploy the Lender contract (for lending pools)
npm run deploy Lender
```

## Features

### 1. Grove Tokenization

**What happens:** When a farmer registers a grove, the system automatically:
- Creates an HTS token representing grove ownership
- Deploys a CoffeeTreeManager contract for the grove
- Deploys a CoffeeRevenueReserve contract for distributions
- Mints initial token supply (10 tokens per tree by default)
- Stores token address in the database

**API Endpoint:** `POST /api/farmer-verification/register-grove`

**Request:**
```json
{
  "farmerAddress": "0.0.123456",
  "groveName": "Sunrise Valley Grove",
  "location": "Costa Rica, Central Valley",
  "coordinates": {
    "lat": 9.7489,
    "lng": -83.7534
  },
  "treeCount": 150,
  "coffeeVariety": "Arabica",
  "expectedYieldPerTree": 4.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Grove registered successfully",
  "data": {
    "groveId": 1,
    "groveName": "Sunrise Valley Grove",
    "farmerAddress": "0.0.123456",
    "registrationDate": "2025-01-10T12:00:00.000Z",
    "tokenization": {
      "success": true,
      "tokenAddress": "0.0.789012",
      "totalTokensIssued": 1500
    }
  }
}
```

**Database Updates:**
- `tokenAddress` - HTS token address
- `totalTokensIssued` - Initial token supply
- `tokensPerTree` - Tokens per tree (default: 10)

### 2. Token Minting for Harvests

**What happens:** When a farmer reports a high-quality harvest (grade ≥ 8), the system:
- Calculates bonus tokens (1 token per 10kg of harvest)
- Mints additional tokens on-chain
- Updates the total token supply in the database

**API Endpoint:** `POST /api/harvest/report`

**Request:**
```json
{
  "groveName": "Sunrise Valley Grove",
  "farmerAddress": "0.0.123456",
  "yieldKg": 500,
  "qualityGrade": 9,
  "salePricePerKg": 5.50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Harvest reported successfully",
  "data": {
    "harvestId": 1,
    "groveName": "Sunrise Valley Grove",
    "yieldKg": 500,
    "qualityGrade": 9,
    "totalRevenue": 2750,
    "farmerShare": 825,
    "investorShare": 1925,
    "harvestDate": "2025-01-10T12:00:00.000Z",
    "tokenMinting": {
      "success": true
    }
  }
}
```

**Token Calculation:**
- Quality grade ≥ 8: Bonus tokens = yieldKg / 10
- Example: 500kg harvest = 50 bonus tokens minted

### 3. Revenue Distribution

**What happens:** Revenue is distributed on-chain to token holders:
- Calls the RevenueReserveContract
- Distributes 70% of harvest revenue to investors
- Proportional to token holdings
- Records transaction hash in database

**API Endpoint:** `POST /api/harvest/distribute-onchain`

**Request:**
```json
{
  "harvestId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Revenue distributed on-chain successfully",
  "data": {
    "harvestId": 1,
    "transactionId": "0.0.123456@1234567890.123456789"
  }
}
```

**Smart Contract Flow:**
1. Calls `RevenueReserveContract.distributeRevenue(tokenAddress, investorShare)`
2. Contract distributes USDC to all token holders
3. Distribution is proportional to token holdings
4. Transaction hash is stored in `harvest_records.transactionHash`

## Integration Status

### ✅ Implemented

- Grove tokenization service
- Issuer contract wrapper
- Token minting for harvests
- Revenue distribution on-chain
- Database schema updates
- API endpoints

### ⚠️ Configuration Required

To enable Hedera integration:

1. Set environment variables (see above)
2. Deploy smart contracts
3. Fund operator account with HBAR
4. Test on Hedera testnet first

### 🔄 Graceful Degradation

If Hedera is not configured:
- Groves are still registered in the database
- `tokenAddress` field remains null
- System logs warnings but continues to function
- All database operations work normally

## Testing

### Test Grove Registration with Tokenization

```bash
# Start the API server
npm run api

# Register a grove (will tokenize if configured)
curl -X POST http://localhost:3001/api/farmer-verification/register-grove \
  -H "Content-Type: application/json" \
  -d '{
    "farmerAddress": "0.0.123456",
    "groveName": "Test Grove",
    "location": "Test Location",
    "coordinates": {"lat": 0, "lng": 0},
    "treeCount": 100,
    "coffeeVariety": "Arabica",
    "expectedYieldPerTree": 5
  }'
```

### Test Harvest with Token Minting

```bash
# Report a high-quality harvest
curl -X POST http://localhost:3001/api/harvest/report \
  -H "Content-Type: application/json" \
  -d '{
    "groveName": "Test Grove",
    "farmerAddress": "0.0.123456",
    "yieldKg": 500,
    "qualityGrade": 9,
    "salePricePerKg": 5.50
  }'
```

### Test Revenue Distribution

```bash
# Distribute revenue on-chain
curl -X POST http://localhost:3001/api/harvest/distribute-onchain \
  -H "Content-Type: application/json" \
  -d '{
    "harvestId": 1
  }'
```

## Monitoring

Check the console logs for integration status:

```
✅ Issuer Contract initialized: 0.0.123456
🌳 Starting tokenization for grove: Test Grove
📝 Step 1: Creating HTS token (TESGT)...
✅ Token created: 0.0.789012
🪙 Step 2: Minting 1000 tokens...
✅ Tokens minted successfully
💾 Step 4: Updating database...
✅ Database updated
✨ Grove tokenization complete!
```

## Troubleshooting

### Grove registered but not tokenized

**Symptom:** `tokenAddress` is null in database

**Causes:**
- `ISSUER_CONTRACT_ID` not set in environment
- Hedera client not configured
- Insufficient HBAR balance
- Contract not deployed

**Solution:**
1. Check environment variables
2. Verify contract deployment
3. Check operator account balance
4. Review console logs for errors

### Token minting failed

**Symptom:** Harvest reported but tokens not minted

**Causes:**
- Grove not tokenized (no `tokenAddress`)
- Quality grade < 8 (no bonus tokens)
- Contract execution failed

**Solution:**
1. Verify grove has `tokenAddress`
2. Check harvest quality grade
3. Review transaction logs

### Revenue distribution failed

**Symptom:** Distribution endpoint returns error

**Causes:**
- `REVENUE_RESERVE_CONTRACT_ID` not set
- Grove not tokenized
- Harvest already distributed
- Insufficient contract balance

**Solution:**
1. Check environment variables
2. Verify grove tokenization
3. Check harvest status
4. Ensure contract has USDC balance

## Architecture

```
Farmer Registration
       ↓
  Database Insert
       ↓
  Tokenization Service
       ↓
  Issuer Contract
       ↓
  HTS Token Created
       ↓
  Database Updated

Harvest Report
       ↓
  Database Insert
       ↓
  Token Minting Service
       ↓
  Issuer Contract
       ↓
  Bonus Tokens Minted

Revenue Distribution
       ↓
  Distribution Service
       ↓
  Revenue Reserve Contract
       ↓
  USDC Distributed to Holders
       ↓
  Database Updated
```

## Next Steps

1. **Deploy Contracts:** Deploy Issuer and Revenue Reserve contracts to Hedera testnet
2. **Configure Environment:** Set contract IDs in `.env`
3. **Test Integration:** Register test groves and verify tokenization
4. **Monitor Transactions:** Use HashScan to verify on-chain operations
5. **Production Deployment:** Deploy to mainnet when ready

## Support

For issues or questions:
- Check console logs for detailed error messages
- Verify environment configuration
- Review Hedera transaction on HashScan
- Ensure sufficient HBAR balance for gas fees
