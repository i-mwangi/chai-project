# Task 23.2 Balance Update Integration Flow

## Overview
This document describes the complete flow of balance updates across the UI after transaction completion.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Action                               │
│  (Purchase, Claim, Provide Liquidity, Withdraw, Loan, etc.)    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Transaction Handler                            │
│  (handleTokenPurchase, claimEarnings, handleProvideLiquidity,   │
│   handleWithdrawLiquidity, handleTakeLoan, handleRepayLoan,     │
│   processWithdrawal)                                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Call to Backend                           │
│  (coffeeAPI.purchaseTokens, coffeeAPI.claimEarnings, etc.)     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Transaction Execution                           │
│  (Smart contract interaction on blockchain)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Response with Transaction Hash                      │
│  { success: true, transactionHash: "0x...", ... }               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         balancePoller.refreshAfterTransaction()                  │
│  - Wait for confirmation (5 seconds)                            │
│  - Clear cache for balance types                                │
│  - Fetch fresh balances                                         │
│  - Notify listeners                                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Balance Listeners Triggered                     │
│  - handleTokenBalanceUpdate()                                   │
│  - handleUSDCBalanceUpdate()                                    │
│  - handleLPBalanceUpdate()                                      │
│  - handleFarmerBalanceUpdate()                                  │
│  - handlePendingDistributionsUpdate()                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UI Components Update                          │
│  - Portfolio stats refresh                                      │
│  - Balance displays update                                      │
│  - Charts re-render                                             │
│  - Lists refresh                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Flow by Transaction Type

### 1. Token Purchase Flow

```javascript
User clicks "Purchase Tokens"
    ↓
handleTokenPurchase(groveId, tokenAmount)
    ↓
coffeeAPI.purchaseTokens(groveId, tokenAmount, investorAddress)
    ↓
Backend executes purchase transaction
    ↓
Returns { success: true, transactionHash: "0x..." }
    ↓
await balancePoller.refreshAfterTransaction(transactionHash, ['token', 'usdc'])
    ↓
Wait 5 seconds for confirmation
    ↓
Clear cache for 'token' and 'usdc'
    ↓
Fetch fresh token balances for all groves
Fetch fresh USDC balance
    ↓
Notify listeners:
  - handleTokenBalanceUpdate(balances)
  - handleUSDCBalanceUpdate(balance)
    ↓
UI updates:
  - Portfolio view reloads
  - Token balance displays update
  - USDC balance displays update
```

### 2. Earnings Claim Flow

```javascript
User clicks "Claim Earnings"
    ↓
claimEarnings(distributionId, holderAddress)
    ↓
coffeeAPI.claimEarnings(distributionId, holderAddress)
    ↓
Backend executes claim transaction
    ↓
Returns { success: true, transactionHash: "0x..." }
    ↓
await balancePoller.refreshAfterTransaction(transactionHash, ['usdc', 'pending'])
    ↓
Wait 5 seconds for confirmation
    ↓
Clear cache for 'usdc' and 'pending'
    ↓
Fetch fresh USDC balance
Fetch fresh pending distributions
    ↓
Notify listeners:
  - handleUSDCBalanceUpdate(balance)
  - handlePendingDistributionsUpdate(distributions)
    ↓
UI updates:
  - USDC balance displays update
  - Pending distributions list updates
  - Earnings history refreshes
```

### 3. Liquidity Provision Flow

```javascript
User clicks "Provide Liquidity"
    ↓
handleProvideLiquidity(assetAddress)
    ↓
coffeeAPI.provideLiquidity(assetAddress, amount)
    ↓
Backend executes liquidity provision
    ↓
Returns { success: true, transactionHash: "0x..." }
    ↓
await balancePoller.refreshAfterTransaction(transactionHash, ['usdc', 'lp'])
    ↓
Wait 5 seconds for confirmation
    ↓
Clear cache for 'usdc' and 'lp'
    ↓
Fetch fresh USDC balance
Fetch fresh LP token balances
    ↓
Notify listeners:
  - handleUSDCBalanceUpdate(balance)
  - handleLPBalanceUpdate(balances)
    ↓
UI updates:
  - USDC balance displays update
  - LP token balance displays update
  - Pool statistics refresh
  - Lending pools view reloads
```

### 4. Liquidity Withdrawal Flow

```javascript
User clicks "Withdraw Liquidity"
    ↓
handleWithdrawLiquidity(assetAddress)
    ↓
coffeeAPI.withdrawLiquidity(assetAddress, lpTokenAmount)
    ↓
Backend executes liquidity withdrawal
    ↓
Returns { success: true, transactionHash: "0x...", usdcAmount: 1000 }
    ↓
await balancePoller.refreshAfterTransaction(transactionHash, ['usdc', 'lp'])
    ↓
Wait 5 seconds for confirmation
    ↓
Clear cache for 'usdc' and 'lp'
    ↓
Fetch fresh USDC balance
Fetch fresh LP token balances
    ↓
Notify listeners:
  - handleUSDCBalanceUpdate(balance)
  - handleLPBalanceUpdate(balances)
    ↓
UI updates:
  - USDC balance displays update
  - LP token balance displays update
  - Pool statistics refresh
  - Lending pools view reloads
```

### 5. Take Loan Flow

```javascript
User clicks "Take Loan"
    ↓
handleTakeLoan()
    ↓
coffeeAPI.takeOutLoan('USDC', loanAmount)
    ↓
Backend executes loan transaction
    ↓
Returns { success: true, transactionHash: "0x..." }
    ↓
await balancePoller.refreshAfterTransaction(transactionHash, ['usdc', 'token'])
    ↓
Wait 5 seconds for confirmation
    ↓
Clear cache for 'usdc' and 'token'
    ↓
Fetch fresh USDC balance
Fetch fresh token balances (shows locked tokens)
    ↓
Notify listeners:
  - handleUSDCBalanceUpdate(balance)
  - handleTokenBalanceUpdate(balances)
    ↓
UI updates:
  - USDC balance displays update
  - Token balance shows locked status
  - Loan details display
  - Loan data reloads
```

### 6. Repay Loan Flow

```javascript
User clicks "Repay Loan"
    ↓
handleRepayLoan()
    ↓
coffeeAPI.repayLoan('USDC')
    ↓
Backend executes repayment transaction
    ↓
Returns { success: true, transactionHash: "0x..." }
    ↓
await balancePoller.refreshAfterTransaction(transactionHash, ['usdc', 'token'])
    ↓
Wait 5 seconds for confirmation
    ↓
Clear cache for 'usdc' and 'token'
    ↓
Fetch fresh USDC balance
Fetch fresh token balances (shows unlocked tokens)
    ↓
Notify listeners:
  - handleUSDCBalanceUpdate(balance)
  - handleTokenBalanceUpdate(balances)
    ↓
UI updates:
  - USDC balance displays update
  - Token balance shows unlocked status
  - Loan status updates to "repaid"
  - Loan data reloads
```

### 7. Farmer Withdrawal Flow

```javascript
User clicks "Confirm Withdrawal"
    ↓
processWithdrawal()
    ↓
coffeeAPI.withdrawFarmerShare(groveId, amount, farmerAddress)
    ↓
Backend executes withdrawal transaction
    ↓
Returns { success: true, transactionHash: "0x..." }
    ↓
await balancePoller.refreshAfterTransaction(transactionHash, ['farmer', 'usdc'])
    ↓
Wait 5 seconds for confirmation
    ↓
Clear cache for 'farmer' and 'usdc'
    ↓
Fetch fresh farmer balance
Fetch fresh USDC balance
    ↓
Notify listeners:
  - handleFarmerBalanceUpdate(balance)
  - handleUSDCBalanceUpdate(balance)
    ↓
UI updates:
  - Farmer balance displays update
  - USDC balance displays update
  - Revenue section reloads
  - Withdrawal history refreshes
```

## Balance Type Mapping

| Transaction Type | Balance Types Refreshed | Reason |
|-----------------|------------------------|---------|
| Token Purchase | `['token', 'usdc']` | Token balance increases, USDC decreases |
| Earnings Claim | `['usdc', 'pending']` | USDC increases, pending distributions decrease |
| Provide Liquidity | `['usdc', 'lp']` | USDC decreases, LP tokens increase |
| Withdraw Liquidity | `['usdc', 'lp']` | USDC increases, LP tokens decrease |
| Take Loan | `['usdc', 'token']` | USDC increases, tokens locked as collateral |
| Repay Loan | `['usdc', 'token']` | USDC decreases, tokens unlocked |
| Farmer Withdrawal | `['farmer', 'usdc']` | Farmer balance decreases, USDC increases |

## Timing Guarantees

1. **Transaction Confirmation**: 5 seconds maximum wait
2. **Balance Fetch**: 3 retry attempts with exponential backoff
3. **Cache Invalidation**: Immediate upon transaction completion
4. **Listener Notification**: Immediate after balance fetch
5. **UI Update**: Immediate after listener notification

**Total Time**: Typically 5-7 seconds from transaction completion to UI update

## Error Handling

### Transaction Failure
```javascript
if (!response.success) {
    // Show error toast
    // Don't trigger balance refresh
    // UI remains in previous state
}
```

### Balance Refresh Failure
```javascript
try {
    await balancePoller.refreshAfterTransaction(...)
} catch (error) {
    // Error logged but doesn't block UI
    // User can manually refresh
    // Automatic polling continues
}
```

### Network Error During Refresh
```javascript
// Retry logic (up to 3 attempts)
// Exponential backoff: 1s, 2s, 4s
// If all retries fail, log error
// Continue with other balance types
```

## Performance Optimizations

1. **Parallel Fetching**: Multiple balance types fetched simultaneously
2. **Cache Management**: 30-second cache prevents excessive API calls
3. **Selective Refresh**: Only refresh affected balance types
4. **Async/Await**: Non-blocking UI updates
5. **Error Isolation**: Failed refresh doesn't affect other operations

## Integration with Existing Systems

### Balance Poller
- Uses existing `BalancePoller` class
- Leverages existing cache management
- Integrates with existing retry logic
- Compatible with existing listener system

### UI Components
- Works with existing listener handlers
- Integrates with existing reload methods
- Compatible with existing display logic
- No changes to existing UI components needed

### API Layer
- Uses existing API client methods
- Compatible with existing response format
- No changes to backend API needed
- Transaction hash already included in responses

## Summary

The balance update integration provides:
- ✅ Automatic balance refresh after all transactions
- ✅ 5-second guarantee for balance updates
- ✅ Proper error handling and retry logic
- ✅ Non-blocking UI updates
- ✅ Seamless integration with existing systems
- ✅ Consistent user experience across all transaction types
