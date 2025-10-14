# Hedera Integration - Quick Start

## 🚀 Setup (5 minutes)

### 1. Add to `.env`
```bash
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=your_private_key_here
ISSUER_CONTRACT_ID=0.0.CONTRACT_ID
REVENUE_RESERVE_CONTRACT_ID=0.0.CONTRACT_ID
```

### 2. Deploy Contracts
```bash
npm run deploy Issuer
# Copy the contract ID to ISSUER_CONTRACT_ID
```

### 3. Test Integration
```bash
npm run build
node dist/test-hedera-integration.js
```

## 📋 What It Does

### When Farmer Registers Grove
✅ Creates HTS token automatically  
✅ Mints 10 tokens per tree  
✅ Stores token address in database  

### When Farmer Reports Harvest (Quality ≥ 8)
✅ Mints bonus tokens (1 per 10kg)  
✅ Updates token supply on-chain  

### When Revenue is Distributed
✅ Distributes 70% to token holders  
✅ Proportional to token ownership  
✅ All on-chain via smart contract  

## 🔧 API Usage

### Register Grove
```bash
POST /api/farmer-verification/register-grove
{
  "farmerAddress": "0.0.123456",
  "groveName": "My Grove",
  "treeCount": 100,
  "location": "Costa Rica",
  "coordinates": {"lat": 9.7, "lng": -83.7},
  "coffeeVariety": "Arabica"
}
```

### Report Harvest
```bash
POST /api/harvest/report
{
  "groveName": "My Grove",
  "farmerAddress": "0.0.123456",
  "yieldKg": 500,
  "qualityGrade": 9,
  "salePricePerKg": 5.50
}
```

### Distribute Revenue
```bash
POST /api/harvest/distribute-onchain
{
  "harvestId": 1
}
```

## ✅ Verification

### Check Console Logs
```
✅ Issuer Contract initialized: 0.0.123456
🌳 Starting tokenization for grove: My Grove
✅ Token created: 0.0.789012
✅ Tokens minted successfully
✨ Grove tokenization complete!
```

### Check Database
```sql
SELECT groveName, tokenAddress, totalTokensIssued 
FROM coffee_groves 
WHERE tokenAddress IS NOT NULL;
```

### Check Hedera
Visit: `https://hashscan.io/testnet/token/0.0.YOUR_TOKEN_ID`

## ⚠️ Without Configuration

If contracts not configured:
- ✅ System still works
- ✅ Database operations succeed
- ⚠️ Hedera operations skipped
- 📝 Warnings logged

## 📚 Full Documentation

- **Setup Guide:** `HEDERA-INTEGRATION-GUIDE.md`
- **Implementation:** `HEDERA-FARMER-INTEGRATION-SUMMARY.md`
- **Complete Status:** `HEDERA-INTEGRATION-COMPLETE.md`

## 🆘 Troubleshooting

### Grove registered but no token?
→ Check `ISSUER_CONTRACT_ID` is set  
→ Verify operator account has HBAR  
→ Check console logs for errors  

### Token minting failed?
→ Verify grove has `tokenAddress`  
→ Check harvest quality grade ≥ 8  
→ Review transaction logs  

### Distribution failed?
→ Check `REVENUE_RESERVE_CONTRACT_ID`  
→ Verify contract has USDC balance  
→ Ensure harvest not already distributed  

## 🎯 Success Criteria

✅ Grove registration returns `tokenAddress`  
✅ High-quality harvest mints bonus tokens  
✅ Revenue distribution returns `transactionId`  
✅ All operations visible on HashScan  

---

**Ready to go!** Start the API server and register your first grove.
