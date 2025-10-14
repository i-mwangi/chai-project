# Portfolio Not Showing Investments - FIX

## Problem
After purchasing tokens, the investments don't appear in the Portfolio section.

## Root Causes Found

### 1. Missing investorAddress Parameter ✅ FIXED
The `purchaseTokens` API call was missing the `investorAddress` parameter.

**Fixed in**: `frontend/js/investor-portal.js` line 685
```javascript
// Before:
const response = await window.coffeeAPI.purchaseTokens(groveId, tokenAmount);

// After:
const response = await window.coffeeAPI.purchaseTokens(groveId, tokenAmount, investorAddress);
```

### 2. renderHoldings Using Wrong Property Names ⚠️ NEEDS FIX
The `renderHoldings()` method tries to access properties that don't exist in the API response:
- Uses `holding.currentWorth` but API doesn't return this
- Uses `holding.currentValue` but API doesn't return this  
- Uses `holding.totalInvestment` but API doesn't return this
- Uses `holding.earnings` but API doesn't return this

**What API Actually Returns:**
```javascript
{
  holdingId, groveId, groveName, tokenAmount,
  purchasePrice, purchaseDate, location,
  coffeeVariety, currentHealthScore, treeCount
}
```

**Solution**: Calculate these values from the available data.

## Manual Fix Required

In `frontend/js/investor-portal.js`, find the `renderHoldings()` method (around line 799) and replace line 841:

**Change this line:**
```javascript
<span class="current-value">${holding.currentWorth.toFixed(2)}</span>
```

**To:**
```javascript
<span class="current-value">$${currentWorth.toFixed(2)}</span>
```

**And change lines 865-869:**
```javascript
<span>${holding.purchasePrice.toFixed(2)}</span>
<span>${holding.currentValue.toFixed(2)}</span>
<span>${holding.totalInvestment.toFixed(2)}</span>
<span class="text-success">${holding.earnings.toFixed(2)}</span>
```

**To:**
```javascript
<span>$${purchasePrice.toFixed(2)}</span>
<span>$${currentValue.toFixed(2)}</span>
<span>$${totalInvestment.toFixed(2)}</span>
<span class="text-success">$${earnings.toFixed(2)}</span>
```

**And change line 860:**
```javascript
<span>${holding.tokenAmount}</span>
```

**To:**
```javascript
<span>${tokenAmount}</span>
```

## Testing Steps

1. **Restart both servers:**
   ```bash
   restart-api-server.bat
   restart-frontend-server.bat
   ```

2. **Test the purchase:**
   - Connect wallet as investor
   - Go to Browse Groves
   - Click "Invest Now" on any grove
   - Purchase some tokens
   - Check browser console for: `[InvestorPortal] Purchasing X tokens for grove Y as investor Z`

3. **Check portfolio:**
   - Navigate to Portfolio section
   - Check console for: `[InvestorPortal] Holdings to render: X`
   - Your investment should now appear!

4. **Verify with API test:**
   ```bash
   npx tsx test-portfolio-api.ts YOUR_INVESTOR_ADDRESS
   ```

## Alternative: Use the Fixed File

I've created `fix-render-holdings.js` with the complete corrected method. You can:
1. Copy the method from that file
2. Replace the entire `renderHoldings()` method in `investor-portal.js`

## What Should Happen

After the fix:
- ✅ Token purchases record the investor address
- ✅ Portfolio loads holdings from database
- ✅ Holdings display with correct calculated values
- ✅ Shows: tokens owned, purchase price, total investment, etc.
- ✅ Displays grove details: variety, location, health score

## Debug Logs

Watch the console for these messages:
```
[InvestorPortal] Purchasing 10 tokens for grove 1 as investor 0.0.123456
[InvestorPortal] Loading portfolio for investor: 0.0.123456
[InvestorPortal] Portfolio loaded: {holdings: Array(1), totalInvestment: 250, ...}
[InvestorPortal] Holdings count: 1
[InvestorPortal] Rendering holdings...
[InvestorPortal] Holdings to render: 1
[InvestorPortal] Holdings rendered successfully
```

If you see "Holdings count: 0", the purchase didn't record properly.
If you see "Holdings count: 1" but nothing displays, it's the rendering issue.
