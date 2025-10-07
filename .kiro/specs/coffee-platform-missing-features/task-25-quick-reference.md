# Task 25: Enhanced Error Handling - Quick Reference Card

## 🎯 Quick Start

```javascript
// 1. Throw specific errors
throw new InsufficientBalanceError(100, 50, 'USDC');

// 2. Handle with user-friendly notification
errorHandler.handleError(error, {
    context: 'Withdraw Funds',
    onRetry: () => retryWithdraw(),
    logToConsole: true
});

// 3. Show success
errorHandler.handleSuccess('Withdrawal successful!');
```

## 📦 Error Classes

| Class | Use For | Key Properties |
|-------|---------|----------------|
| `DistributionError` | Revenue distribution failures | distributionId, failedHolders[] |
| `LoanError` | Loan operation failures | loanId, errorCode |
| `InsufficientBalanceError` | Balance validation | required, available, assetType |
| `LiquidityError` | Pool operations | poolAddress, errorCode |
| `TokenOperationError` | Token management | groveId, errorCode |
| `PriceOracleError` | Price fetching | variety, errorCode |
| `TransactionError` | Blockchain transactions | transactionHash, errorCode |
| `ValidationError` | Input validation | field, value |
| `NetworkError` | API/network issues | statusCode, endpoint |

## 🔔 Notification Methods

```javascript
// Error with retry
errorHandler.handleError(error, {
    context: 'Operation Name',
    onRetry: () => retryFunction()
});

// Success (auto-dismiss 3s)
errorHandler.handleSuccess('Operation completed!');

// Warning (auto-dismiss 5s)
errorHandler.handleWarning('Health factor low!');

// Info (auto-dismiss 4s)
errorHandler.handleInfo('Loading data...');

// Custom toast
errorHandler.showToast('Custom message', 'error', {
    duration: 5000,
    showRetry: true,
    onRetry: () => retry(),
    dismissible: true
});

// Clear all
errorHandler.clearAll();
```

## 🎨 Toast Types

| Type | Icon | Color | Use For |
|------|------|-------|---------|
| `error` | ❌ | Red | Failures, errors |
| `success` | ✅ | Green | Successful operations |
| `warning` | ⚠️ | Yellow | Warnings, risks |
| `info` | ℹ️ | Blue | Information, loading |

## 🔄 Retry Pattern

```javascript
async function operationWithRetry() {
    try {
        const result = await riskyOperation();
        errorHandler.handleSuccess('Success!');
        return result;
    } catch (error) {
        errorHandler.handleError(error, {
            context: 'Operation Name',
            onRetry: () => operationWithRetry(), // Recursive retry
            logToConsole: true
        });
        throw error;
    }
}
```

## 🎯 Common Patterns

### Pattern 1: Balance Check
```javascript
if (userBalance < requiredAmount) {
    throw new InsufficientBalanceError(
        requiredAmount,
        userBalance,
        'USDC'
    );
}
```

### Pattern 2: API Call
```javascript
try {
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new NetworkError(
            `Request failed: ${response.statusText}`,
            response.status,
            endpoint
        );
    }
    return await response.json();
} catch (error) {
    errorHandler.handleError(error, {
        context: 'API Call',
        onRetry: () => makeRequest()
    });
    throw error;
}
```

### Pattern 3: Validation
```javascript
if (amount <= 0) {
    throw new ValidationError(
        'Amount must be greater than 0',
        'amount',
        amount
    );
}
```

### Pattern 4: Authorization
```javascript
if (!isAdmin()) {
    throw new TokenOperationError(
        'Admin privileges required',
        groveId,
        'UNAUTHORIZED'
    );
}
```

## 📊 Error Codes

### Most Common
- `INSUFFICIENT_BALANCE` - Not enough funds
- `NETWORK_ERROR` - Connection issues
- `VALIDATION_ERROR` - Invalid input
- `UNAUTHORIZED` - Not authorized
- `TRANSACTION_FAILED` - Blockchain failure

### Recoverable (Show Retry)
- `NETWORK_ERROR`
- `TIMEOUT_ERROR`
- `CONNECTION_ERROR`
- `API_ERROR`
- `TRANSACTION_TIMEOUT`
- `PRICE_STALE`
- `DISTRIBUTION_BATCH_FAILED`

## 🧪 Testing

```javascript
// Open test-error-handling.html in browser
// Or test in console:

// Test error
const error = new LoanError('Test', 'loan-123', 'TEST_ERROR');
errorHandler.handleError(error);

// Test success
errorHandler.handleSuccess('Test success!');

// Test with retry
errorHandler.handleError(new NetworkError('Test'), {
    onRetry: () => console.log('Retry clicked')
});
```

## 📁 Files

- `frontend/js/errors.js` - Error classes
- `frontend/js/error-handler.js` - Handler & toasts
- `frontend/styles/main.css` - Toast styles
- `test-error-handling.html` - Test page

## 🔗 Integration

1. Scripts auto-loaded in app.html
2. Wrap operations in try-catch
3. Throw specific error types
4. Call errorHandler.handleError()
5. Add success notifications

## 💡 Tips

- ✅ Always provide context
- ✅ Use specific error classes
- ✅ Enable retry for network errors
- ✅ Log errors for debugging
- ✅ Show success notifications
- ✅ Validate before operations
- ✅ Check balances first
- ❌ Don't use generic Error
- ❌ Don't show technical details
- ❌ Don't block on errors

## 📚 Documentation

- `task-25-integration-guide.md` - Integration examples
- `task-25-verification.md` - Verification checklist
- `task-25-implementation-summary.md` - Full details
- `task-25-final-summary.md` - Complete summary

## ✅ Status

**Task 25**: Complete ✅
**Sub-tasks**: 2/2 Complete ✅
**Requirements**: 5/5 Met ✅
**Ready for**: Integration into modules
