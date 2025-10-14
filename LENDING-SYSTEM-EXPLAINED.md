# Lending System - Complete Guide

## Overview

The Coffee Tree Platform has a **two-sided lending system**:

### 1. **Liquidity Provision** (Lenders)
Investors provide USDC or other stablecoins to lending pools and earn APY returns.

### 2. **Borrowing** (Borrowers)
Investors can borrow against their coffee tree token holdings as collateral.

---

## How It Works

### For Liquidity Providers (Lenders)

**What you see:**
- Available lending pools (USDC, KES, etc.)
- Current APY for each pool
- Total Value Locked (TVL)
- Available liquidity
- Utilization rate

**What you can do:**
1. Click "Provide Liquidity" on any pool
2. Enter the amount you want to provide
3. Receive LP (Liquidity Provider) tokens
4. Earn APY on your provided liquidity
5. Withdraw liquidity anytime (if available)

**Your earnings come from:**
- Interest paid by borrowers
- The more the pool is utilized, the higher the APY

---

### For Borrowers

**What you see:**
- Your coffee tree token holdings value
- Max loan amount you can borrow (holdings value ÷ 1.25)
- Loan terms and conditions
- Active loan status (if you have one)

**How to borrow:**

1. **You need coffee tree tokens first**
   - Go to "Browse Groves" section
   - Purchase tokens from available groves
   - These tokens become your collateral

2. **Check your borrowing power**
   - Navigate to Lending & Liquidity section
   - Scroll down to the "Loans" section
   - See your "Max Loan Amount"

3. **Take out a loan**
   - Click "Take Out Loan" button
   - Enter desired loan amount (up to your max)
   - Confirm the transaction
   - Receive USDC to your wallet

4. **Repay your loan**
   - View your active loan details
   - Click "Repay Loan"
   - Pay back 110% of loan amount (10% interest)
   - Your collateral is released

**Loan Terms:**
- **Collateral Required:** 125% of loan value
- **Liquidation Threshold:** If collateral drops to 90% of loan value
- **Interest Rate:** 10% of loan amount
- **Repayment Amount:** 110% of original loan

---

## Why You Might Not See the Borrowing Section

### The borrowing section IS there - you just need to scroll!

**The page layout from top to bottom:**
1. "Available Lending Pools" (USDC, KES cards)
2. "Your Liquidity Positions" (your LP tokens)
3. **"Loans" section** ← SCROLL DOWN TO HERE

### How to find it:

1. Click on "Lending & Liquidity" tab in the investor portal
2. **Scroll down past the lending pools**
3. **Scroll down past your liquidity positions**
4. You'll see a section titled **"Loans"** with subtitle "Borrow against your coffee tree token holdings"

### What you'll see in the Loans section:

- **Available Loan Amount card** showing:
  - Your Holdings Value: $X.XX
  - Max Loan Amount: $X.XX
  - Collateralization Ratio: 125%
  - Loan Terms (bullet points)
  - **"Take Out Loan" button**

- **Your Active Loan** (if you have one)

### If the "Take Out Loan" button is disabled:

- You don't have any coffee tree tokens yet
- Your holdings value shows $0.00
- **Solution:** Go to "Browse Groves" → Purchase tokens → Come back to Lending

---

## Complete User Flow Example

### Scenario: Investor wants to borrow $1,000

**Step 1: Get Collateral**
```
Browse Groves → Find a grove → Purchase $1,250 worth of tokens
(Need $1,250 in tokens to borrow $1,000 due to 125% collateralization)
```

**Step 2: Check Borrowing Power**
```
Lending & Liquidity → Scroll to "Loans" section
Holdings Value: $1,250
Max Loan Amount: $1,000
```

**Step 3: Take Loan**
```
Click "Take Out Loan" → Enter $1,000 → Confirm
Receive: $1,000 USDC
Locked Collateral: $1,250 in coffee tokens
```

**Step 4: Repay Later**
```
When ready: Click "Repay Loan"
Pay: $1,100 USDC (original $1,000 + 10% interest)
Get back: $1,250 in coffee tokens
```

---

## Current Page Layout

When you're on the **Lending & Liquidity** section, you should see:

```
┌─────────────────────────────────────────┐
│  Lending & Liquidity                    │
│  Provide liquidity to earn returns or   │
│  take loans against your holdings       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Available Lending Pools                │
│  ┌──────────┐  ┌──────────┐            │
│  │ USDC     │  │ KES      │            │
│  │ 8.50% APY│  │ 12.00%   │            │
│  │ [Provide]│  │ [Provide]│            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Your Liquidity Positions               │
│  (Shows your LP tokens if you provided) │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Loans                                  │
│  Borrow against your coffee tree tokens │
│                                         │
│  Available Loan Amount                  │
│  Your Holdings Value: $X.XX             │
│  Max Loan Amount: $X.XX                 │
│  Collateralization Ratio: 125%          │
│                                         │
│  [Take Out Loan] ← This button          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Your Active Loan (if you have one)     │
│  Shows loan details and repay button    │
└─────────────────────────────────────────┘
```

---

## Troubleshooting

**"I don't see the Loans section at all"**
- Scroll down on the Lending & Liquidity page
- Check browser console (F12) for JavaScript errors
- Try refreshing the page

**"Take Out Loan button is disabled"**
- You need coffee tree tokens first
- Go to Browse Groves and purchase tokens
- Come back to Lending section

**"My holdings value shows $0.00"**
- You haven't purchased any coffee tree tokens yet
- Purchase tokens from Browse Groves section
- The system will automatically calculate your borrowing power

**"I can't provide liquidity"**
- Make sure you have USDC in your wallet
- Check that the pool has available capacity
- Verify your wallet is connected

---

## API Endpoints Used

**Lending Pools:**
- `GET /api/lending/pools` - Get all lending pools
- `GET /api/lending/pool-stats?assetAddress=X` - Get pool statistics
- `POST /api/lending/provide-liquidity` - Provide liquidity
- `POST /api/lending/withdraw-liquidity` - Withdraw liquidity

**Borrowing:**
- `POST /api/lending/calculate-loan-terms` - Calculate loan terms
- `POST /api/lending/take-loan` - Take out a loan
- `GET /api/lending/loan-details?borrowerAddress=X&assetAddress=Y` - Get loan details
- `POST /api/lending/repay-loan` - Repay a loan

---

## Next Steps

1. **If you want to lend:** Click "Provide Liquidity" on any pool
2. **If you want to borrow:** 
   - First purchase coffee tree tokens from Browse Groves
   - Then return to Lending section and scroll to "Loans"
   - Click "Take Out Loan"

The system is fully functional - both sides work together to create a complete lending marketplace!
