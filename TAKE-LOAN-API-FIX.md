# Take Loan API Fix

## Issue

When trying to take out a loan, the API request was failing with:
```
POST http://localhost:3001/api/lending/take-loan 400 (Bad Request)
Error: Missing required parameters: assetAddress, loanAmount, borrowerAddress
```

## Root Cause

The frontend API methods `takeOutLoan()` and `repayLoan()` were not sending the required `borrowerAddress` parameter to the backend.

**Backend expects:**
```javascript
{
  assetAddress: string,
  loanAmount: number,
  borrowerAddress: string  // ← Missing!
}
```

**Frontend was sending:**
```javascript
{
  assetAddress: string,
  loanAmount: number
  // borrowerAddress missing!
}
```

## The Fix

Updated `frontend/js/api.js` to include the borrower address from the wallet manager:

### takeOutLoan Method

**Before:**
```javascript
async takeOutLoan(assetAddress, loanAmount) {
    return this.request('/api/lending/take-loan', {
        method: 'POST',
        body: { assetAddress, loanAmount }
    });
}
```

**After:**
```javascript
async takeOutLoan(assetAddress, loanAmount) {
    const borrowerAddress = window.walletManager?.getAccountId();
    if (!borrowerAddress) {
        throw new Error('Wallet not connected');
    }
    return this.request('/api/lending/take-loan', {
        method: 'POST',
        body: { assetAddress, loanAmount, borrowerAddress }
    });
}
```

### repayLoan Method

**Before:**
```javascript
async repayLoan(assetAddress) {
    return this.request('/api/lending/repay-loan', {
        method: 'POST',
        body: { assetAddress }
    });
}
```

**After:**
```javascript
async repayLoan(assetAddress) {
    const borrowerAddress = window.walletManager?.getAccountId();
    if (!borrowerAddress) {
        throw new Error('Wallet not connected');
    }
    return this.request('/api/lending/repay-loan', {
        method: 'POST',
        body: { assetAddress, borrowerAddress }
    });
}
```

## What Changed

Both methods now:
1. Get the borrower address from `window.walletManager.getAccountId()`
2. Check if wallet is connected (throw error if not)
3. Include `borrowerAddress` in the request body

## Testing

To test the fix:

1. **Restart the frontend server:**
   ```
   restart-frontend-server.bat
   ```

2. **Make sure you have coffee tree tokens:**
   - Go to Browse Groves
   - Purchase tokens from any grove
   - This gives you collateral for borrowing

3. **Navigate to Lending & Liquidity:**
   - Scroll down to the "Loans" section
   - You should see your holdings value and max loan amount

4. **Take out a loan:**
   - Click "Take Out Loan"
   - Enter the loan amount
   - Click "Confirm Loan"
   - Should succeed without errors

5. **Verify:**
   - Success message appears
   - Your active loan is displayed
   - Loan details show correctly

## Related Fixes

This is the same pattern as the earlier fixes for:
- `provideLiquidity()` - needed `providerAddress`
- `withdrawLiquidity()` - needed `providerAddress`
- `takeOutLoan()` - needed `borrowerAddress` ← This fix
- `repayLoan()` - needed `borrowerAddress` ← This fix

All lending/borrowing API methods now properly include the user's wallet address.

## Files Modified

- `frontend/js/api.js` - Added borrowerAddress parameter to loan methods

## Summary

✅ **Fixed:** takeOutLoan now sends borrowerAddress  
✅ **Fixed:** repayLoan now sends borrowerAddress  
✅ **Result:** Loan operations will now succeed  
✅ **Action:** Restart frontend server to apply changes  

The take loan and repay loan functionality should now work correctly!
