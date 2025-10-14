# Claim Earnings Flow - Complete Explanation 💰

## What is "Claim Earnings"?

When farmers harvest coffee and sell it, the revenue is distributed to token holders (investors). The "Claim Earnings" button allows you to collect your share of that revenue.

## The Complete Flow

### 1. Background: How Earnings Are Created

```
Farmer harvests coffee
    ↓
Farmer reports harvest (weight, quality)
    ↓
System calculates revenue (harvest × coffee price)
    ↓
Revenue is distributed proportionally to token holders
    ↓
Your share appears as "Pending Earnings"
```

### 2. When You Click "Claim Earnings"

#### Step 1: Button Click
```javascript
// You click the button
<button class="claim-earnings-btn" data-distribution-id="123">
    Claim Earnings
</button>
```

#### Step 2: Get Your Information
```javascript
const distributionId = "123";  // Which distribution
const holderAddress = "0.0.789012";  // Your wallet address
```

#### Step 3: Call API
```javascript
POST /api/harvest/claim-earnings
Body: {
    distributionId: "123",
    holderAddress: "0.0.789012"
}
```

#### Step 4: API Processes Claim
The API:
1. Verifies you own tokens in that grove
2. Calculates your share of revenue
3. Checks if you already claimed
4. Records the claim in database
5. Transfers USDC to your wallet

#### Step 5: Database Updates
```sql
-- Mark distribution as claimed
UPDATE revenue_distributions
SET status = 'claimed',
    claimedAt = NOW()
WHERE distributionId = '123'
  AND holderAddress = '0.0.789012'
```

#### Step 6: Money Transfer
```
Your USDC Balance: $1,000
+ Claimed Earnings: $150
= New Balance: $1,150 ✅
```

#### Step 7: UI Updates
- Shows success message
- Updates your USDC balance
- Removes from "Pending Earnings"
- Adds to "Earnings History"

## Detailed Example

### Scenario:
- You own 100 tokens in "Test Grove"
- Farmer harvested 1,000 kg of coffee
- Coffee sold for $5,000
- Grove has 1,000 total tokens
- Your share: (100/1,000) × $5,000 = $500

### Step-by-Step:

**1. Earnings Section Shows:**
```
┌─────────────────────────────────────┐
│ Pending Earnings                    │
├─────────────────────────────────────┤
│ Test Grove                          │
│ Distribution Date: 10/12/2025       │
│ Your Share: $500.00                 │
│ Status: Pending                     │
│                                     │
│ [Claim Earnings] ← You click this   │
└─────────────────────────────────────┘
```

**2. Loading Spinner Appears:**
```
⏳ Claiming earnings...
```

**3. API Call:**
```javascript
// Frontend sends:
{
  distributionId: "dist_123",
  holderAddress: "0.0.789012"
}

// API responds:
{
  success: true,
  amount: 500,
  transactionHash: "0xabc123...",
  message: "Earnings claimed successfully"
}
```

**4. Success Notification:**
```
✅ Earnings claimed successfully!
💰 Successfully claimed $500 USDC from harvest distribution!
```

**5. Balance Updates:**
```
Before: USDC Balance: $1,000
After:  USDC Balance: $1,500 ✅
```

**6. Earnings Section Updates:**
```
┌─────────────────────────────────────┐
│ Pending Earnings                    │
├─────────────────────────────────────┤
│ No pending earnings                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Earnings History                    │
├─────────────────────────────────────┤
│ Test Grove                          │
│ Claimed: 10/12/2025                 │
│ Amount: $500.00                     │
│ Status: Claimed ✅                  │
└─────────────────────────────────────┘
```

## Code Flow

### Frontend (investor-portal.js):

```javascript
// 1. Button clicked
btn.addEventListener('click', async (e) => {
    const distributionId = e.currentTarget.dataset.distributionId;
    const holderAddress = window.walletManager.getAccountId();
    await this.claimEarnings(distributionId, holderAddress);
});

// 2. Claim earnings function
async claimEarnings(distributionId, holderAddress) {
    // Show loading
    window.walletManager.showLoading('Claiming earnings...');
    
    // Call API
    const response = await window.coffeeAPI.claimEarnings(
        distributionId, 
        holderAddress
    );
    
    if (response.success) {
        // Show success message
        window.walletManager.showToast('Earnings claimed!', 'success');
        
        // Show notification with amount
        window.notificationManager.success(
            `Successfully claimed $${response.amount} USDC!`
        );
        
        // Refresh balance
        await window.balancePoller.refreshAfterTransaction(
            response.transactionHash, 
            ['usdc', 'pending']
        );
        
        // Reload earnings to show updated status
        await this.loadEarnings(holderAddress);
    }
}
```

### Backend (harvest-reporting.ts):

```typescript
// API endpoint
async claimEarnings(distributionId, holderAddress) {
    // 1. Find the distribution
    const distribution = await db.query.revenueDistributions.findFirst({
        where: and(
            eq(revenueDistributions.distributionId, distributionId),
            eq(revenueDistributions.holderAddress, holderAddress)
        )
    });
    
    // 2. Validate
    if (!distribution) {
        return { success: false, error: 'Distribution not found' };
    }
    
    if (distribution.status === 'claimed') {
        return { success: false, error: 'Already claimed' };
    }
    
    // 3. Calculate amount
    const amount = distribution.amount;
    
    // 4. Transfer USDC (on Hedera blockchain)
    const transactionHash = await transferUSDC(
        holderAddress, 
        amount
    );
    
    // 5. Update database
    await db.update(revenueDistributions)
        .set({
            status: 'claimed',
            claimedAt: Date.now(),
            transactionHash: transactionHash
        })
        .where(eq(revenueDistributions.id, distribution.id));
    
    // 6. Return success
    return {
        success: true,
        amount: amount,
        transactionHash: transactionHash
    };
}
```

## What You See

### Before Claiming:
```
Your Portfolio:
- Tokens: 100 in Test Grove
- USDC Balance: $1,000
- Pending Earnings: $500 ⏳

Earnings Section:
┌─────────────────────────────────┐
│ 💰 Pending: $500.00             │
│ [Claim Earnings]                │
└─────────────────────────────────┘
```

### After Claiming:
```
Your Portfolio:
- Tokens: 100 in Test Grove (unchanged)
- USDC Balance: $1,500 ✅ (+$500)
- Pending Earnings: $0

Earnings Section:
┌─────────────────────────────────┐
│ ✅ Claimed: $500.00             │
│ Date: 10/12/2025                │
└─────────────────────────────────┘
```

## Key Points

### 1. Earnings Come From:
- Coffee harvest sales
- Distributed proportionally to token holders
- Based on your token ownership percentage

### 2. You Can Claim When:
- ✅ Harvest has been reported
- ✅ Revenue has been distributed
- ✅ Status shows "Pending"
- ❌ Cannot claim twice
- ❌ Cannot claim if already claimed

### 3. What Happens:
- USDC transferred to your wallet
- Balance updates immediately
- Earnings marked as "Claimed"
- Transaction recorded on blockchain

### 4. Security:
- Only you can claim your earnings
- Verified by wallet address
- Cannot claim someone else's earnings
- Blockchain transaction is permanent

## Real-World Analogy

Think of it like:
- **Stock Dividends**: You own shares, company pays dividends, you claim them
- **Rental Income**: You own property, tenant pays rent, you collect it
- **Interest**: You have savings, bank pays interest, you withdraw it

In this case:
- You own **coffee grove tokens**
- Farmer sells **coffee harvest**
- You claim **your share of revenue**

## Summary

**Claim Earnings Button:**
1. Identifies which distribution (harvest event)
2. Gets your wallet address
3. Calls API to process claim
4. API verifies ownership and calculates share
5. Transfers USDC to your wallet
6. Updates database (marked as claimed)
7. Refreshes your balance
8. Shows success message
9. Updates UI to show claimed status

**Result**: You receive USDC payment for your share of the coffee harvest revenue! 💰☕
