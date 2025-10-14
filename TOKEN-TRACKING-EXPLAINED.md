# Token Tracking System Explained 📊

## Yes! Tokens Are Tracked and Subtracted

When you purchase tokens, the system automatically tracks availability and prevents overselling.

## How It Works

### 1. Total Tokens Per Grove
Each grove has a total number of tokens based on:
```javascript
totalTokens = grove.totalTokensIssued || (grove.treeCount * grove.tokensPerTree)
```

**Example:**
- Grove has 8,000 trees
- 1 token per tree (default)
- **Total tokens: 8,000**

### 2. Calculating Available Tokens
When you try to purchase, the API:

```javascript
// Step 1: Get total tokens already sold
SELECT SUM(tokenAmount) FROM tokenHoldings 
WHERE groveId = X AND isActive = true

// Step 2: Calculate available
availableTokens = totalTokens - soldTokens
```

**Example:**
- Total tokens: 8,000
- Already sold: 3,500
- **Available: 4,500**

### 3. Validation Before Purchase
```javascript
if (tokenAmount > availableTokens) {
    return error: "Insufficient tokens available. 
                   Available: 4,500, Requested: 5,000"
}
```

### 4. Recording the Purchase
If validation passes:
```javascript
// Insert into database
INSERT INTO tokenHoldings (
    holderAddress: "0.0.789012",
    groveId: 1,
    tokenAmount: 10,
    purchasePrice: 2500,  // $25 in cents
    isActive: true
)
```

### 5. Next Purchase Sees Updated Count
Next time someone tries to buy:
- Total tokens: 8,000
- Already sold: 3,500 + 10 = **3,510**
- **Available: 4,490** ✅

## Real Example

### Initial State:
```
Grove: Test Grove
Total Tokens: 8,000
Sold: 0
Available: 8,000
```

### After You Buy 10 Tokens:
```
Grove: Test Grove
Total Tokens: 8,000
Sold: 10
Available: 7,990
```

### After Another Investor Buys 50:
```
Grove: Test Grove
Total Tokens: 8,000
Sold: 60
Available: 7,940
```

### If Someone Tries to Buy 8,000:
```
❌ Error: "Insufficient tokens available. 
           Available: 7,940, Requested: 8,000"
```

## Where You See This

### 1. Browse Groves Section
Each grove card shows:
```
Tokens Available: 7,940
```
This updates in real-time based on purchases.

### 2. Purchase Modal
The input field has:
```html
<input type="number" 
       min="1" 
       max="7940"  ← Dynamically set
       required>
```

### 3. API Response
If you try to buy too many:
```json
{
  "success": false,
  "error": "Insufficient tokens available. Available: 7940, Requested: 8000"
}
```

## Database Schema

### tokenHoldings Table:
```sql
CREATE TABLE tokenHoldings (
    id INTEGER PRIMARY KEY,
    holderAddress TEXT,      -- Who bought
    groveId INTEGER,          -- Which grove
    tokenAmount INTEGER,      -- How many tokens
    purchasePrice INTEGER,    -- Price paid (cents)
    purchaseDate INTEGER,     -- When purchased
    isActive BOOLEAN          -- Still owned?
)
```

### Query to See All Holdings:
```bash
npx tsx check-database-holdings.ts
```

Shows:
```
Total active holdings: 2

Holding ID: 1
  Investor: 0.0.TEST_INVESTOR
  Grove ID: 1
  Tokens: 10
  
Holding ID: 2
  Investor: 0.0.789012
  Grove ID: 1
  Tokens: 5

Total tokens sold for Grove 1: 15
```

## Token Lifecycle

### 1. Grove Created
```
Farmer creates grove with 8,000 trees
→ 8,000 tokens available
```

### 2. Tokens Purchased (Primary Market)
```
Investor buys 100 tokens
→ 7,900 tokens available
→ Investor owns 100 tokens
```

### 3. Tokens Listed for Sale (Secondary Market)
```
Investor lists 50 tokens on marketplace
→ Still 7,900 available (already sold)
→ Other investors can buy from marketplace
```

### 4. Tokens Sold on Marketplace
```
Another investor buys 50 from marketplace
→ Still 7,900 available (no new tokens issued)
→ Ownership transfers between investors
```

### 5. All Tokens Sold
```
When available reaches 0:
→ Grove shows "SOLD OUT"
→ Can only buy from marketplace
```

## Current Implementation

### ✅ What Works:
- Token counting and subtraction
- Availability validation
- Prevents overselling
- Multiple investors can buy from same grove
- Database tracks all holdings

### ⚠️ Current Limitations:
1. **Price is fixed** at $25/token (not dynamic)
2. **No token burning** (tokens stay in circulation)
3. **Marketplace doesn't reduce availability** (secondary market)
4. **No fractional tokens** (whole numbers only)

### 🔄 How to See It in Action:

1. **Check initial availability**:
   ```bash
   # Look at Browse Groves
   # Note "Tokens Available" number
   ```

2. **Buy some tokens**:
   ```bash
   # Purchase 10 tokens
   ```

3. **Refresh Browse Groves**:
   ```bash
   # "Tokens Available" should be 10 less
   ```

4. **Check database**:
   ```bash
   npx tsx check-database-holdings.ts
   # Shows your purchase recorded
   ```

## Testing Token Limits

Try this:
1. Note available tokens (e.g., 4,000)
2. Try to buy MORE than available (e.g., 5,000)
3. Should get error: "Insufficient tokens available"
4. Try to buy LESS than available (e.g., 10)
5. Should succeed

## Summary

✅ **Yes, tokens are counted and subtracted!**
- Each purchase reduces available tokens
- System prevents overselling
- Multiple investors can buy from same grove
- All tracked in database
- Real-time availability updates

The system works like a real tokenized asset platform! 🎉
