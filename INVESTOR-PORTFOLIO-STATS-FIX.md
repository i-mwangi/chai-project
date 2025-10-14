# Investor Portfolio Stats Fix

## Issue
The investor portal was crashing with the error:
```
TypeError: Cannot read properties of undefined (reading 'toFixed')
at InvestorPortal.renderPortfolioStats (investor-portal.js:682:95)
```

## Root Cause
The API endpoint `/api/investment/portfolio` was only returning:
- `totalInvestment`
- `totalHoldings`
- `holdings`

But the frontend was expecting:
- `totalInvestment`
- `currentValue`
- `totalReturns`
- `roi`

## Solution

### Backend Fix (api/investment-api.ts)
Added calculation and return of missing portfolio statistics:
- `currentValue`: Current market value of holdings (currently same as investment)
- `totalReturns`: Profit/loss (currentValue - totalInvestment)
- `roi`: Return on investment percentage

### Frontend Fix (frontend/js/investor-portal.js)
Added defensive checks in `renderPortfolioStats()` to handle undefined values:
- Default to 0 if any portfolio stat is undefined
- Prevents crashes if API response is incomplete

## Testing
1. Restart the API server: `restart-api-server.bat`
2. Restart the frontend: `restart-frontend-server.bat`
3. Navigate to the investor portal and check the Portfolio section
4. Verify all stats display correctly without errors

## Future Enhancements
- Implement real-time market pricing for `currentValue`
- Track historical performance data
- Add more detailed ROI calculations based on harvest distributions
