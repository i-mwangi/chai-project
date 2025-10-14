# Withdrawal System Implementation Guide

## Overview

The withdrawal system has been fully implemented with Hedera smart contract integration, database persistence, notification system, and a 30% withdrawal limit for farmers.

## Features Implemented

### ✅ 1. Hedera Smart Contract Integration

**Files Modified:**
- `api/lender-contract.ts` - Added `usdcReturned` and `rewardsEarned` to `LiquidityResult` interface
- `api/withdrawal-service.ts` - Complete rewrite with Hedera integration
- `api/revenue-reserve-contract.ts` - Already had withdrawal methods

**Key Features:**
- Connects to `RevenueReserveContract` for farmer withdrawals
- Connects to `LenderContract` for liquidity provider withdrawals
- Executes on-chain transactions via Hedera SDK
- Returns transaction hashes and block explorer URLs

**Configuration Required:**
Add these to your `.env` file:
```env
REVENUE_RESERVE_CONTRACT_ID=0.0.55555
LENDER_CONTRACT_ID=0.0.33333
HEDERA_OPERATOR_ID=0.0.12345
HEDERA_OPERATOR_KEY=your-private-key-here
HEDERA_NETWORK=testnet
```

### ✅ 2. Database Persistence

**Tables Created:**
- `farmer_withdrawals` - Tracks all farmer withdrawal transactions
- `liquidity_withdrawals` - Tracks all liquidity provider withdrawals
- `farmer_balances` - Maintains farmer balance state

**Migration:**
- `db/migrations/add-withdrawal-tables.sql` - SQL migration script
- Already executed successfully ✅

**Schema:**
```typescript
// Farmer Withdrawals
{
  id: string (primary key)
  farmerAddress: string
  groveId: number (optional)
  amount: number (in cents)
  status: 'pending' | 'completed' | 'failed'
  transactionHash: string
  blockExplorerUrl: string
  errorMessage: string
  requestedAt: timestamp
  completedAt: timestamp
}

// Farmer Balances
{
  farmerAddress: string (primary key)
  availableBalance: number (in cents)
  pendingBalance: number (in cents)
  totalEarned: number (in cents)
  totalWithdrawn: number (in cents)
  lastWithdrawalAt: timestamp
}
```

### ✅ 3. Notification System

**Files Modified:**
- `frontend/js/withdrawal-handler.js` - Enhanced with comprehensive notifications

**Notification Types:**
1. **Pending** - Shows when withdrawal is processing
2. **Success** - Shows when withdrawal completes with transaction link
3. **Error** - Shows when withdrawal fails with error message
4. **Info** - Shows when max amount is set

**Example Usage:**
```javascript
// Success notification with transaction link
this.notificationManager.success(
    `Successfully withdrew ${amount.toFixed(2)}`,
    {
        title: 'Withdrawal Complete',
        action: () => window.open(blockExplorerUrl, '_blank'),
        actionLabel: 'View Transaction',
        duration: 15000
    }
)

// Error notification
this.notificationManager.error(
    'Withdrawal exceeds 30% limit',
    {
        title: 'Withdrawal Failed',
        autoDismiss: false
    }
)
```

### ✅ 4. 30% Withdrawal Limit

**Implementation:**
- Calculated automatically in `getFarmerBalance()` method
- `maxWithdrawable = availableBalance * 0.3`
- Enforced in `processFarmerWithdrawal()` before contract execution
- Displayed in UI for user awareness

**Backend Validation:**
```typescript
// Check 30% withdrawal limit
if (requestedAmountInCents > balance.maxWithdrawable) {
    return {
        success: false,
        error: `Withdrawal exceeds 30% limit. Maximum: ${(balance.maxWithdrawable / 100).toFixed(2)}`
    }
}
```

**Frontend Helper:**
```javascript
// Set max withdrawable amount (30% of available balance)
async setMaxWithdrawAmount(farmerAddress, amountInput) {
    const balance = await this.getFarmerBalance(farmerAddress)
    const maxAmount = balance.maxWithdrawable || 0
    amountInput.value = maxAmount.toFixed(2)
}
```

### ✅ 5. Max Button Functionality

**Files Modified:**
- `frontend/js/withdrawal-handler.js` - Added `setMaxWithdrawAmount()` method

**Usage in HTML:**
```html
<input type="number" id="withdrawAmount" />
<button type="button" onclick="window.withdrawalHandler.setMaxWithdrawAmount(farmerAddress, document.getElementById('withdrawAmount'))">
    MAX (30%)
</button>
```

**Behavior:**
1. Fetches current farmer balance from API
2. Calculates 30% of available balance
3. Sets input field to max withdrawable amount
4. Shows info notification with details

## API Endpoints

### Get Farmer Balance
```
GET /api/revenue/farmer-balance?farmerAddress={address}

Response:
{
  "success": true,
  "data": {
    "farmerAddress": "0.0.123456",
    "availableBalance": 1000.00,
    "pendingBalance": 500.00,
    "totalEarned": 1500.00,
    "totalWithdrawn": 0.00,
    "maxWithdrawable": 300.00,
    "lastWithdrawal": "2025-10-10T12:00:00Z"
  }
}
```

### Withdraw Farmer Share
```
POST /api/revenue/withdraw-farmer-share

Body:
{
  "farmerAddress": "0.0.123456",
  "amount": 250.00,
  "groveId": 1 (optional)
}

Response:
{
  "success": true,
  "data": {
    "withdrawalId": "fw_1728561234567_abc123",
    "amount": 250.00,
    "transactionHash": "0.0.123456@1728561234.567890000",
    "withdrawnAt": "2025-10-10T12:00:00Z"
  }
}
```

### Get Withdrawal History
```
GET /api/revenue/withdrawal-history?farmerAddress={address}

Response:
{
  "success": true,
  "data": {
    "farmerAddress": "0.0.123456",
    "withdrawals": [
      {
        "withdrawalId": "fw_1728561234567_abc123",
        "amount": 250.00,
        "status": "completed",
        "transactionHash": "0.0.123456@1728561234.567890000",
        "blockExplorerUrl": "https://hashscan.io/testnet/transaction/...",
        "withdrawnAt": "2025-10-10T12:00:00Z",
        "requestedAt": "2025-10-10T11:59:00Z"
      }
    ]
  }
}
```

## Testing

### 1. Integration Test
Run the comprehensive integration test:
```bash
npx tsx test-withdrawal-integration.ts
```

This tests:
- ✅ Farmer balance retrieval
- ✅ 30% withdrawal limit enforcement
- ✅ Database persistence
- ✅ Withdrawal history tracking
- ✅ Balance updates

### 2. UI Test
Open the test page in your browser:
```bash
# Start the frontend server
cd frontend
npm start

# Then open:
http://localhost:3000/test-withdrawal-max-button.html
```

This demonstrates:
- ✅ Balance display
- ✅ Max button functionality (30% limit)
- ✅ Withdrawal form validation
- ✅ Notification system
- ✅ Withdrawal history

## Production Deployment Checklist

### 1. Smart Contracts
- [ ] Deploy `CoffeeRevenueReserve` contract to Hedera
- [ ] Deploy `Lender` contract to Hedera
- [ ] Update `.env` with contract IDs
- [ ] Fund contracts with initial liquidity
- [ ] Test contract functions on testnet

### 2. Database
- [ ] Run migration: `node -e "...add-withdrawal-tables.sql..."`
- [ ] Verify tables created: `farmer_withdrawals`, `liquidity_withdrawals`, `farmer_balances`
- [ ] Set up database backups
- [ ] Configure database indexes for performance

### 3. Environment Variables
```env
# Required for production
REVENUE_RESERVE_CONTRACT_ID=0.0.xxxxx
LENDER_CONTRACT_ID=0.0.xxxxx
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=302e...
HEDERA_NETWORK=mainnet
```

### 4. Security
- [ ] Validate all user inputs
- [ ] Rate limit withdrawal endpoints
- [ ] Implement withdrawal cooldown period
- [ ] Add multi-signature for large withdrawals
- [ ] Monitor for suspicious activity
- [ ] Set up alerts for failed transactions

### 5. Monitoring
- [ ] Log all withdrawal attempts
- [ ] Track success/failure rates
- [ ] Monitor contract gas usage
- [ ] Set up alerts for:
  - Failed withdrawals
  - Unusual withdrawal patterns
  - Low contract balance
  - High error rates

## Error Handling

### Common Errors

1. **Insufficient Balance**
```
Error: Insufficient balance. Available: $500.00
Solution: User needs to wait for more revenue distribution
```

2. **Exceeds 30% Limit**
```
Error: Withdrawal exceeds 30% limit. Maximum: $300.00
Solution: User should withdraw less or wait for balance to increase
```

3. **Contract Not Initialized**
```
Error: Revenue contract not initialized
Solution: Set REVENUE_RESERVE_CONTRACT_ID in .env
```

4. **Transaction Failed**
```
Error: Transaction failed with status: INSUFFICIENT_GAS
Solution: Increase gas limit in contract execution
```

## Architecture

```
┌─────────────────┐
│   Frontend UI   │
│  (withdrawal-   │
│   handler.js)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Revenue API    │
│ (revenue-dist-  │
│  ribution-api)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Withdrawal      │
│   Service       │
│ (withdrawal-    │
│   service.ts)   │
└────┬───────┬────┘
     │       │
     ▼       ▼
┌─────────┐ ┌──────────────┐
│Database │ │Hedera Smart  │
│(SQLite) │ │  Contracts   │
└─────────┘ └──────────────┘
```

## Future Enhancements

1. **Scheduled Withdrawals**
   - Allow farmers to schedule automatic withdrawals
   - Weekly/monthly withdrawal options

2. **Withdrawal Limits**
   - Daily withdrawal limits
   - Monthly withdrawal caps
   - Dynamic limits based on account age

3. **Multi-Currency Support**
   - Withdraw in KES, USDC, or other tokens
   - Automatic currency conversion

4. **Batch Withdrawals**
   - Withdraw from multiple groves at once
   - Optimize gas costs

5. **Withdrawal Analytics**
   - Dashboard showing withdrawal patterns
   - Predictive analytics for cash flow

## Support

For issues or questions:
1. Check the error logs in the console
2. Verify environment variables are set correctly
3. Ensure Hedera contracts are deployed and funded
4. Test on Hedera testnet before mainnet deployment

## License

This implementation is part of the Coffee Platform project.
