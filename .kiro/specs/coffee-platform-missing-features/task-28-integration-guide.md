# Task 28: Data Validation - Integration Guide

## Quick Start

### Client-Side Usage

1. **Include the validation script in your HTML**:
```html
<script src="js/validation.js"></script>
```

2. **Basic validation example**:
```javascript
// Validate an amount
const validation = Validator.validateAmount(amount, 'Amount', { min: 0 });
if (!validation.valid) {
    alert(validation.error);
    return;
}

// Validate and throw on error
try {
    Validator.throwIfInvalid(
        Validator.validateAmount(amount, 'Amount'),
        'amount'
    );
    // Proceed with valid amount
} catch (error) {
    if (error instanceof ValidationError) {
        console.error(`Validation failed: ${error.message}`);
    }
}
```

### Server-Side Usage

1. **Import validation module**:
```typescript
import { ServerValidator, ServerValidationError, validateRequestBody } from './validation';
```

2. **Validate request body**:
```typescript
// Check required fields
const bodyValidation = validateRequestBody(req.body, ['amount', 'accountId']);
if (!bodyValidation.valid) {
    return res.status(400).json({
        success: false,
        errors: bodyValidation.errors
    });
}

// Validate specific fields
const amountValidation = ServerValidator.validateAmount(req.body.amount, 'Amount');
ServerValidator.throwIfInvalid(amountValidation, 'amount');
```

## Common Validation Patterns

### Pattern 1: Form Validation
```javascript
function validateHarvestForm(formData) {
    const validations = Validator.validateMultiple({
        yieldKg: Validator.validateAmount(formData.yieldKg, 'Yield', { min: 0 }),
        grade: Validator.validateQualityGrade(formData.grade),
        price: Validator.validatePriceRange(formData.price, marketPrice),
        harvestDate: Validator.validatePastDate(formData.harvestDate)
    });

    if (!validations.valid) {
        // Display all errors
        Object.entries(validations.errors).forEach(([field, error]) => {
            showFieldError(field, error);
        });
        return false;
    }
    return true;
}
```

### Pattern 2: Balance Check Before Transaction
```javascript
async function handleWithdrawal(amount) {
    const balance = await getBalance();
    
    const validation = Validator.validateTokenAmount(amount, balance, 'Withdrawal amount');
    if (!validation.valid) {
        NotificationManager.error(validation.error);
        return;
    }

    // Proceed with withdrawal
    await processWithdrawal(amount);
}
```

### Pattern 3: API Endpoint Validation
```typescript
app.post('/api/revenue/create-distribution', async (req, res) => {
    try {
        // Validate required fields
        const bodyValidation = validateRequestBody(req.body, ['harvestId', 'totalRevenue']);
        if (!bodyValidation.valid) {
            return res.status(400).json({
                success: false,
                errors: bodyValidation.errors
            });
        }

        // Validate amount
        const amountValidation = ServerValidator.validateAmount(
            req.body.totalRevenue,
            'Total Revenue',
            { min: 0, allowZero: false }
        );
        ServerValidator.throwIfInvalid(amountValidation, 'totalRevenue');

        // Validate harvest ID format
        const harvestIdValidation = ServerValidator.validateString(
            req.body.harvestId,
            'Harvest ID',
            { minLength: 1 }
        );
        ServerValidator.throwIfInvalid(harvestIdValidation, 'harvestId');

        // Process distribution
        const result = await createDistribution(req.body);
        res.json({ success: true, data: result });

    } catch (error) {
        if (error instanceof ServerValidationError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
                field: error.field,
                code: error.code
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});
```

## Integration Checklist by Module

### Revenue Distribution Module
```javascript
// In frontend/js/revenue-distribution.js

async createDistribution(harvestId, totalRevenue) {
    // Validate inputs
    const validations = Validator.validateMultiple({
        harvestId: Validator.validateString(harvestId, 'Harvest ID'),
        totalRevenue: Validator.validateAmount(totalRevenue, 'Total Revenue', { min: 0 })
    });

    if (!validations.valid) {
        throw new DistributionError('Invalid distribution parameters', null, validations.errors);
    }

    // Proceed with API call
    return await api.createDistribution(harvestId, totalRevenue);
}

async withdrawFarmerShare(groveId, amount, farmerAddress) {
    // Validate inputs
    const balance = await this.getFarmerBalance(farmerAddress);
    
    const validations = Validator.validateMultiple({
        amount: Validator.validateTokenAmount(amount, balance, 'Withdrawal amount'),
        farmerAddress: Validator.validateHederaAccountId(farmerAddress, 'Farmer address')
    });

    if (!validations.valid) {
        throw new InsufficientBalanceError(amount, balance);
    }

    // Proceed with withdrawal
    return await api.withdrawFarmerShare(groveId, amount, farmerAddress);
}
```

### Lending & Liquidity Module
```javascript
// In frontend/js/lending-liquidity.js

async provideLiquidity(assetAddress, amount) {
    // Get current balance
    const balance = await this.getUSDCBalance();

    // Validate inputs
    const validations = Validator.validateMultiple({
        amount: Validator.validateTokenAmount(amount, balance, 'Liquidity amount'),
        assetAddress: Validator.validateHederaAccountId(assetAddress, 'Asset address')
    });

    if (!validations.valid) {
        throw new LoanError('Invalid liquidity parameters', null, validations.errors);
    }

    // Proceed with liquidity provision
    return await api.provideLiquidity(assetAddress, amount);
}

async takeOutLoan(assetAddress, loanAmount) {
    // Get collateral value
    const collateralValue = await this.getCollateralValue();

    // Validate collateralization
    const collateralValidation = Validator.validateCollateralization(
        collateralValue,
        loanAmount,
        1.25 // 125% ratio
    );

    if (!collateralValidation.valid) {
        throw new LoanError(
            collateralValidation.error,
            null,
            'INSUFFICIENT_COLLATERAL'
        );
    }

    // Validate loan amount
    const amountValidation = Validator.validateAmount(loanAmount, 'Loan amount', { min: 0 });
    Validator.throwIfInvalid(amountValidation, 'loanAmount');

    // Proceed with loan
    return await api.takeOutLoan(assetAddress, loanAmount);
}
```

### Price Oracle Module
```javascript
// In frontend/js/price-oracle.js

async validateSalePrice(variety, grade, proposedPrice) {
    // Get market price
    const marketPrice = await this.getCoffeePrices(variety, grade);

    // Validate inputs
    const validations = Validator.validateMultiple({
        grade: Validator.validateQualityGrade(grade),
        price: Validator.validatePriceRange(proposedPrice, marketPrice, 'Sale price')
    });

    if (!validations.valid) {
        return {
            valid: false,
            errors: validations.errors
        };
    }

    return { valid: true };
}
```

### Token Admin Module
```javascript
// In frontend/js/token-admin.js

async mintTokens(groveId, amount) {
    // Validate inputs
    const validations = Validator.validateMultiple({
        groveId: Validator.validateAmount(groveId, 'Grove ID', { min: 0 }),
        amount: Validator.validateAmount(amount, 'Mint amount', { min: 0 })
    });

    if (!validations.valid) {
        throw new Error(Object.values(validations.errors).join(', '));
    }

    // Proceed with minting
    return await api.mintTokens(groveId, amount);
}

async grantKYC(groveId, accountAddress) {
    // Validate inputs
    const validations = Validator.validateMultiple({
        groveId: Validator.validateAmount(groveId, 'Grove ID', { min: 0 }),
        accountAddress: Validator.validateHederaAccountId(accountAddress, 'Account address')
    });

    if (!validations.valid) {
        throw new Error(Object.values(validations.errors).join(', '));
    }

    // Proceed with KYC grant
    return await api.grantKYC(groveId, accountAddress);
}
```

### Farmer Dashboard
```javascript
// In frontend/js/farmer-dashboard.js

async submitHarvest(harvestData) {
    // Validate harvest data
    const validations = Validator.validateMultiple({
        yieldKg: Validator.validateAmount(harvestData.yieldKg, 'Yield', { min: 0 }),
        grade: Validator.validateQualityGrade(harvestData.grade),
        harvestDate: Validator.validatePastDate(harvestData.harvestDate),
        price: Validator.validatePriceRange(harvestData.price, this.marketPrice)
    });

    if (!validations.valid) {
        // Show errors in UI
        this.showValidationErrors(validations.errors);
        return;
    }

    // Submit harvest
    await api.reportHarvest(harvestData);
}
```

## Error Display Patterns

### Pattern 1: Inline Field Errors
```javascript
function showFieldError(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = errorMessage;
    field.parentNode.appendChild(errorDiv);
    field.classList.add('invalid');
}
```

### Pattern 2: Toast Notifications
```javascript
function showValidationError(validation) {
    if (!validation.valid) {
        NotificationManager.error(validation.error);
        return false;
    }
    return true;
}
```

### Pattern 3: Modal Dialog
```javascript
function showValidationErrors(errors) {
    const errorList = Object.entries(errors)
        .map(([field, error]) => `<li><strong>${field}:</strong> ${error}</li>`)
        .join('');
    
    showModal({
        title: 'Validation Errors',
        content: `<ul>${errorList}</ul>`,
        type: 'error'
    });
}
```

## Testing Your Integration

1. **Test with valid inputs**: Ensure validation passes
2. **Test with invalid inputs**: Ensure proper error messages
3. **Test edge cases**: Zero, negative, boundary values
4. **Test error display**: Verify user-friendly messages
5. **Test server-side**: Ensure backend validation works

## Common Pitfalls

1. **Forgetting to validate on both client and server**: Always validate on both sides
2. **Not handling validation errors**: Always check validation.valid before proceeding
3. **Using wrong validation method**: Use appropriate validator for data type
4. **Not displaying errors to user**: Always show validation errors in UI
5. **Validating after API call**: Validate before making network requests

## Performance Tips

1. **Validate early**: Check inputs before expensive operations
2. **Cache validation results**: Don't re-validate unchanged data
3. **Batch validations**: Use validateMultiple for forms
4. **Debounce real-time validation**: Don't validate on every keystroke

## Next Steps

1. Add validation to all existing forms
2. Update API endpoints with server-side validation
3. Test all validation scenarios
4. Update user documentation with validation rules
5. Monitor validation errors for UX improvements
