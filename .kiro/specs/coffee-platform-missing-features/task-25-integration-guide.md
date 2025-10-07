# Task 25: Enhanced Error Handling - Integration Guide

## Overview

This guide demonstrates how to integrate the enhanced error handling system into existing modules.

## Custom Error Classes

The following custom error classes are available:

### Core Error Classes

1. **DistributionError** - For revenue distribution failures
2. **LoanError** - For loan operation failures
3. **InsufficientBalanceError** - For balance-related errors
4. **LiquidityError** - For liquidity pool errors
5. **TokenOperationError** - For token management errors
6. **PriceOracleError** - For pricing errors
7. **TransactionError** - For blockchain transaction errors
8. **ValidationError** - For input validation errors
9. **NetworkError** - For API/network errors

## Integration Examples

### Example 1: Revenue Distribution Module

```javascript
// In revenue-distribution.js

async claimEarnings(distributionId, holderAddress) {
    try {
        // Validate inputs
        if (!distributionId || !holderAddress) {
            throw new ValidationError(
                'Distribution ID and holder address are required',
                'distributionId',
                distributionId
            );
        }

        // Check balance
        const distribution = await this.getDistribution(distributionId);
        if (distribution.amount <= 0) {
            throw new InsufficientBalanceError(
                0.01, // required minimum
                distribution.amount,
                'USDC'
            );
        }

        // Attempt claim
        const result = await this.api.claimEarnings(distributionId, holderAddress);
        
        if (!result.success) {
            throw new DistributionError(
                'Failed to claim earnings',
                distributionId,
                [holderAddress]
            );
        }

        // Show success notification
        errorHandler.handleSuccess('Earnings claimed successfully!');
        
        return result;
        
    } catch (error) {
        // Handle error with user-friendly notification
        errorHandler.handleError(error, {
            context: 'Claim Earnings',
            onRetry: () => this.claimEarnings(distributionId, holderAddress),
            logToConsole: true
        });
        throw error;
    }
}
```

### Example 2: Lending Pool Module

```javascript
// In lending-liquidity.js

async takeOutLoan(assetAddress, loanAmount) {
    try {
        // Validate amount
        if (loanAmount <= 0) {
            throw new ValidationError(
                'Loan amount must be greater than 0',
                'loanAmount',
                loanAmount
            );
        }

        // Check collateral
        const collateralRequired = this.calculateCollateralRequired(loanAmount);
        const userBalance = await this.getUserTokenBalance();
        
        if (userBalance < collateralRequired) {
            throw new InsufficientBalanceError(
                collateralRequired,
                userBalance,
                'Coffee Tokens'
            );
        }

        // Attempt loan
        const result = await this.api.takeOutLoan(assetAddress, loanAmount);
        
        if (!result.success) {
            throw new LoanError(
                'Failed to process loan',
                result.loanId,
                'LOAN_PROCESSING_FAILED'
            );
        }

        errorHandler.handleSuccess(`Loan of ${loanAmount} USDC approved!`);
        
        return result;
        
    } catch (error) {
        errorHandler.handleError(error, {
            context: 'Take Out Loan',
            onRetry: () => this.takeOutLoan(assetAddress, loanAmount),
            logToConsole: true
        });
        throw error;
    }
}
```

### Example 3: Price Oracle Module

```javascript
// In price-oracle.js

async getCoffeePrices(variety, grade) {
    try {
        const result = await this.api.getCoffeePrices(variety, grade);
        
        if (!result.success) {
            throw new PriceOracleError(
                'Failed to fetch coffee prices',
                variety,
                'PRICE_FETCH_FAILED'
            );
        }

        // Check if price is stale
        const lastUpdate = new Date(result.lastUpdated);
        const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceUpdate > 24) {
            errorHandler.handleWarning(
                `Price data for ${variety} is ${Math.floor(hoursSinceUpdate)} hours old. Refreshing...`
            );
            // Trigger price refresh
            this.refreshPrices(variety);
        }

        return result;
        
    } catch (error) {
        errorHandler.handleError(error, {
            context: 'Fetch Coffee Prices',
            onRetry: () => this.getCoffeePrices(variety, grade),
            logToConsole: true
        });
        throw error;
    }
}
```

### Example 4: Token Admin Module

```javascript
// In token-admin.js

async mintTokens(groveId, amount) {
    try {
        // Validate admin role
        if (!this.isAdmin()) {
            throw new TokenOperationError(
                'Only administrators can mint tokens',
                groveId,
                'UNAUTHORIZED'
            );
        }

        // Validate amount
        if (amount <= 0 || amount > 1000000) {
            throw new ValidationError(
                'Mint amount must be between 1 and 1,000,000',
                'amount',
                amount
            );
        }

        const result = await this.api.mintTokens(groveId, amount);
        
        if (!result.success) {
            throw new TokenOperationError(
                'Failed to mint tokens',
                groveId,
                'MINT_FAILED'
            );
        }

        errorHandler.handleSuccess(`Successfully minted ${amount} tokens for grove ${groveId}`);
        
        return result;
        
    } catch (error) {
        errorHandler.handleError(error, {
            context: 'Mint Tokens',
            onRetry: this.isAdmin() ? () => this.mintTokens(groveId, amount) : null,
            logToConsole: true
        });
        throw error;
    }
}
```

### Example 5: API Client Error Handling

```javascript
// In api.js

async makeRequest(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, options);
        
        if (!response.ok) {
            throw new NetworkError(
                `API request failed: ${response.statusText}`,
                response.status,
                endpoint
            );
        }

        const data = await response.json();
        return data;
        
    } catch (error) {
        if (error instanceof NetworkError) {
            throw error;
        }
        
        // Handle network/connection errors
        throw new NetworkError(
            'Network connection failed',
            null,
            endpoint
        );
    }
}
```

## Direct Toast Notifications

You can also use the error handler directly for notifications:

```javascript
// Success notification
errorHandler.handleSuccess('Operation completed successfully!');

// Warning notification
errorHandler.handleWarning('Your loan health is below 1.2. Consider adding collateral.');

// Info notification
errorHandler.handleInfo('Price data is being refreshed...');

// Error notification with retry
errorHandler.showToast('Failed to load data', 'error', {
    showRetry: true,
    onRetry: () => loadData(),
    duration: 5000
});
```

## Error Logging

All errors are automatically logged to the console with detailed information:

```javascript
// Console output example:
[Error Handler] Claim Earnings {
    error: DistributionError,
    errorJSON: {
        name: "DistributionError",
        message: "Failed to claim earnings",
        errorCode: "DISTRIBUTION_ERROR",
        distributionId: "dist-123",
        failedHolders: ["0.0.123456"],
        failedCount: 1,
        timestamp: "2025-10-06T10:30:00.000Z"
    },
    stack: "...",
    timestamp: "2025-10-06T10:30:00.000Z"
}
```

## Best Practices

1. **Always wrap async operations in try-catch blocks**
2. **Use specific error classes** for different error types
3. **Provide context** when handling errors
4. **Enable retry** for recoverable errors
5. **Log errors** for debugging (enabled by default)
6. **Show user-friendly messages** using the error handler
7. **Validate inputs** before making API calls
8. **Check balances** before operations
9. **Handle edge cases** explicitly

## Testing Error Handling

```javascript
// Test error handling
async function testErrorHandling() {
    try {
        // Test insufficient balance
        throw new InsufficientBalanceError(100, 50, 'USDC');
    } catch (error) {
        errorHandler.handleError(error, {
            context: 'Test Error',
            onRetry: () => console.log('Retry clicked'),
            logToConsole: true
        });
    }
}
```

## Migration Checklist

To integrate error handling into existing modules:

- [ ] Import error classes at the top of the file
- [ ] Wrap async operations in try-catch blocks
- [ ] Replace generic Error with specific error classes
- [ ] Add errorHandler.handleError() in catch blocks
- [ ] Add success notifications for completed operations
- [ ] Add warning notifications for risky states
- [ ] Test error scenarios
- [ ] Verify toast notifications appear correctly
- [ ] Verify retry functionality works
- [ ] Check console logs for detailed error info
