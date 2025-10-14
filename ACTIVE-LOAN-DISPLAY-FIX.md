# Active Loan Display Fix

## Problem

User has an active loan (confirmed by error: "Borrower already has an active loan"), but the "Your Active Loan" section with the "Repay Loan" button is not showing up.

## Root Cause

**Response structure mismatch** between backend and frontend.

**Backend was returning:**
```javascript
{
  success: true,
  data: { ...loan details... }
}
```

**Frontend was expecting:**
```javascript
{
  success: true,
  loan: { ...loan details... }
}
```

The frontend code checks:
```javascript
if (loanResponse && loanResponse.success && loanResponse.loan) {
    // Show active loan section
}
```

Since `loanResponse.loan` was undefined (it was in `loanResponse.data`), the condition failed and the active loan section remained hidden.

## The Fix

Updated `api/lending-api.ts` in the `getLoanDetails` method:

**Before:**
```typescript
sendResponse(res, 200, {
    success: true,
    data: loanWithHealth
})
```

**After:**
```typescript
sendResponse(res, 200, {
    success: true,
    loan: loanWithHealth
})
```

## What This Fixes

### Before Fix
- ❌ Active loan exists but section is hidden
- ❌ "Repay Loan" button not visible
- ❌ "Take Out Loan" button still enabled
- ❌ Error when trying to take another loan
- ❌ User stuck with no way to repay

### After Fix
- ✅ Active loan section displays correctly
- ✅ "Repay Loan" button is visible
- ✅ "Take Out Loan" button shows "Active Loan Exists"
- ✅ Loan details are shown
- ✅ User can repay their loan

## Testing

### 1. Restart API Server
```bash
restart-api-server.bat
```

### 2. Refresh the Page
- Go to Lending & Liquidity
- Scroll down to Loans section

### 3. You Should Now See

```
Loans
Borrow against your coffee tree token holdings

Available Loan Amount
Your Holdings Value: $41,825.00
Max Loan Amount: $0.00
[Active Loan Exists] ← Button disabled

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your Active Loan ← THIS SECTION NOW APPEARS!

Active Loan Details
Loan Amount: $X,XXX.XX
Collateral Locked: $X,XXX.XX worth of tokens
Repayment Amount: $X,XXX.XX (includes 10% interest)
Loan Date: [date]
Due Date: [date]
Status: Active

Health Status
Collateral Value: $X,XXX.XX
Loan Value: $X,XXX.XX
Collateralization Ratio: XXX%
Health Factor: X.XX

[Repay Loan] ← BUTTON NOW VISIBLE!
```

### 4. Repay Your Loan
- Click "Repay Loan"
- Confirm the repayment
- Your collateral will be released
- Active loan section will disappear
- "Take Out Loan" button will be enabled again

## Files Modified

- `api/lending-api.ts` - Changed response structure in `getLoanDetails` method

## Summary

**Issue:** Active loan section not displaying due to response structure mismatch  
**Fix:** Changed API response from `data` to `loan` property  
**Result:** Active loan section now displays with "Repay Loan" button  
**Action:** Restart API server and refresh page  

The "Repay Loan" button will now be visible!
