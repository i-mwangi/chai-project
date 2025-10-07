# Hedera Testnet Setup Guide

This guide will help you set up and test the Coffee Platform on Hedera testnet.

---

## Prerequisites

Before you begin, you'll need:

1. **Hedera Testnet Account**
   - Create a free account at: https://portal.hedera.com/register
   - You'll receive testnet HBAR for testing

2. **HashPack Wallet** (Recommended)
   - Download from: https://www.hashpack.app/
   - Create a wallet and switch to testnet mode

3. **Node.js and pnpm**
   - Node.js 14+ installed
   - pnpm package manager

---

## Step 1: Get Hedera Testnet Credentials

### Option A: Using Hedera Portal (Recommended)

1. Go to https://portal.hedera.com/
2. Sign in or create an account
3. Navigate to "Testnet Access"
4. Copy your:
   - **Account ID** (format: 0.0.xxxxx)
   - **Private Key** (starts with 302e...)
   - **Public Key**

### Option B: Using HashPack Wallet

1. Open HashPack wallet
2. Switch to "Testnet" network
3. Create or import an account
4. Note your Account ID
5. Export your private key (Settings → Security → Export Private Key)

---

## Step 2: Get Testnet HBAR

You'll need testnet HBAR for transaction fees:

1. Visit the Hedera Faucet: https://portal.hedera.com/faucet
2. Enter your testnet Account ID
3. Request testnet HBAR (you'll receive ~10,000 test HBAR)
4. Wait 1-2 minutes for the transfer to complete

---

## Step 3: Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   copy .env.example .env
   ```

2. **Edit the `.env` file** with your testnet credentials:

```bash
# ============================================
# Hedera Network Configuration
# ============================================
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=your-private-key-here

# ============================================
# Smart Contract Addresses (Deploy these first)
# ============================================
# Leave these empty for now - we'll deploy contracts next
USDC_TOKEN_ID=
ISSUER_CONTRACT_ID=
LENDER_CONTRACT_ID=
PRICE_ORACLE_CONTRACT_ID=
REVENUE_RESERVE_CONTRACT_ID=
TREE_MANAGER_CONTRACT_ID=
MARKETPLACE_CONTRACT_ID=

# ============================================
# Admin Configuration
# ============================================
ADMIN_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
ADMIN_TOKEN=your-secure-admin-token-here

# ============================================
# Database Configuration
# ============================================
DATABASE_URL=file:./local-store/sqlite/coffee-platform.db

# ============================================
# Server Configuration
# ============================================
API_PORT=3001
FRONTEND_PORT=3000

# ============================================
# Feature Flags
# ============================================
DISABLE_INVESTOR_KYC=false
ENABLE_DEMO_BYPASS=false
```

---

## Step 4: Deploy Smart Contracts to Testnet

### Prerequisites for Contract Deployment

1. **Install Hedera SDK:**
   ```bash
   pnpm install @hashgraph/sdk
   ```

2. **Compile Contracts:**
   ```bash
   # If you have Solidity contracts in the contracts/ folder
   # Compile them using your preferred method (Hardhat, Foundry, etc.)
   ```

### Deploy Contracts

You'll need to deploy the following contracts:

1. **USDC Token (or use existing testnet USDC)**
   - Testnet USDC: `0.0.429274` (if available)
   - Or create your own test token

2. **CoffeePriceOracle**
3. **CoffeeRevenueReserve**
4. **CoffeeTreeManager**
5. **CoffeeTreeIssuer**
6. **Lender**
7. **CoffeeTreeMarketplace**

### Deployment Script Example

Create a file `deploy-to-testnet.ts`:

```typescript
import {
    Client,
    PrivateKey,
    AccountId,
    ContractCreateFlow,
    FileCreateTransaction,
    FileAppendTransaction,
    Hbar
} from "@hashgraph/sdk";
import * as fs from "fs";

async function deployContracts() {
    // Initialize Hedera client
    const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID!);
    const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY!);
    
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);
    
    console.log("Deploying contracts to Hedera testnet...");
    console.log("Operator Account:", operatorId.toString());
    
    // Deploy Price Oracle
    console.log("\n1. Deploying CoffeePriceOracle...");
    const priceOracleBytecode = fs.readFileSync("./contracts/compiled/CoffeePriceOracle.bin");
    // ... deployment logic
    
    // Deploy other contracts...
    
    console.log("\n✅ All contracts deployed!");
    console.log("\nUpdate your .env file with these contract IDs:");
    console.log(`PRICE_ORACLE_CONTRACT_ID=${priceOracleId}`);
    // ... other contract IDs
}

deployContracts().catch(console.error);
```

Run deployment:
```bash
npx tsx deploy-to-testnet.ts
```

---

## Step 5: Initialize Database

1. **Run database migrations:**
   ```bash
   pnpm run migrate
   ```

2. **Verify database is created:**
   ```bash
   # Check that the SQLite database exists
   dir local-store\sqlite\coffee-platform.db
   ```

---

## Step 6: Start the Application

### Option A: Using Mock API (Quick Test)

This uses mock data and doesn't require deployed contracts:

```bash
# Start the mock API server
node frontend/api-server.js

# In another terminal, start the frontend
node frontend/server.js
```

Then open: http://localhost:3000

### Option B: Using Real Hedera API

This connects to actual Hedera testnet contracts:

```bash
# Build the TypeScript API
pnpm run build

# Start the real API server
npx tsx api/server.ts

# In another terminal, start the frontend
node frontend/server.js
```

Then open: http://localhost:3000

---

## Step 7: Connect HashPack Wallet

1. **Open the application** at http://localhost:3000
2. **Click "Connect Wallet"**
3. **Select HashPack**
4. **Approve the connection** in HashPack
5. **Ensure you're on Testnet** in HashPack settings

---

## Step 8: Test Core Features

### Test as Farmer

1. **Register a Grove:**
   - Navigate to "My Groves"
   - Click "Register New Grove"
   - Fill in grove details
   - Submit (this will create a transaction on testnet)
   - Wait for confirmation (~3-5 seconds)

2. **Report a Harvest:**
   - Go to "Report Harvest"
   - Select your grove
   - Enter harvest details
   - Submit transaction
   - Check transaction on HashScan: https://hashscan.io/testnet/

3. **Withdraw Revenue:**
   - Navigate to "Revenue"
   - View your available balance
   - Click "Withdraw"
   - Approve transaction in HashPack
   - Verify USDC received in your wallet

### Test as Investor

1. **Browse Groves:**
   - Navigate to "Marketplace"
   - View available groves
   - Click on a grove for details

2. **Purchase Tokens:**
   - Click "Invest Now"
   - Enter token amount
   - Approve USDC spending in HashPack
   - Approve token purchase transaction
   - Verify tokens in your wallet

3. **Claim Earnings:**
   - Navigate to "Earnings"
   - View pending distributions
   - Click "Claim"
   - Approve transaction
   - Verify USDC received

4. **Provide Liquidity:**
   - Navigate to "Lending"
   - Select a pool
   - Click "Provide Liquidity"
   - Enter USDC amount
   - Approve transactions
   - Receive LP tokens

5. **Take a Loan:**
   - Navigate to "Lending" → "Loans"
   - Click "Take Loan"
   - Enter loan amount
   - Approve collateral transfer
   - Approve loan transaction
   - Receive USDC

### Test as Admin

1. **Mint Tokens:**
   - Navigate to "Admin Panel"
   - Select "Token Management"
   - Choose a grove
   - Click "Mint Tokens"
   - Enter amount and approve

2. **Grant KYC:**
   - Navigate to "KYC Management"
   - Enter user address
   - Click "Grant KYC"
   - Approve transaction

---

## Step 9: Monitor Transactions

### Using HashScan (Hedera Explorer)

1. Visit: https://hashscan.io/testnet/
2. Search for your Account ID
3. View all transactions
4. Check transaction details, status, and fees

### Using Hedera Portal

1. Visit: https://portal.hedera.com/
2. Navigate to "Testnet" → "Transactions"
3. View your transaction history

---

## Step 10: Verify Smart Contract Interactions

### Check Token Balances

```typescript
import { AccountBalanceQuery } from "@hashgraph/sdk";

const balance = await new AccountBalanceQuery()
    .setAccountId(yourAccountId)
    .execute(client);

console.log("HBAR Balance:", balance.hbars.toString());
console.log("Token Balances:", balance.tokens.toString());
```

### Query Contract State

```typescript
import { ContractCallQuery } from "@hashgraph/sdk";

const result = await new ContractCallQuery()
    .setContractId(contractId)
    .setGas(100000)
    .setFunction("getPrice", new ContractFunctionParameters()
        .addString("ARABICA")
        .addUint8(8)
    )
    .execute(client);

console.log("Price:", result.getUint256(0));
```

---

## Troubleshooting

### Issue: "Insufficient Transaction Fee"

**Solution:**
- Ensure you have enough testnet HBAR
- Request more from the faucet: https://portal.hedera.com/faucet
- Typical transaction needs 0.01-0.1 HBAR

### Issue: "Invalid Account ID"

**Solution:**
- Verify your Account ID format (0.0.xxxxx)
- Ensure you're using testnet Account ID, not mainnet
- Check that the account exists on testnet

### Issue: "Contract Not Found"

**Solution:**
- Verify contract IDs in .env file
- Ensure contracts are deployed to testnet
- Check contract IDs on HashScan

### Issue: "Token Association Required"

**Solution:**
- Associate your account with the token first
- Use HashPack to associate tokens
- Or call the associate token function

### Issue: "Transaction Timeout"

**Solution:**
- Hedera testnet can be slow during high usage
- Wait 10-15 seconds and retry
- Check Hedera status: https://status.hedera.com/

### Issue: "Signature Verification Failed"

**Solution:**
- Ensure your private key matches your Account ID
- Check that you're signing with the correct key
- Verify key format (should start with 302e...)

---

## Testing Checklist

Use this checklist to verify all features work on testnet:

### Farmer Features
- [ ] Register grove (transaction confirmed)
- [ ] Report harvest (transaction confirmed)
- [ ] View revenue balance
- [ ] Withdraw revenue (USDC received)
- [ ] Update tree health
- [ ] View harvest history

### Investor Features
- [ ] Browse groves
- [ ] Purchase tokens (tokens received)
- [ ] View portfolio
- [ ] Claim earnings (USDC received)
- [ ] Provide liquidity (LP tokens received)
- [ ] Withdraw liquidity (USDC returned)
- [ ] Take loan (USDC received, collateral locked)
- [ ] Repay loan (collateral returned)
- [ ] Trade on secondary market

### Admin Features
- [ ] Mint tokens (supply increased)
- [ ] Burn tokens (supply decreased)
- [ ] Grant KYC (user approved)
- [ ] Revoke KYC (user restricted)
- [ ] View token holders
- [ ] Monitor distributions

### Integration Tests
- [ ] Harvest → Distribution → Claim flow
- [ ] Token purchase → Earnings → Claim flow
- [ ] Liquidity → Loan → Repayment flow
- [ ] Price oracle → Harvest valuation
- [ ] KYC → Token trading

---

## Cost Estimation

Typical transaction costs on Hedera testnet:

| Operation | Estimated Cost (HBAR) |
|-----------|----------------------|
| Token Transfer | 0.001 |
| Token Association | 0.05 |
| Contract Call | 0.01 - 0.1 |
| Contract Deploy | 1 - 10 |
| Token Creation | 1 |
| Account Creation | 0.05 |

**Total for full testing:** ~15-20 testnet HBAR

---

## Best Practices

1. **Always test on testnet first** before mainnet deployment
2. **Keep your private keys secure** - never commit to git
3. **Monitor transaction fees** - optimize gas usage
4. **Use HashPack for signing** - don't expose private keys in frontend
5. **Verify all transactions** on HashScan before proceeding
6. **Test error scenarios** - insufficient balance, invalid inputs, etc.
7. **Document contract addresses** - keep a record of deployed contracts
8. **Backup your database** - before major changes

---

## Moving to Mainnet

Once testing is complete on testnet:

1. **Update .env file:**
   ```bash
   HEDERA_NETWORK=mainnet
   ```

2. **Get mainnet credentials:**
   - Create mainnet account
   - Purchase real HBAR
   - Fund your account

3. **Deploy contracts to mainnet:**
   - Use the same deployment scripts
   - Update contract IDs in .env

4. **Test with small amounts first**
5. **Monitor closely for 24-48 hours**
6. **Scale up gradually**

---

## Resources

- **Hedera Documentation:** https://docs.hedera.com/
- **Hedera SDK (JavaScript):** https://github.com/hashgraph/hedera-sdk-js
- **HashScan Explorer:** https://hashscan.io/
- **Hedera Portal:** https://portal.hedera.com/
- **HashPack Wallet:** https://www.hashpack.app/
- **Hedera Discord:** https://hedera.com/discord
- **Hedera Status:** https://status.hedera.com/

---

## Support

If you encounter issues:

1. **Check Hedera Status:** https://status.hedera.com/
2. **Review Hedera Docs:** https://docs.hedera.com/
3. **Ask on Discord:** https://hedera.com/discord
4. **Check HashScan:** Verify transactions and contract state
5. **Review Application Logs:** Check console for errors

---

**Last Updated:** January 15, 2025  
**Hedera SDK Version:** 2.x  
**Network:** Testnet

---

*For production deployment, see [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)*
