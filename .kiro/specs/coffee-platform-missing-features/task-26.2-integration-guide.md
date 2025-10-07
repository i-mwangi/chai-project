# Task 26.2 Integration Guide: Progress Bars for Batch Operations

## Quick Start

This guide shows how to integrate progress bars into batch operations in the Coffee Tree Platform.

## Basic Usage

### 1. Import the Loading State Manager

```javascript
// The loadingStateManager is a singleton instance
// It's automatically available when loading-states.js is included
```

### 2. Show a Progress Bar

```javascript
const progressId = loadingStateManager.showProgress('unique-operation-id', {
    message: 'Processing items...',
    total: 100,        // Total number of items
    current: 0         // Starting position
});
```

### 3. Update Progress

```javascript
// Update progress as items are processed
for (let i = 1; i <= 100; i++) {
    await processItem(i);
    
    // Update progress
    loadingStateManager.updateProgress(
        progressId,
        i,                                    // Current progress
        `Processing item ${i} of 100...`     // Optional message update
    );
}
```

### 4. Hide Progress Bar

```javascript
// Hide when complete
loadingStateManager.hideProgress(progressId);
```

## Integration with Revenue Distribution

### Example: Processing Distribution Batch

The `RevenueDistributionManager` already integrates progress bars. Here's how it works:

```javascript
// Create distribution manager
const distributionManager = new RevenueDistributionManager(apiClient);

// Process batch with progress tracking
const result = await distributionManager.processDistributionBatch(
    'dist-123',           // Distribution ID
    holders,              // Array of holder objects
    50,                   // Batch size (max 50)
    loadingStateManager   // Pass loading manager for progress
);

// Progress bar automatically shows:
// - Current batch being processed
// - "X of Y holders processed" counter
// - Percentage completion
// - Animated progress bar
```

### What Happens Internally

```javascript
// 1. Progress bar is created
const progressId = loadingManager.showProgress(`distribution-${distributionId}`, {
    message: 'Processing distribution...',
    total: holders.length,
    current: 0
});

// 2. Progress updates after each holder
for (const holder of holders) {
    // Process holder...
    
    // Update progress
    loadingManager.updateProgress(
        progressId,
        successfulTransfers + failedTransfers,
        `Processing batch ${batchNum} of ${totalBatches}...`
    );
}

// 3. Progress bar is hidden when complete
loadingManager.hideProgress(progressId);
```

## Advanced Usage

### Custom Target Element

Show progress bar in a specific element instead of overlay:

```javascript
const targetElement = document.getElementById('my-container');

const progressId = loadingStateManager.showProgress('my-operation', {
    message: 'Processing...',
    total: 100,
    current: 0,
    targetElement: targetElement  // Show in specific element
});
```

### Multiple Concurrent Progress Bars

Track multiple operations simultaneously:

```javascript
// Start multiple operations
const progress1 = loadingStateManager.showProgress('operation-1', {
    message: 'Processing batch 1...',
    total: 50,
    current: 0
});

const progress2 = loadingStateManager.showProgress('operation-2', {
    message: 'Processing batch 2...',
    total: 75,
    current: 0
});

// Update independently
loadingStateManager.updateProgress(progress1, 25);
loadingStateManager.updateProgress(progress2, 30);

// Hide when complete
loadingStateManager.hideProgress(progress1);
loadingStateManager.hideProgress(progress2);
```

### Progress with Error Handling

Continue progress tracking even when errors occur:

```javascript
const progressId = loadingStateManager.showProgress('batch-operation', {
    message: 'Processing items...',
    total: items.length,
    current: 0
});

let successful = 0;
let failed = 0;

for (let i = 0; i < items.length; i++) {
    try {
        await processItem(items[i]);
        successful++;
    } catch (error) {
        failed++;
        console.error(`Failed to process item ${i}:`, error);
    }
    
    // Update progress regardless of success/failure
    loadingStateManager.updateProgress(
        progressId,
        i + 1,
        `Processed: ${successful} successful, ${failed} failed`
    );
}

loadingStateManager.hideProgress(progressId);
```

## UI Integration Examples

### Example 1: Investor Portal - Claim Earnings

```javascript
async function claimAllEarnings(distributions) {
    const progressId = loadingStateManager.showProgress('claim-earnings', {
        message: 'Claiming earnings...',
        total: distributions.length,
        current: 0
    });
    
    let claimed = 0;
    
    for (let i = 0; i < distributions.length; i++) {
        try {
            await api.claimEarnings(distributions[i].id, userAddress);
            claimed++;
        } catch (error) {
            console.error('Failed to claim:', error);
        }
        
        loadingStateManager.updateProgress(
            progressId,
            i + 1,
            `Claimed ${claimed} of ${distributions.length} distributions`
        );
    }
    
    loadingStateManager.hideProgress(progressId);
    
    // Show success message
    showNotification(`Successfully claimed ${claimed} distributions!`, 'success');
}
```

### Example 2: Admin Panel - Batch Token Operations

```javascript
async function batchMintTokens(groveId, recipients) {
    const progressId = loadingStateManager.showProgress('batch-mint', {
        message: 'Minting tokens...',
        total: recipients.length,
        current: 0
    });
    
    const results = [];
    
    for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        
        try {
            const result = await api.mintTokens(groveId, recipient.address, recipient.amount);
            results.push({ success: true, ...result });
        } catch (error) {
            results.push({ success: false, error: error.message });
        }
        
        loadingStateManager.updateProgress(
            progressId,
            i + 1,
            `Minting tokens for recipient ${i + 1} of ${recipients.length}...`
        );
    }
    
    loadingStateManager.hideProgress(progressId);
    
    return results;
}
```

### Example 3: Farmer Dashboard - Batch Harvest Reporting

```javascript
async function submitMultipleHarvests(harvests) {
    const progressId = loadingStateManager.showProgress('submit-harvests', {
        message: 'Submitting harvest reports...',
        total: harvests.length,
        current: 0
    });
    
    for (let i = 0; i < harvests.length; i++) {
        await api.reportHarvest(harvests[i]);
        
        loadingStateManager.updateProgress(
            progressId,
            i + 1,
            `Submitted ${i + 1} of ${harvests.length} harvest reports`
        );
    }
    
    loadingStateManager.hideProgress(progressId);
}
```

## Best Practices

### 1. Use Unique Progress IDs

```javascript
// Good: Unique ID with timestamp or operation identifier
const progressId = loadingStateManager.showProgress(`distribution-${Date.now()}`, {...});

// Bad: Generic ID that might conflict
const progressId = loadingStateManager.showProgress('progress', {...});
```

### 2. Always Hide Progress Bars

```javascript
// Good: Use try-finally to ensure cleanup
const progressId = loadingStateManager.showProgress('operation', {...});
try {
    await performOperation();
} finally {
    loadingStateManager.hideProgress(progressId);
}

// Bad: Progress bar might not be hidden if error occurs
const progressId = loadingStateManager.showProgress('operation', {...});
await performOperation();
loadingStateManager.hideProgress(progressId);
```

### 3. Provide Meaningful Messages

```javascript
// Good: Descriptive messages
loadingStateManager.updateProgress(
    progressId,
    50,
    'Processing batch 2 of 5: Transferring funds to holders...'
);

// Bad: Generic messages
loadingStateManager.updateProgress(progressId, 50, 'Processing...');
```

### 4. Update Progress Regularly

```javascript
// Good: Update after each item
for (let i = 0; i < items.length; i++) {
    await processItem(items[i]);
    loadingStateManager.updateProgress(progressId, i + 1);
}

// Bad: Only update at end
for (let i = 0; i < items.length; i++) {
    await processItem(items[i]);
}
loadingStateManager.updateProgress(progressId, items.length);
```

### 5. Handle Errors Gracefully

```javascript
// Good: Continue progress tracking even with errors
for (let i = 0; i < items.length; i++) {
    try {
        await processItem(items[i]);
    } catch (error) {
        console.error('Error:', error);
        // Continue to next item
    }
    loadingStateManager.updateProgress(progressId, i + 1);
}

// Bad: Progress stops on first error
for (let i = 0; i < items.length; i++) {
    await processItem(items[i]); // Throws error, progress stops
    loadingStateManager.updateProgress(progressId, i + 1);
}
```

## Styling Customization

### Custom Progress Bar Colors

Add custom CSS to override default colors:

```css
/* Custom progress bar color */
.progress-bar-fill {
    background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
}

/* Custom message color */
.progress-message {
    color: #28a745;
}

/* Custom percentage color */
.progress-percentage {
    color: #28a745;
}
```

### Custom Progress Bar Size

```css
/* Larger progress bar */
.progress-bar-container {
    height: 32px;
}

/* Smaller progress bar */
.progress-bar-container {
    height: 16px;
}
```

## Troubleshooting

### Progress Bar Not Showing

1. **Check if LoadingStateManager is initialized**
   ```javascript
   loadingStateManager.initialize();
   ```

2. **Verify loading-states.js is included**
   ```html
   <script src="frontend/js/loading-states.js"></script>
   ```

3. **Check for CSS conflicts**
   - Ensure main.css is loaded
   - Check z-index values

### Progress Not Updating

1. **Verify progress ID is correct**
   ```javascript
   console.log('Progress ID:', progressId);
   ```

2. **Check if progress bar still exists**
   ```javascript
   console.log('Has progress:', loadingStateManager.progressBars.has(progressId));
   ```

3. **Ensure updateProgress is called with correct parameters**
   ```javascript
   loadingStateManager.updateProgress(progressId, current, message);
   ```

### Multiple Progress Bars Overlapping

Use unique IDs for each operation:

```javascript
const progress1 = loadingStateManager.showProgress(`op-1-${Date.now()}`, {...});
const progress2 = loadingStateManager.showProgress(`op-2-${Date.now()}`, {...});
```

## Testing

### Unit Test Example

```javascript
describe('Progress Bar Integration', () => {
    it('should show and update progress', async () => {
        const progressId = loadingStateManager.showProgress('test', {
            message: 'Testing...',
            total: 100,
            current: 0
        });
        
        expect(loadingStateManager.progressBars.has(progressId)).toBe(true);
        
        loadingStateManager.updateProgress(progressId, 50);
        
        const progress = loadingStateManager.progressBars.get(progressId);
        expect(progress.current).toBe(50);
        
        loadingStateManager.hideProgress(progressId);
        expect(loadingStateManager.progressBars.has(progressId)).toBe(false);
    });
});
```

## Performance Tips

1. **Batch Updates**: Don't update progress too frequently
   ```javascript
   // Good: Update every 10 items
   if (i % 10 === 0 || i === items.length) {
       loadingStateManager.updateProgress(progressId, i);
   }
   ```

2. **Use CSS Transitions**: Let CSS handle animations
   - Progress bar uses CSS transitions for smooth updates
   - No need for JavaScript animation loops

3. **Clean Up**: Always remove progress bars when done
   ```javascript
   loadingStateManager.hideProgress(progressId);
   ```

## Summary

The progress bar system provides:
- ✅ Visual feedback for long-running operations
- ✅ Real-time progress updates
- ✅ "X of Y" counter display
- ✅ Percentage calculation
- ✅ Batch operation support
- ✅ Error handling
- ✅ Multiple concurrent operations
- ✅ Responsive design
- ✅ Easy integration

For more examples, see `test-batch-progress.html`.
