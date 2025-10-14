# Where is the Borrowing Section?

## TL;DR: **SCROLL DOWN!**

The borrowing/loans section is on the same page as the lending pools. You just need to scroll down.

---

## Step-by-Step Guide

### 1. Navigate to Lending & Liquidity
Click on the "Lending & Liquidity" tab in the investor portal navigation.

### 2. You'll see this first (TOP OF PAGE):
```
┌─────────────────────────────────────────┐
│  Available Lending Pools                │
│  ┌──────────┐  ┌──────────┐            │
│  │ USDC     │  │ KES      │            │
│  │ 8.50% APY│  │ 12.00%   │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

### 3. Then this (MIDDLE OF PAGE):
```
┌─────────────────────────────────────────┐
│  Your Liquidity Positions               │
│  (Your LP tokens if you provided any)   │
└─────────────────────────────────────────┘
```

### 4. **SCROLL DOWN** to see this (BOTTOM OF PAGE):
```
┌─────────────────────────────────────────┐
│  Loans                                  │ ← HERE!
│  Borrow against your coffee tree tokens │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Available Loan Amount           │   │
│  │                                 │   │
│  │ Your Holdings Value: $0.00      │   │
│  │ Max Loan Amount: $0.00          │   │
│  │ Collateralization Ratio: 125%   │   │
│  │                                 │   │
│  │ Loan Terms:                     │   │
│  │ • Collateral Required: 125%     │   │
│  │ • Liquidation Threshold: 90%    │   │
│  │ • Repayment Amount: 110%        │   │
│  │ • Interest Rate: 10%            │   │
│  │                                 │   │
│  │ [Take Out Loan]  ← THIS BUTTON  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Why is the button disabled?

The "Take Out Loan" button will be **disabled** (grayed out) if:

- You don't have any coffee tree tokens
- Your holdings value is $0.00

### To enable it:

1. Go to **"Browse Groves"** section
2. Find a grove you like
3. Click **"View Details"**
4. Click **"Purchase Tokens"**
5. Buy some tokens (e.g., $1,250 worth)
6. Go back to **"Lending & Liquidity"**
7. **Scroll down** to the Loans section
8. Now you'll see:
   - Holdings Value: $1,250.00
   - Max Loan Amount: $1,000.00
   - **"Take Out Loan" button is now ENABLED**

---

## Complete Flow Example

### Scenario: I want to borrow $500

**Step 1: Get collateral**
```
Browse Groves → Select a grove → Purchase $625 worth of tokens
(Need $625 to borrow $500 due to 125% collateralization)
```

**Step 2: Navigate to borrowing**
```
Lending & Liquidity → SCROLL DOWN → Find "Loans" section
```

**Step 3: Check your borrowing power**
```
Holdings Value: $625.00
Max Loan Amount: $500.00  ← Perfect!
```

**Step 4: Take the loan**
```
Click "Take Out Loan" → Enter $500 → Confirm
```

**Step 5: Receive funds**
```
You receive: $500 USDC in your wallet
Your tokens are locked as collateral
```

**Step 6: Repay later**
```
When ready: Scroll to "Your Active Loan" → Click "Repay Loan"
Pay: $550 ($500 + 10% interest)
Get back: Your $625 worth of tokens
```

---

## Visual Hierarchy

The Lending & Liquidity page has **3 main sections** stacked vertically:

```
┌─────────────────────────────────────────┐
│                                         │
│  1. LENDING POOLS (Top)                 │
│     - Provide liquidity                 │
│     - Earn APY                          │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  2. YOUR POSITIONS (Middle)             │
│     - Your LP tokens                    │
│     - Withdraw liquidity                │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  3. LOANS (Bottom) ← SCROLL HERE        │
│     - Borrow against tokens             │
│     - Take out loans                    │
│     - Repay loans                       │
│                                         │
└─────────────────────────────────────────┘
```

---

## Still can't find it?

### Checklist:

- [ ] I'm on the "Lending & Liquidity" tab (not Portfolio, not Browse Groves)
- [ ] I scrolled all the way down the page
- [ ] I can see "Available Lending Pools" at the top
- [ ] I can see "Your Liquidity Positions" in the middle
- [ ] I scrolled past both of those sections

### If you still don't see it:

1. Open browser console (F12)
2. Type: `document.querySelector('.loans-container')`
3. If it returns an element, the section exists
4. Type: `document.querySelector('.loans-container').scrollIntoView()`
5. This will scroll directly to the loans section

### Or try this in console:
```javascript
// Find and scroll to loans section
const loansSection = document.querySelector('.loans-container');
if (loansSection) {
    loansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    loansSection.style.border = '3px solid red'; // Highlight it
    console.log('✓ Loans section found and highlighted!');
} else {
    console.log('✗ Loans section not found');
}
```

---

## Summary

**The borrowing functionality is fully implemented and visible on the page.**

You just need to:
1. Navigate to "Lending & Liquidity"
2. **Scroll down** past the lending pools
3. **Scroll down** past your liquidity positions
4. You'll see the "Loans" section with the "Take Out Loan" button

The button will be enabled once you have coffee tree tokens in your portfolio!
