# Investor Buttons Debug Guide

## Changes Made

### 1. Enhanced Event Listeners
Added comprehensive logging and improved event handling:
- Changed from `e.target.closest()` to `e.currentTarget` for more reliable element targeting
- Added `e.preventDefault()` and `e.stopPropagation()` to prevent event bubbling issues
- Added console logging to track button clicks and method calls

### 2. Fixed ID Comparison
Changed from strict equality (`===`) to loose equality (`==`) when comparing grove IDs:
- API returns numeric IDs (e.g., `1, 2, 3`)
- HTML data attributes are strings (e.g., `"1", "2", "3"`)
- Using `==` allows proper comparison between number and string

### 3. Added Debug Logging
Console logs now show:
- Number of buttons found and listeners attached
- Which button was clicked and with what grove ID
- Available grove IDs for comparison
- Success/failure of finding the grove in the array

## How to Test

### Step 1: Restart Frontend
```bash
restart-frontend-server.bat
```

### Step 2: Open Browser Console
1. Open the app in your browser
2. Press F12 to open Developer Tools
3. Go to the Console tab

### Step 3: Navigate to Browse Groves
1. Connect wallet as an investor
2. Go to Investor Dashboard → Browse Groves
3. Watch the console for this message:
   ```
   [InvestorPortal] Attaching listeners to X detail buttons and X invest buttons
   ```

### Step 4: Click Buttons
Click "View Details" or "Invest Now" and watch for:
```
[InvestorPortal] View Details clicked for grove: 1
[InvestorPortal] viewGroveDetails called with groveId: 1
[InvestorPortal] Available groves: [1, 2, 3, 4, 5]
[InvestorPortal] Opening details for grove: Test Grove
```

## Troubleshooting

### If buttons still don't work:

1. **Check if groves are loading:**
   ```bash
   npx tsx test-investor-groves-load.ts
   ```
   Should show 5 groves available.

2. **Check console for errors:**
   Look for JavaScript errors that might be preventing the code from running.

3. **Verify wallet connection:**
   Make sure you're connected as an investor (not farmer or admin).

4. **Check for loading overlay:**
   If there's a persistent loading spinner, it might be blocking clicks.

5. **Inspect button elements:**
   In browser DevTools, right-click a button → Inspect
   - Verify it has classes: `btn`, `btn-primary` or `btn-secondary`, and `grove-invest-btn` or `grove-details-btn`
   - Verify it has `data-grove-id` attribute with a value

### Common Issues:

- **"Grove not found" error**: ID mismatch between string and number (now fixed with `==`)
- **No console logs**: Event listeners not attached - check if `renderAvailableGroves()` completed
- **Buttons grayed out**: Check CSS for `pointer-events: none` or `disabled` attribute
- **Click not registering**: Check for overlays or z-index issues blocking the buttons

## Test Files Created

- `test-investor-buttons.html` - Standalone button test
- `debug-investor-portal.js` - Console debug script
- `test-investor-groves-load.ts` - API test for grove data

Run the debug script in browser console:
```javascript
// Copy and paste debug-investor-portal.js content into browser console
```
