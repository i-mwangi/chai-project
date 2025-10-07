# Task 24: Transaction History Integration Guide

## Overview
This guide explains how to integrate transaction recording into existing platform operations.

## Integration Pattern

### Basic Pattern
```javascript
// 1. Create transaction record before operation
const txRecord = await window.transactionHistoryManager.addTransaction({
    type: TransactionType.PURCHASE,
    amount: amountInCents,
    asset: 'USDC',
    fromAddress: buyerAddress,
    toAddress: groveTokenAddress,
    status: TransactionStatus.PENDING,
    metadata: { groveId, tokenAmount }
});

// 2. Perform blockchain operation
try {
    const result = await performBlockchainOperation();
    
    // 3. Update transaction status on success
    await window.transactionHistoryManager.updateTransactionStatus(
        txRecord.id,
        TransactionStatus.COMPLETED,
        result.transactionHash
    );
} catch (error) {
    // 4. Update transaction status on failure
    await window.transactionHistoryManager.updateTransactionStatus(
        txRecord.id,
        TransactionStatus.FAILED
    );
}
```

## Integration Points

### 1. Token Purchase (investor-portal.js)
Location: `purchaseTokens` method


### 2. Revenue Distribution (revenue-distribution.js)
Location: `claimEarnings` method

### 3. Farmer Withdrawal (farmer-dashboard.js)
Location: `handleWithdrawalSubmit` method

### 4. Loan Operations (lending-liquidity.js)
Locations: `takeOutLoan`, `repayLoan` methods

### 5. Liquidity Operations (lending-liquidity.js)
Locations: `provideLiquidity`, `withdrawLiquidity` methods

### 6. Token Management (token-admin.js)
Locations: `mintTokens`, `burnTokens`, `grantKYC`, `revokeKYC` methods

## Example Implementations

### Token Purchase Example
```javascript
async purchaseTokens(groveId, amount) {
    const buyerAddress = window.walletManager.getAccountId();
    
    // Record transaction
    const txRecord = await window.transactionHistoryManager.addTransaction({
        type: 'purchase',
        amount: amount * 100, // Convert to cents
        asset: 'USDC',
        fromAddress: buyerAddress,
        toAddress: groveId,
        status: 'pending',
        metadata: { groveId, tokenAmount: amount }
    });
    
    try {
        const result = await window.coffeeAPI.purchaseGroveTokens(groveId, amount);
        await window.transactionHistoryManager.updateTransactionStatus(
            txRecord.id, 'completed', result.transactionHash
        );
        return result;
    } catch (error) {
        await window.transactionHistoryManager.updateTransactionStatus(
            txRecord.id, 'failed'
        );
        throw error;
    }
}
```

### Revenue Distribution Example
```javascript
async claimEarnings(distributionId) {
    const holderAddress = window.walletManager.getAccountId();
    
    const txRecord = await window.transactionHistoryManager.addTransaction({
        type: 'distribution',
        amount: distributionAmount,
        asset: 'USDC',
        fromAddress: 'RevenueReserve',
        toAddress: holderAddress,
        status: 'pending',
        metadata: { distributionId }
    });
    
    try {
        const result = await window.coffeeAPI.claimEarnings(distributionId);
        await window.transactionHistoryManager.updateTransactionStatus(
            txRecord.id, 'completed', result.transactionHash
        );
        return result;
    } catch (error) {
        await window.transactionHistoryManager.updateTransactionStatus(
            txRecord.id, 'failed'
        );
        throw error;
    }
}
```

## Best Practices

1. Always create transaction record before blockchain operation
2. Always update status after operation completes
3. Include relevant metadata for context
4. Use try-catch to handle failures
5. Store transaction hash for verification
6. Use consistent amount units (cents for USDC)

## Testing Integration

After integrating, verify:
- Transactions appear in history immediately
- Status updates correctly
- Transaction hash is captured
- Metadata is preserved
- Filters work correctly
- Export includes new transactions
