# Revenue Display Fix - Quick Instructions

## The Problem
Your Revenue Tracking section shows $0.00 for everything even though you have 15 harvests worth over $53 million in total revenue.

## The Solution
I've fixed the API server to properly calculate and return your farmer's 30% share.

## What I Fixed

### 1. API Server (`api/harvest-reporting.ts`)
- **Stats endpoint** now calculates your 30% share instead of total revenue
- **Holder earnings endpoint** now works for farmers (was only for investors)
- Both endpoints return the correct data structure

### 2. Frontend (`frontend/js/farmer-dashboard.js`)
- Updated to handle both response formats for compatibility

## How to Apply the Fix

### Option 1: Use the Restart Script (Easiest)
```bash
restart-api-server.bat
```

### Option 2: Manual Restart
1. Find the terminal running your API server
2. Press `Ctrl+C` to stop it
3. Run: `npm run dev:api`
4. Wait for "Server running on port 3001"

### Step 3: Test It
1. Open your app in the browser
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Go to the **Revenue** tab in the farmer dashboard

## What You Should See

Based on your current 15 harvests with $53,871,601 total revenue:

- **Total Earnings**: $16,161,480.30 (your 30% share)
- **This Month**: $16,161,480.30 (all harvests are from October 2025)
- **Pending Distributions**: $16,161,480.30 (none are distributed yet)
- **Revenue Chart**: Line graph showing earnings over time
- **Available Balance**: $0.00 (nothing distributed yet)

## After Distribution

Once an admin marks harvests as "distributed":
- **Pending Distributions** will decrease
- **Available Balance** will increase
- You can then withdraw funds

## Your Current Harvests

You have 15 harvests:
1. henry grove: 9,999 kg × $900/kg = $8,999,100 → Your share: $2,699,730
2. pinyo grove: 6,000 kg × $788/kg = $4,728,000 → Your share: $1,418,400
3. Test Grove: 1,000 kg × $100/kg = $100,000 → Your share: $30,000
4. ... and 12 more harvests

**Total**: $53,871,601 → **Your 30% share**: $16,161,480.30

## Troubleshooting

### Still showing $0.00?
1. Make sure you restarted the API server (not just the frontend)
2. Check the browser console for errors (F12)
3. Verify the server is running on port 3001
4. Try clearing browser cache

### Chart still empty?
1. Check browser console for API errors
2. Verify the endpoint: `http://localhost:3001/api/harvest/holder/0.0.123456/earnings`
3. Should return `distributionHistory` array

### Need Help?
Check the detailed summary in `REVENUE-FIX-SUMMARY.md`
