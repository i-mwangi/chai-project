# Hedera Testnet Quick Start

## 🚀 Get Started in 5 Minutes

### Step 1: Get Testnet Credentials (2 minutes)

1. Go to https://portal.hedera.com/register
2. Create a free account
3. Copy your testnet Account ID and Private Key
4. Request testnet HBAR from faucet: https://portal.hedera.com/faucet

### Step 2: Configure Environment (1 minute)

```bash
# Run the setup script
test-on-hedera.bat

# Edit .env file and add:
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=your-private-key-here
```

### Step 3: Start Application (1 minute)

**Option A - Mock API (No contracts needed):**
```bash
start-demo.bat
```

**Option B - Real Hedera API (Requires deployed contracts):**
```bash
start-hedera-testnet.bat
```

### Step 4: Connect Wallet (1 minute)

1. Install HashPack: https://www.hashpack.app/
2. Switch to Testnet mode in HashPack settings
3. Open http://localhost:3000
4. Click "Connect Wallet" and approve

### Step 5: Test Features

✅ **Farmer:** Register grove → Report harvest → Withdraw revenue  
✅ **Investor:** Browse groves → Buy tokens → Claim earnings  
✅ **Admin:** Mint tokens → Grant KYC → Monitor platform

---

## 📋 Quick Commands

```bash
# Setup
test-on-hedera.bat              # Initial setup

# Run with mock data (no Hedera needed)
start-demo.bat                  # Mock API + Frontend

# Run with real Hedera testnet
start-hedera-testnet.bat        # Real API + Frontend

# Build TypeScript
pnpm run build                  # Compile TS to JS

# Database
pnpm run migrate                # Run migrations
pnpm run studio                 # Open DB viewer
```

---

## 🔗 Essential Links

| Resource | URL |
|----------|-----|
| **Hedera Portal** | https://portal.hedera.com/ |
| **Testnet Faucet** | https://portal.hedera.com/faucet |
| **HashPack Wallet** | https://www.hashpack.app/ |
| **HashScan Explorer** | https://hashscan.io/testnet/ |
| **Hedera Docs** | https://docs.hedera.com/ |
| **Hedera Status** | https://status.hedera.com/ |

---

## 💰 Testnet Costs

| Operation | Cost (HBAR) |
|-----------|-------------|
| Token Transfer | 0.001 |
| Contract Call | 0.01-0.1 |
| Token Association | 0.05 |
| Full Testing | ~15-20 |

**Get free testnet HBAR:** https://portal.hedera.com/faucet

---

## 🐛 Common Issues

### "Insufficient Transaction Fee"
→ Get more testnet HBAR from faucet

### "Invalid Account ID"
→ Check format: 0.0.xxxxx (testnet ID)

### "Contract Not Found"
→ Deploy contracts first or use mock API

### "Connection Failed"
→ Check Hedera status: https://status.hedera.com/

---

## 📖 Full Documentation

For detailed instructions, see:
- **[HEDERA_TESTNET_SETUP_GUIDE.md](./HEDERA_TESTNET_SETUP_GUIDE.md)** - Complete setup guide
- **[USER_GUIDE.md](./USER_GUIDE.md)** - Feature documentation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API reference

---

## ✅ Testing Checklist

- [ ] Get testnet credentials
- [ ] Get testnet HBAR
- [ ] Configure .env file
- [ ] Install HashPack wallet
- [ ] Start application
- [ ] Connect wallet
- [ ] Test farmer features
- [ ] Test investor features
- [ ] Test admin features
- [ ] Verify transactions on HashScan

---

**Need Help?**
- Discord: https://hedera.com/discord
- Docs: https://docs.hedera.com/
- Status: https://status.hedera.com/

---

*Last Updated: January 15, 2025*
