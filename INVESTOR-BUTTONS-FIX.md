# Investor Browse Groves Buttons Fix

## Issue
The "View Details" and "Invest Now" buttons on the Browse Groves section were not responding to clicks.

## Root Cause
The buttons were using inline `onclick` attributes that referenced `window.investorPortal`, which can be unreliable when:
- The DOM is created dynamically
- There are timing issues with script loading
- Content Security Policy restrictions exist

## Solution
Changed from inline onclick handlers to proper event delegation:

**Before:**
```javascript
<button onclick="investorPortal.viewGroveDetails('${grove.id}')">View Details</button>
<button onclick="investorPortal.showPurchaseModal('${grove.id}')">Invest Now</button>
```

**After:**
```javascript
<button class="grove-details-btn" data-grove-id="${grove.id}">View Details</button>
<button class="grove-invest-btn" data-grove-id="${grove.id}">Invest Now</button>
```

Then added event listeners after rendering:
```javascript
container.querySelectorAll('.grove-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const groveId = e.target.closest('.grove-details-btn').dataset.groveId;
        this.viewGroveDetails(groveId);
    });
});
```

## Benefits
- More reliable button functionality
- Better separation of concerns (HTML vs JavaScript)
- Easier to debug
- Works with Content Security Policy
- Proper `this` context binding

## Testing
1. Restart frontend: `restart-frontend-server.bat`
2. Navigate to Investor Dashboard → Browse Groves
3. Click "View Details" - should open grove details modal
4. Click "Invest Now" - should open purchase modal

## Status
✅ Fixed - Buttons now use event delegation instead of inline onclick
