# Hedera Testnet Setup Guide

## 🚨 Current Issue

Your `.env` file still has placeholder values. You need to replace them with real testnet credentials.

## 🎯 Quick Fix

### Step 1: Get Testnet Account

Choose one of these methods:

#### Method A: Hedera Portal (Easiest)

1. **Go to Hedera Portal**: https://portal.hedera.com/
2. **Create Account** or sign in
3. **Switch to Testnet**:
   - Look for network selector (top right)
   - Select "Testnet"
4. **Create a Testnet Account**:
   - Click "Create Account" or "Add Account"
   - Save your Account ID (format: `0.0.XXXXX`)
   - Save your Private Key (long hex string)
5. **Get Free Test HBAR**:
   - Click "Get Test HBAR" or use faucet
   - You'll receive ~1000 test HBAR

#### Method B: HashPack Wallet

1. **Install HashPack**: https://www.hashpack.app/
2. **Create Wallet**
3. **Switch to Testnet**:
   - Settings → Network → Testnet
4. **Export Private Key**:
   - Settings → Account → Export Private Key
   - Save it securely
5. **Get Test HBAR**:
   - Use faucet: https://portal.hedera.com/faucet

#### Method C: Hedera Testnet Faucet (Direct)

1. **Go to**: https://portal.hedera.com/faucet
2. **Create Account** (if you don't have one)
3. **Request Test HBAR**
4. **Save credentials** provided

### Step 2: Update Your .env File

Open your `.env` file and replace these lines:

```env
# BEFORE (placeholder values):
HEDERA_OPERATOR_ID=0.0.12345
HEDERA_OPERATOR_KEY=your-private-key-here

# AFTER (your actual values):
HEDERA_OPERATOR_ID=0.0.4567890  # ← Your actual account ID
HEDERA_OPERATOR_KEY=302e020100300506032b657004220420a1b2c3d4e5f6...  # ← Your actual private key
```

**Important Notes:**
- Account ID format: `0.0.XXXXXX` (numbers only)
- Private key: 64 or 96 character hex string (no spaces, no quotes in the value)
- Keep your private key secret!

### Step 3: Verify Configuration

Run this command to check if your .env is configured correctly:

```bash
node check-env.js
```

If you see ✅ for all checks, you're ready to deploy!

### Step 4: Deploy Contracts

```bash
# Deploy all contracts
deploy-all-contracts.bat

# Or deploy individually
pnpm run deploy PriceOracle
```

## 📋 Example .env Configuration

Here's what a properly configured .env looks like:

```env
# ============================================
# Hedera Network Configuration
# ============================================
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.4567890
HEDERA_OPERATOR_KEY=302e020100300506032b65700422042012345678901234567890123456789012

# ============================================
# WalletConnect Configuration
# ============================================
VITE_WALLETCONNECT_PROJECT_ID=39948bbdaaebec2790629f3e9589793a
VITE_HEDERA_NETWORK=testnet
VITE_DEBUG=true

# ... rest of your config
```

## 🔍 Troubleshooting

### Error: "invalid private key, expected hex or 32 bytes"

**Cause**: Private key is still placeholder or invalid format

**Fix**: 
- Make sure you replaced `your-private-key-here` with actual key
- Private key should be 64 or 96 hex characters
- No spaces, no quotes around the value
- Example: `302e020100300506032b657004220420a1b2c3d4...`

### Error: "HEDERA_OPERATOR_KEY and HEDERA_OPERATOR_ID must be set"

**Cause**: Environment variables not loaded

**Fix**:
- Make sure file is named `.env` (not `.env.txt` or `.env.example`)
- File should be in project root directory
- Restart your terminal after editing

### Error: "Insufficient balance"

**Cause**: Not enough HBAR in testnet account

**Fix**:
- Get more test HBAR from faucet: https://portal.hedera.com/faucet
- Each deployment needs ~10-50 HBAR
- Faucet gives ~1000 HBAR (enough for all contracts)

### Can't Access Hedera Portal

**Alternative**: Use the Hedera SDK to generate a new account

```bash
# Create a script to generate testnet account
node generate-testnet-account.js
```

## 💡 Tips

1. **Save Your Credentials**: Store them in a password manager
2. **Test HBAR is Free**: Don't worry about running out, just use the faucet
3. **Multiple Accounts**: You can create multiple testnet accounts for testing
4. **Network Switch**: Make sure you're on testnet, not mainnet!
5. **Private Key Security**: Never commit your private key to git

## 🔗 Useful Links

- **Hedera Portal**: https://portal.hedera.com/
- **Testnet Faucet**: https://portal.hedera.com/faucet
- **HashScan (Testnet)**: https://hashscan.io/testnet/
- **Hedera Docs**: https://docs.hedera.com/
- **HashPack Wallet**: https://www.hashpack.app/

## ✅ Verification Checklist

Before deploying, make sure:

- [ ] You have a testnet account (Account ID: `0.0.XXXXX`)
- [ ] You have your private key saved
- [ ] Your `.env` file has real values (not placeholders)
- [ ] You have test HBAR in your account (~1000 HBAR)
- [ ] `node check-env.js` shows all ✅
- [ ] Network is set to `testnet` in `.env`

## 🚀 Next Steps

Once configured:

1. ✅ Run `node check-env.js` to verify
2. ✅ Deploy contracts: `deploy-all-contracts.bat`
3. ✅ Check deployments on HashScan
4. ✅ Update contract IDs in `.env`
5. ✅ Start building!

## 📞 Need Help?

If you're still stuck:
1. Run `node check-env.js` and share the output
2. Check that your `.env` file exists in the project root
3. Verify you're using testnet credentials (not mainnet)
4. Make sure you have test HBAR in your account
