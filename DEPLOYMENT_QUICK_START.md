# Quick Start: Deploy to Hedera

## TL;DR - Fast Deployment

### 1. Configure Environment
```bash
# Edit .env file with your Hedera credentials
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=YOUR_PRIVATE_KEY
```

### 2. Deploy Everything (Windows)
```bash
deploy-all-contracts.bat
```

### 3. Update Configuration
After deployment, copy contract IDs from `shared.json` to your `.env` file.

---

## Manual Deployment (Step by Step)

### Already Compiled Contracts (Deploy First)
```bash
pnpm run deploy PriceOracle
pnpm run deploy TempUSDC
pnpm run deploy Lender
```

### Coffee Platform Contracts (Need Compilation)

**Compile:**
```bash
compile-contracts.bat
```

**Deploy:**
```bash
pnpm run deploy FarmerVerification
pnpm run deploy CoffeeTreeManager
pnpm run deploy CoffeeTreeMarketplace
pnpm run deploy CoffeeRevenueReserve
pnpm run deploy CoffeeTreeIssuer
```

---

## Which Contracts Do You Need?

### Minimum Viable Platform
For basic functionality, deploy these:
1. **PriceOracle** - Required for pricing
2. **TempUSDC** - Required for payments (testnet)
3. **CoffeeTreeIssuer** - Core platform contract

### Full Platform
For complete functionality, deploy all contracts:
1. PriceOracle
2. TempUSDC (or real USDC on mainnet)
3. FarmerVerification
4. CoffeeTreeManager
5. CoffeeTreeMarketplace
6. CoffeeRevenueReserve
7. CoffeeTreeIssuer
8. Lender (optional - for lending features)

---

## Contract Dependencies

```
Independent (deploy first):
├── PriceOracle
├── TempUSDC
├── FarmerVerification
└── Lender

Dependent (deploy after):
├── CoffeeTreeManager
├── CoffeeTreeMarketplace
├── CoffeeRevenueReserve
└── CoffeeTreeIssuer (depends on all above)
```

---

## Cost Estimate

**Testnet (Free):**
- Get test HBAR from faucet
- All deployments free

**Mainnet:**
- ~10-50 HBAR per contract
- Total: ~500-1000 HBAR for all contracts
- Plus gas for initialization

---

## Verification

Check your deployments:
```bash
# View on HashScan
https://hashscan.io/testnet/contract/0.0.YOUR_CONTRACT_ID

# Test locally
pnpm run test:e2e
```

---

## Troubleshooting

**"Insufficient gas"**
- Increase gas in `deploy.ts` (line 11)

**"Contract not found"**
- Run `compile-contracts.bat` first
- Check `abi/` folder for compiled contracts

**"Invalid operator"**
- Verify `.env` has correct HEDERA_OPERATOR_ID and KEY
- Ensure account has HBAR balance

---

## Next Steps After Deployment

1. ✅ Update `.env` with contract IDs
2. ✅ Initialize database: `pnpm run init-db`
3. ✅ Start indexers: `pnpm run index`
4. ✅ Start API: `pnpm run api`
5. ✅ Start frontend: `pnpm run frontend`
6. ✅ Test: `pnpm run test:e2e`

---

## Need Help?

- Full guide: [HEDERA_DEPLOYMENT_GUIDE.md](./HEDERA_DEPLOYMENT_GUIDE.md)
- Contract docs: [SMART_CONTRACTS.md](./SMART_CONTRACTS.md)
- Hedera docs: https://docs.hedera.com/
