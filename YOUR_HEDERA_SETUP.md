# Your Hedera Testnet Setup

## ✅ Configuration Complete!

Your Hedera testnet credentials have been configured in the `.env` file.

### Your Account Details

- **Account ID:** `0.0.6967933`
- **Key Type:** ECDSA
- **Network:** Hedera Testnet
- **Private Key:** Configured in `.env` (keep this secure!)

---

## 🚀 Quick Start

### Step 1: Test Your Connection

Run this command to verify your Hedera connection:

```bash
test-connection.bat
```

This will:
- ✅ Verify your credentials
- ✅ Check your HBAR balance
- ✅ Confirm connection to testnet
- ⚠️ Warn if you need more HBAR

### Step 2: Get Testnet HBAR (If Needed)

If you need testnet HBAR for transaction fees:

1. Visit: https://portal.hedera.com/faucet
2. Enter your Account ID: `0.0.6967933`
3. Request testnet HBAR
4. Wait 1-2 minutes for the transfer

You'll receive ~10,000 testnet HBAR (free for testing).

### Step 3: Start the Application

**Option A - Quick Demo (Mock Data):**
```bash
start-demo.bat
```
- Uses mock API (no real blockchain transactions)
- Perfect for UI testing
- No HBAR needed

**Option B - Real Hedera Testnet:**
```bash
start-hedera-testnet.bat
```
- Connects to real Hedera testnet
- Real blockchain transactions
- Requires HBAR for fees

### Step 4: Connect HashPack Wallet

1. **Install HashPack:**
   - Download: https://www.hashpack.app/
   - Install browser extension

2. **Import Your Account:**
   - Open HashPack
   - Click "Import Account"
   - Select "Private Key"
   - Paste your private key: `66ac8ab2af006386f857dc40b4288369eaa331ec7a15ed1dd263a6d2b720c56a`
   - Set a password

3. **Switch to Testnet:**
   - Open HashPack settings
   - Select "Network"
   - Choose "Testnet"

4. **Connect to Application:**
   - Open http://localhost:3000
   - Click "Connect Wallet"
   - Select HashPack
   - Approve connection

---

## 🧪 What You Can Test

### As a Farmer

1. **Register a Coffee Grove**
   - Navigate to "My Groves"
   - Click "Register New Grove"
   - Fill in details (location, trees, variety)
   - Submit transaction
   - Cost: ~0.1 HBAR

2. **Report a Harvest**
   - Go to "Report Harvest"
   - Select your grove
   - Enter yield and quality
   - System calculates revenue
   - Submit transaction
   - Cost: ~0.05 HBAR

3. **Withdraw Revenue**
   - Navigate to "Revenue"
   - View your balance (30% of harvest revenue)
   - Click "Withdraw"
   - Approve transaction
   - Receive USDC
   - Cost: ~0.01 HBAR

### As an Investor

1. **Purchase Grove Tokens**
   - Browse "Marketplace"
   - Select a grove
   - Click "Invest Now"
   - Enter token amount
   - Approve USDC spending
   - Approve token purchase
   - Cost: ~0.05 HBAR + token price

2. **Claim Earnings**
   - Navigate to "Earnings"
   - View pending distributions
   - Click "Claim"
   - Approve transaction
   - Receive USDC (70% of harvest revenue)
   - Cost: ~0.01 HBAR

3. **Provide Liquidity**
   - Go to "Lending"
   - Select a pool
   - Click "Provide Liquidity"
   - Enter USDC amount
   - Approve transactions
   - Receive LP tokens
   - Cost: ~0.05 HBAR

4. **Take a Loan**
   - Navigate to "Lending" → "Loans"
   - Click "Take Loan"
   - Enter loan amount
   - System calculates collateral (125%)
   - Approve collateral transfer
   - Approve loan transaction
   - Receive USDC
   - Cost: ~0.1 HBAR

5. **Repay Loan**
   - Go to "My Loans"
   - Click "Repay Loan"
   - Approve USDC repayment
   - Collateral returned
   - Cost: ~0.05 HBAR

### As an Admin

1. **Mint Tokens**
   - Navigate to "Admin Panel"
   - Select "Token Management"
   - Choose grove
   - Click "Mint Tokens"
   - Enter amount
   - Approve transaction
   - Cost: ~0.05 HBAR

2. **Grant KYC**
   - Go to "KYC Management"
   - Enter user address
   - Click "Grant KYC"
   - Approve transaction
   - Cost: ~0.05 HBAR

---

## 💰 Estimated Testing Costs

| Activity | Cost (HBAR) |
|----------|-------------|
| Register Grove | 0.1 |
| Report Harvest | 0.05 |
| Withdraw Revenue | 0.01 |
| Purchase Tokens | 0.05 |
| Claim Earnings | 0.01 |
| Provide Liquidity | 0.05 |
| Take Loan | 0.1 |
| Repay Loan | 0.05 |
| Mint Tokens | 0.05 |
| Grant KYC | 0.05 |

**Total for full testing:** ~5-10 HBAR (free from faucet)

---

## 🔍 Monitor Your Transactions

### HashScan Explorer

View all your transactions on HashScan:

1. Visit: https://hashscan.io/testnet/
2. Search for your Account ID: `0.0.6967933`
3. View transaction history
4. Check transaction details
5. Verify token balances

**Direct Link:** https://hashscan.io/testnet/account/0.0.6967933

### In HashPack Wallet

1. Open HashPack
2. View "Activity" tab
3. See all transactions
4. Click for details

---

## 🐛 Troubleshooting

### "Insufficient Transaction Fee"

**Problem:** Not enough HBAR for transaction fees

**Solution:**
1. Check balance: Run `test-connection.bat`
2. Get more HBAR: https://portal.hedera.com/faucet
3. Wait 1-2 minutes for transfer

### "Invalid Signature"

**Problem:** Private key doesn't match account

**Solution:**
1. Verify private key in `.env` file
2. Ensure it's the ECDSA key from HashPack
3. Check for typos or extra spaces

### "Connection Timeout"

**Problem:** Can't connect to Hedera network

**Solution:**
1. Check internet connection
2. Check Hedera status: https://status.hedera.com/
3. Try again in a few minutes

### "Contract Not Found"

**Problem:** Smart contracts not deployed

**Solution:**
1. Use mock API: `start-demo.bat`
2. Or deploy contracts first (see HEDERA_TESTNET_SETUP_GUIDE.md)

---

## 📖 Documentation

- **[HEDERA_TESTNET_SETUP_GUIDE.md](./HEDERA_TESTNET_SETUP_GUIDE.md)** - Complete setup guide
- **[HEDERA_QUICK_START.md](./HEDERA_QUICK_START.md)** - Quick reference
- **[USER_GUIDE.md](./USER_GUIDE.md)** - Feature documentation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API reference

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| **Your Account** | https://hashscan.io/testnet/account/0.0.6967933 |
| **Hedera Portal** | https://portal.hedera.com/ |
| **Testnet Faucet** | https://portal.hedera.com/faucet |
| **HashPack Wallet** | https://www.hashpack.app/ |
| **HashScan Explorer** | https://hashscan.io/testnet/ |
| **Hedera Docs** | https://docs.hedera.com/ |
| **Hedera Status** | https://status.hedera.com/ |

---

## ✅ Testing Checklist

- [ ] Run `test-connection.bat` to verify setup
- [ ] Get testnet HBAR from faucet
- [ ] Install and configure HashPack wallet
- [ ] Start application (`start-demo.bat` or `start-hedera-testnet.bat`)
- [ ] Connect HashPack wallet to application
- [ ] Test farmer features (register grove, report harvest)
- [ ] Test investor features (purchase tokens, claim earnings)
- [ ] Test lending features (provide liquidity, take loan)
- [ ] Test admin features (mint tokens, grant KYC)
- [ ] Verify all transactions on HashScan

---

## 🎉 You're All Set!

Your Hedera testnet setup is complete. Run `test-connection.bat` to verify everything is working, then start testing the Coffee Platform!

**Questions?**
- Discord: https://hedera.com/discord
- Docs: https://docs.hedera.com/

---

*Last Updated: January 15, 2025*  
*Account ID: 0.0.6967933*  
*Network: Hedera Testnet*
