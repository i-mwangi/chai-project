# Task 26 Integration Guide: Loading States and Progress Indicators

## Quick Start

### 1. Include the Loading States Module

Add the loading states script to your HTML:

```html
<script src="frontend/js/loading-states.js"></script>
```

The CSS styles are already included in `frontend/styles/main.css`.

### 2. Initialize the Loading State Manager

```javascript
// The loading state manager is automatically available as a singleton
loadingStateManager.initialize();
```

### 3. Use in Your Code

#### Option A: Pass to Module Methods (Recommended)

```javascript
// Revenue Distribution
const revenueManager = new RevenueDistributionManager(apiClient);
await revenueManager.processDistributionBatch(
    distributionId,
    holders,
    50,
    loadingStateManager  // Pass as parameter
);

// Lending Operations
const lendingManager = new LendingPoolManager(apiClient);
await lendingManager.provideLiquidity(
    assetAddress,
    amount,
    loadingStateManager  // Pass as parameter
);

// Token Operations
const tokenAdmin = new TokenAdminManager(apiClient);
await tokenAdmin.mintTokens(
    groveId,
    amount,
    loadingStateManager  // Pass as parameter
);
```

#### Option B: Manual Control

```javascript
// Show loading spinner
const loadingId = loadingStateManager.showLoading(
    'unique-operation-id',
    'Loading message...'
);

try {
    // Your async operation
    await someAsyncOperation();
} finally {
    // Always hide in finally block
    loadingStateManager.hideLoading(loadingId);
}
```

#### Option C: Progress Bar for Custom Batches

```javascript
// Show progress bar
const progressId = loadingStateManager.showProgress('batch-id', {
    message: 'Processing items...',
    total: 100,
    current: 0
});

// Update progress in loop
for (let i = 1; i <= 100; i++) {
    await processItem(i);
    loadingStateManager.updateProgress(
        progressId,
        i,
        `Processing item ${i} of 100...`  // Optional message update
    );
}

// Hide progress bar
loadingStateManager.hideProgress(progressId);
```

## Integration Examples

### Example 1: Investor Portal - Claim Earnings

```javascript
async function handleClaimEarnings(distributionId) {
    const loadingId = loadingStateManager.showLoading(
        'claim-earnings',
        'Claiming your earnings...'
    );
    
    try {
        const result = await api.claimEarnings(distributionId, userAddress);
        
        if (result.success) {
            showSuccessMessage('Earnings claimed successfully!');
            await refreshBalances();
        }
    } catch (error) {
        showErrorMessage(error.message);
    } finally {
        loadingStateManager.hideLoading(loadingId);
    }
}
```

### Example 2: Farmer Dashboard - Withdraw Revenue

```javascript
async function handleWithdrawal(amount) {
    const loadingId = loadingStateManager.showLoading(
        'farmer-withdrawal',
        `Withdrawing ${amount} USDC...`
    );
    
    try {
        const result = await api.withdrawFarmerShare(groveId, amount, farmerAddress);
        
        if (result.success) {
            showSuccessMessage('Withdrawal successful!');
            await refreshFarmerBalance();
        }
    } catch (error) {
        showErrorMessage(error.message);
    } finally {
        loadingStateManager.hideLoading(loadingId);
    }
}
```

### Example 3: Admin Panel - Batch Token Minting

```javascript
async function handleBatchMint(groves) {
    const progressId = loadingStateManager.showProgress('batch-mint', {
        message: 'Minting tokens for groves...',
        total: groves.length,
        current: 0
    });
    
    const results = [];
    
    for (let i = 0; i < groves.length; i++) {
        const grove = groves[i];
        
        try {
            // Don't pass loadingManager here since we're using progress bar
            const result = await tokenAdmin.mintTokens(grove.id, grove.amount);
            results.push({ grove: grove.id, success: true, result });
        } catch (error) {
            results.push({ grove: grove.id, success: false, error: error.message });
        }
        
        loadingStateManager.updateProgress(
            progressId,
            i + 1,
            `Minted tokens for ${i + 1} of ${groves.length} groves...`
        );
    }
    
    loadingStateManager.hideProgress(progressId);
    
    return results;
}
```

### Example 4: Button Loading State

```javascript
async function handleButtonClick(event) {
    const button = event.target;
    
    // Add loading class to button
    button.classList.add('btn-loading');
    button.disabled = true;
    
    try {
        await performOperation();
    } finally {
        // Remove loading class
        button.classList.remove('btn-loading');
        button.disabled = false;
    }
}
```

### Example 5: Inline Loading in Specific Element

```javascript
async function loadDataIntoElement(elementId) {
    const element = document.getElementById(elementId);
    
    // Show loading in specific element
    const loadingId = loadingStateManager.showLoading(
        'load-data',
        'Loading data...',
        element  // Target element
    );
    
    try {
        const data = await fetchData();
        renderData(element, data);
    } finally {
        loadingStateManager.hideLoading(loadingId);
    }
}
```

## Best Practices

### 1. Always Use Try-Finally

```javascript
// ✅ GOOD
const loadingId = loadingStateManager.showLoading('op', 'Loading...');
try {
    await operation();
} finally {
    loadingStateManager.hideLoading(loadingId);
}

// ❌ BAD - Loading might not be hidden if error occurs
const loadingId = loadingStateManager.showLoading('op', 'Loading...');
await operation();
loadingStateManager.hideLoading(loadingId);
```

### 2. Use Descriptive Operation IDs

```javascript
// ✅ GOOD
loadingStateManager.showLoading('claim-earnings-dist-123', 'Claiming...');
loadingStateManager.showLoading('mint-tokens-grove-5', 'Minting...');

// ❌ BAD - Generic IDs can conflict
loadingStateManager.showLoading('loading', 'Loading...');
loadingStateManager.showLoading('op', 'Processing...');
```

### 3. Provide Meaningful Messages

```javascript
// ✅ GOOD
loadingStateManager.showLoading('op', 'Processing 150 token holders...');
loadingStateManager.showLoading('op', 'Minting 1000 tokens for Grove #5...');

// ❌ BAD - Generic messages
loadingStateManager.showLoading('op', 'Loading...');
loadingStateManager.showLoading('op', 'Please wait...');
```

### 4. Update Progress Messages

```javascript
// ✅ GOOD - Informative progress updates
for (let i = 1; i <= batches.length; i++) {
    await processBatch(batches[i]);
    loadingStateManager.updateProgress(
        progressId,
        i * 50,
        `Processing batch ${i} of ${batches.length}...`
    );
}

// ❌ BAD - No message updates
for (let i = 1; i <= batches.length; i++) {
    await processBatch(batches[i]);
    loadingStateManager.updateProgress(progressId, i * 50);
}
```

### 5. Clean Up on Page Navigation

```javascript
// Clean up when navigating away
window.addEventListener('beforeunload', () => {
    loadingStateManager.clearAll();
});

// Or in your navigation handler
function navigateToPage(page) {
    loadingStateManager.clearAll();
    showPage(page);
}
```

## Common Patterns

### Pattern 1: Form Submission

```javascript
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    submitButton.classList.add('btn-loading');
    submitButton.disabled = true;
    
    try {
        const formData = new FormData(form);
        const result = await submitForm(formData);
        
        if (result.success) {
            showSuccessMessage('Form submitted successfully!');
            form.reset();
        }
    } catch (error) {
        showErrorMessage(error.message);
    } finally {
        submitButton.classList.remove('btn-loading');
        submitButton.disabled = false;
    }
}
```

### Pattern 2: Data Refresh

```javascript
async function refreshData() {
    const loadingId = loadingStateManager.showLoading(
        'refresh-data',
        'Refreshing data...'
    );
    
    try {
        const [groves, harvests, distributions] = await Promise.all([
            api.getGroves(),
            api.getHarvests(),
            api.getDistributions()
        ]);
        
        renderGroves(groves);
        renderHarvests(harvests);
        renderDistributions(distributions);
    } finally {
        loadingStateManager.hideLoading(loadingId);
    }
}
```

### Pattern 3: Sequential Operations

```javascript
async function performSequentialOperations() {
    const operations = [
        { id: 'op1', message: 'Step 1: Validating...', fn: validate },
        { id: 'op2', message: 'Step 2: Processing...', fn: process },
        { id: 'op3', message: 'Step 3: Finalizing...', fn: finalize }
    ];
    
    for (const op of operations) {
        const loadingId = loadingStateManager.showLoading(op.id, op.message);
        
        try {
            await op.fn();
        } finally {
            loadingStateManager.hideLoading(loadingId);
        }
    }
}
```

## Troubleshooting

### Issue: Loading spinner doesn't appear

**Solution:** Make sure you've initialized the loading state manager:
```javascript
loadingStateManager.initialize();
```

### Issue: Loading spinner doesn't disappear

**Solution:** Always use try-finally to ensure cleanup:
```javascript
const loadingId = loadingStateManager.showLoading('op', 'Loading...');
try {
    await operation();
} finally {
    loadingStateManager.hideLoading(loadingId);  // Always executes
}
```

### Issue: Multiple spinners overlap

**Solution:** Use unique operation IDs:
```javascript
// Each operation gets unique ID
loadingStateManager.showLoading('op-1', 'Operation 1...');
loadingStateManager.showLoading('op-2', 'Operation 2...');
```

### Issue: Progress bar doesn't update

**Solution:** Make sure you're calling updateProgress with the correct ID:
```javascript
const progressId = loadingStateManager.showProgress('my-progress', {...});
// Later...
loadingStateManager.updateProgress(progressId, current);  // Use same ID
```

## Testing

Use the provided test page to verify integration:

```bash
# Open in browser
open test-loading-states.html
```

Test all scenarios:
1. Basic loading spinners
2. Progress bars with different batch sizes
3. Multiple concurrent operations
4. Button loading states

## API Reference

### LoadingStateManager Methods

```javascript
// Initialize (call once on page load)
loadingStateManager.initialize()

// Show loading spinner
loadingStateManager.showLoading(operationId, message, targetElement)
// Returns: operationId

// Hide loading spinner
loadingStateManager.hideLoading(operationId)

// Update loading message
loadingStateManager.updateLoadingMessage(operationId, message)

// Show progress bar
loadingStateManager.showProgress(progressId, options)
// options: { message, total, current, targetElement }
// Returns: progressId

// Update progress
loadingStateManager.updateProgress(progressId, current, message)

// Hide progress bar
loadingStateManager.hideProgress(progressId)

// Clear all loading states
loadingStateManager.clearAll()

// Check if operations are active
loadingStateManager.hasActiveOperations()
// Returns: boolean

// Get active operation count
loadingStateManager.getActiveOperationCount()
// Returns: number
```

## CSS Classes

```css
/* Loading overlay */
.loading-overlay

/* Loading content container */
.loading-content

/* Spinner element */
.loading-spinner

/* Loading message */
.loading-message

/* Progress overlay */
.progress-overlay

/* Progress content container */
.progress-content

/* Progress message */
.progress-message

/* Progress bar container */
.progress-bar-container

/* Progress bar fill */
.progress-bar-fill

/* Progress info */
.progress-info

/* Progress counter */
.progress-counter

/* Progress percentage */
.progress-percentage

/* Button loading state */
.btn-loading

/* Inline loading */
.inline-loading

/* Small spinner */
.spinner-small
```

## Summary

The loading states system is now fully integrated and ready to use. Simply pass `loadingStateManager` as a parameter to module methods, or use it directly for custom operations. The system handles all the visual feedback automatically, providing a professional user experience across all async operations.
