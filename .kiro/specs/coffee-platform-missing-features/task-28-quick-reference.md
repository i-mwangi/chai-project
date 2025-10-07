# Data Validation - Quick Reference Card

## 🚀 Quick Start

### Include in HTML
```html
<script src="js/validation.js"></script>
```

### Import in Server
```typescript
import { ServerValidator, ServerValidationError } from './validation';
```

## 📋 Common Validations

### Amount Validation
```javascript
// Client
Validator.validateAmount(100, 'Amount', { min: 0, max: 1000 })

// Server
ServerValidator.validateAmount(amount, 'Amount', { min: 0 })
```

### Hedera Account ID
```javascript
// Client & Server
Validator.validateHederaAccountId('0.0.12345', 'Account')
```

### Token Amount vs Balance
```javascript
// Client & Server
Validator.validateTokenAmount(amount, balance, 'Tokens')
```

### Quality Grade (1-10)
```javascript
// Client & Server
Validator.validateQualityGrade(grade)
```

### Price Range (50%-200%)
```javascript
// Client & Server
Validator.validatePriceRange(proposedPrice, marketPrice)
```

### Health Score (0-100)
```javascript
// Client & Server
Validator.validateHealthScore(score)
```

### Collateralization (125%)
```javascript
// Client & Server
Validator.validateCollateralization(collateralValue, loanAmount, 1.25)
```

### Batch Size (max 50)
```javascript
// Client & Server
Validator.validateBatchSize(size, 50)
```

## 🎯 Usage Patterns

### Pattern 1: Simple Validation
```javascript
const validation = Validator.validateAmount(amount, 'Amount');
if (!validation.valid) {
    alert(validation.error);
    return;
}
```

### Pattern 2: Throw on Error
```javascript
try {
    Validator.throwIfInvalid(
        Validator.validateAmount(amount, 'Amount'),
        'amount'
    );
    // Continue...
} catch (error) {
    console.error(error.message);
}
```

### Pattern 3: Multiple Fields
```javascript
const validations = Validator.validateMultiple({
    amount: Validator.validateAmount(amount, 'Amount'),
    accountId: Validator.validateHederaAccountId(accountId, 'Account'),
    grade: Validator.validateQualityGrade(grade)
});

if (!validations.valid) {
    showErrors(validations.errors);
    return;
}
```

### Pattern 4: Server Endpoint
```typescript
app.post('/api/endpoint', async (req, res) => {
    try {
        // Validate required fields
        const bodyValidation = validateRequestBody(req.body, ['amount', 'accountId']);
        if (!bodyValidation.valid) {
            return res.status(400).json({ success: false, errors: bodyValidation.errors });
        }

        // Validate specific fields
        const amountValidation = ServerValidator.validateAmount(req.body.amount, 'Amount');
        ServerValidator.throwIfInvalid(amountValidation, 'amount');

        // Process request...
        res.json({ success: true });
    } catch (error) {
        if (error instanceof ServerValidationError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
                code: error.code
            });
        }
    }
});
```

## 🔍 Validation Methods

| Method | Purpose | Range/Format |
|--------|---------|--------------|
| `validateAmount` | Numeric amounts | Positive, with min/max |
| `validateHederaAccountId` | Account IDs | shard.realm.num |
| `validateTokenAmount` | Token amounts | Must not exceed balance |
| `validatePercentage` | Percentages | 0-100 |
| `validateHealthScore` | Health scores | 0-100 |
| `validateQualityGrade` | Coffee grades | 1-10 |
| `validatePriceRange` | Price validation | 50%-200% of market |
| `validateString` | String fields | Min/max length |
| `validatePastDate` | Date fields | Not in future |
| `validateCollateralization` | Loan collateral | Default 125% |
| `validateBatchSize` | Batch operations | Default max 50 |
| `validateMultiple` | Multiple fields | Returns all errors |

## ⚠️ Error Codes

| Code | Meaning |
|------|---------|
| `INVALID_NUMBER` | Not a valid number |
| `NEGATIVE_VALUE` | Negative not allowed |
| `ZERO_NOT_ALLOWED` | Zero not allowed |
| `BELOW_MINIMUM` | Below minimum value |
| `ABOVE_MAXIMUM` | Above maximum value |
| `INVALID_FORMAT` | Invalid format |
| `INSUFFICIENT_BALANCE` | Exceeds balance |
| `PRICE_TOO_LOW` | Price below 50% |
| `PRICE_TOO_HIGH` | Price above 200% |
| `INSUFFICIENT_COLLATERAL` | Collateral too low |
| `REQUIRED_FIELD` | Field is required |

## 💡 Tips

1. **Always validate on both client and server**
2. **Validate before expensive operations**
3. **Use `validateMultiple` for forms**
4. **Show user-friendly error messages**
5. **Cache validation results when possible**

## 🧪 Testing

Open `test-validation.html` in browser to run 42 automated tests.

## 📚 Full Documentation

- Implementation: `task-28-implementation-summary.md`
- Integration: `task-28-integration-guide.md`
- Verification: `task-28-verification.md`
