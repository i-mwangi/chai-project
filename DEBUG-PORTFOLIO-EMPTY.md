# Debug: Portfolio Showing Empty

## Current Status
✅ Database check shows: **0 holdings**  
❌ This means purchases are NOT being recorded

## Steps to Debug

### 1. Restart API Server
```bash
restart-api-server.bat
```
**Important**: The API server MUST be restarted to pick up the new logging.

### 2. Open TWO Console Windows

**Console 1: API Server Logs**
- Look at the terminal where the API server is running
- Watch for these messages when you make a purchase

**Console 2: Browser Console (F12)**
- Open Developer Tools in your browser
- Go to Console tab
- Watch for frontend messages

### 3. Make a Test Purchase

1. Connect wallet as investor
2. Go to Browse Groves
3. Click "Invest Now" on any grove
4. Enter token amount (e.g., 10)
5. Click "Purchase Tokens"

### 4. Check Logs

**In Browser Console, you should see:**
```
[InvestorPortal] Purchasing 10 tokens for grove 1 as investor 0.0.123456
```

**In API Server Console, you should see:**
```
[InvestmentAPI] Purchase request received: { groveId: 1, tokenAmount: 10, investorAddress: '0.0.123456' }
[InvestmentAPI] Inserting holding: { holderAddress: '0.0.123456', groveId: 1, tokenAmount: 10, ... }
[InvestmentAPI] Holding created: 1
[InvestmentAPI] Purchase successful!
```

### 5. Possible Issues

#### Issue A: No browser console log
**Problem**: Frontend not calling the API  
**Check**:
- Is wallet connected?
- Is user type set to 'investor'?
- Any JavaScript errors in console?

#### Issue B: Browser log but no API log
**Problem**: API request not reaching server  
**Check**:
- Is API server running on port 3001?
- Check Network tab in DevTools for failed requests
- Look for CORS errors

#### Issue C: API receives request but fails
**Problem**: Validation or database error  
**Check API logs for**:
- "Missing required parameters" - investorAddress might be undefined
- Database errors
- Grove not found errors

#### Issue D: API succeeds but portfolio still empty
**Problem**: Portfolio loading wrong investor address  
**Check**:
- Does investor address in purchase match portfolio query?
- Run: `npx tsx check-database-holdings.ts` to see what's in DB

### 6. Manual Test of API

Test the API directly:
```bash
npx tsx test-purchase-api.ts
```

### 7. Check Database After Purchase

```bash
npx tsx check-database-holdings.ts
```

Should show your holding if purchase worked.

### 8. Test Portfolio API

```bash
npx tsx test-portfolio-api.ts YOUR_INVESTOR_ADDRESS
```

Replace YOUR_INVESTOR_ADDRESS with the actual address from your wallet.

## Common Problems

### Problem: investorAddress is undefined
**Solution**: Check that `window.walletManager.getAccountId()` returns a value

### Problem: API not receiving requests
**Solution**: 
- Check API server is running
- Check frontend is pointing to correct API URL
- Check for CORS issues

### Problem: Purchase succeeds but portfolio query fails
**Solution**: 
- Investor address mismatch
- Check exact address format (with/without quotes, case sensitivity)

## Quick Test Script

Run this to test the entire flow:
```bash
# 1. Check current holdings
npx tsx check-database-holdings.ts

# 2. Make a purchase through UI

# 3. Check holdings again
npx tsx check-database-holdings.ts

# 4. Test portfolio API
npx tsx test-portfolio-api.ts 0.0.YOUR_ADDRESS
```

## What to Share

If still not working, share:
1. Browser console output (all messages)
2. API server console output (all messages)
3. Output of `check-database-holdings.ts`
4. Your investor wallet address
