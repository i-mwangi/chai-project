# Withdrawal System - Quick Reference

## 🚀 Quick Start

### 1. Database Setup (Already Done ✅)
```bash
# Tables created:
✅ farmer_withdrawals
✅ liquidity_withdrawals
✅ farmer_balances
```

### 2. Environment Configuration
```env
# Add to .env file:
REVENUE_RESERVE_CONTRACT_ID=0.0.55555
LENDER_CONTRACT_ID=0.0.33333
HEDERA_OPERATOR_ID=0.0.12345
HEDERA_OPERATOR_KEY=your-private-key-here
HEDERA_NETWORK=testnet
```

### 3. Test the Implementation
```bash
# Backend test
npx tsx test-withdrawal-integration.ts

# Frontend test
# Open: test-withdrawal-max-button.html in browser
```

## 📋 Key Features

### 30% Withdrawal Limit
```javascript
// Automatically calculated
maxWithdrawable = availableBalance * 0.30

// Example:
Available: $1000.00
Max: $300.00 (30%)
```

### Max Button
```javascript
// Frontend usage
window.withdrawalHandler.setMaxWithdrawAmount(
    farmerAddress, 
    inputElement
)
```

### Notifications
```javascript
// Success
✓ Withdrawal Complete
  Successfully withdrew $250.00
  [View Transaction]

// Error
✗ Withdrawal Failed
  Withdrawal exceeds 30% limit

// Info
ℹ Max Amount Set
  Maximum: $300.00 (30%)
```

## 🔌 API Endpoints

### Get Balance
```http
GET /api/revenue/farmer-balance?farmerAddress=0.0.123456

Response:
{
  "availableBalance": 1000.00,
  "maxWithdrawable": 300.00,
  "pendingBalance": 500.00,
  "totalEarned": 1500.00,
  "totalWithdrawn": 0.00
}
```

### Withdraw
```http
POST /api/revenue/withdraw-farmer-share
Content-Type: application/json

{
  "farmerAddress": "0.0.123456",
  "amount": 250.00,
  "groveId": 1
}

Response:
{
  "success": true,
  "data": {
    "withdrawalId": "fw_1760130841607_abc123",
    "amount": 250.00,
    "transactionHash": "0.0.123456@1728561234.567890000",
    "withdrawnAt": "2025-10-10T12:00:00Z"
  }
}
```

### Get History
```http
GET /api/revenue/withdrawal-history?farmerAddress=0.0.123456

Response:
{
  "success": true,
  "data": {
    "withdrawals": [
      {
        "withdrawalId": "fw_...",
        "amount": 250.00,
        "status": "completed",
        "transactionHash": "0.0.123456@...",
        "withdrawnAt": "2025-10-10T12:00:00Z"
      }
    ]
  }
}
```

## 🛠️ Frontend Integration

### HTML
```html
<input type="number" id="withdrawAmount" />
<button onclick="setMaxAmount()">MAX (30%)</button>
<button onclick="withdraw()">Withdraw</button>
```

### JavaScript
```javascript
// Set max amount
async function setMaxAmount() {
    await window.withdrawalHandler.setMaxWithdrawAmount(
        farmerAddress,
        document.getElementById('withdrawAmount')
    )
}

// Process withdrawal
async function withdraw() {
    const amount = parseFloat(
        document.getElementById('withdrawAmount').value
    )
    
    const result = await window.withdrawalHandler.withdrawFarmerShare(
        farmerAddress,
        amount
    )
    
    if (result.success) {
        console.log('Withdrawal successful:', result.data)
    }
}
```

## 🔍 Validation Rules

### Amount Validation
```javascript
✓ amount > 0
✓ amount ≤ availableBalance
✓ amount ≤ maxWithdrawable (30%)
```

### Error Messages
```javascript
"Amount must be positive"
"Insufficient balance. Available: $X.XX"
"Withdrawal exceeds 30% limit. Maximum: $X.XX"
"Revenue contract not initialized"
```

## 📊 Database Schema

### farmer_balances
```sql
farmerAddress (PK)
availableBalance (cents)
pendingBalance (cents)
totalEarned (cents)
totalWithdrawn (cents)
lastWithdrawalAt (timestamp)
```

### farmer_withdrawals
```sql
id (PK)
farmerAddress
groveId (optional)
amount (cents)
status (pending/completed/failed)
transactionHash
blockExplorerUrl
errorMessage
requestedAt
completedAt
```

## 🧪 Testing Checklist

- [x] Database tables created
- [x] 30% limit enforced
- [x] Max button works
- [x] Notifications display
- [x] Balance updates
- [x] History tracked
- [ ] Hedera contracts deployed
- [ ] Environment configured
- [ ] Testnet tested
- [ ] Production deployed

## 🚨 Troubleshooting

### "Revenue contract not initialized"
**Solution:** Set `REVENUE_RESERVE_CONTRACT_ID` in `.env`

### "Insufficient balance"
**Solution:** User needs more revenue distribution

### "Exceeds 30% limit"
**Solution:** User should withdraw less (use MAX button)

### Database errors
**Solution:** Run migration:
```bash
node -e "const sqlite3 = require('better-sqlite3'); const db = sqlite3('./local-store/sqlite/sqlite.db'); const fs = require('fs'); const sql = fs.readFileSync('./db/migrations/add-withdrawal-tables.sql', 'utf8'); db.exec(sql); db.close();"
```

## 📚 Documentation

- `WITHDRAWAL_IMPLEMENTATION_GUIDE.md` - Complete guide
- `WITHDRAWAL_IMPLEMENTATION_SUMMARY.md` - Summary
- `test-withdrawal-integration.ts` - Backend test
- `test-withdrawal-max-button.html` - Frontend demo

## ✅ Production Checklist

1. [ ] Deploy smart contracts to Hedera
2. [ ] Update `.env` with contract IDs
3. [ ] Test on Hedera testnet
4. [ ] Fund contracts with liquidity
5. [ ] Monitor withdrawal success rates
6. [ ] Set up error alerts
7. [ ] Configure rate limiting
8. [ ] Enable transaction logging
9. [ ] Test max button in production UI
10. [ ] Verify notifications work

## 🎯 Key Metrics to Monitor

- Withdrawal success rate
- Average withdrawal amount
- 30% limit hit rate
- Failed transaction reasons
- Contract gas usage
- Response times

## 🔐 Security Notes

- All amounts validated server-side
- 30% limit enforced before contract execution
- All transactions logged in database
- Failed transactions tracked with error messages
- Transaction hashes stored for verification
- Block explorer URLs provided for transparency

---

**Status:** ✅ Implementation Complete
**Next Step:** Deploy Hedera smart contracts and configure environment
