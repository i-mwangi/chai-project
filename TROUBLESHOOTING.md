# Coffee Tree Platform - Troubleshooting Guide

## Issue: Not Seeing Investor Portal or Farmer Onboarding

### Quick Fix Steps:

1. **Make sure both servers are running:**
   ```bash
   # Terminal 1 - API Server
   npm run api:mock
   
   # Terminal 2 - Frontend Server  
   npm run frontend
   ```

2. **Open the application:**
   - Go to: http://localhost:3000
   - You should see the main dashboard

3. **Connect a wallet to see all features:**
   - Click "Connect Wallet" button in the top right
   - Wait for the simulated connection (1-2 seconds)
   - You'll be randomly assigned as either a "farmer" or "investor"
   - The navigation will update to show your role-specific features

4. **Navigate between sections:**
   - **Dashboard**: Platform overview and statistics
   - **Farmer Portal**: Grove management, harvest reporting, revenue tracking
   - **Investor Portal**: Browse groves, manage portfolio, marketplace trading

### What You Should See After Connecting:

#### If assigned as FARMER:
- "Farmer Portal" button appears in navigation
- Access to:
  - Grove registration and management
  - Harvest reporting forms
  - Revenue tracking dashboard
  - Tree health monitoring
  - Farmer verification system

#### If assigned as INVESTOR:
- "Investor Portal" button appears in navigation  
- Access to:
  - Browse available groves
  - Purchase tree tokens
  - Portfolio management
  - Secondary marketplace
  - Earnings history

### Common Issues:

1. **"Connect Wallet" button not working:**
   - Check browser console for JavaScript errors
   - Refresh the page and try again

2. **Navigation buttons not appearing:**
   - Make sure wallet is connected first
   - Check that both servers are running
   - Clear browser cache and refresh

3. **Empty data/no groves showing:**
   - This is normal - the app uses mock data
   - Try connecting as different user types
   - Check browser network tab for API calls

4. **Want to test both user types:**
   - Disconnect wallet and reconnect to get a different role
   - Or clear localStorage and refresh page

### Manual Testing:

1. **Test Farmer Flow:**
   - Connect wallet → Get assigned as farmer
   - Click "Farmer Portal" 
   - Try "Register New Grove"
   - Fill out the form with sample data
   - Submit and see it appear in grove list

2. **Test Investor Flow:**
   - Connect wallet → Get assigned as investor  
   - Click "Investor Portal"
   - Browse available groves
   - Click "Invest Now" on a grove
   - Try purchasing tokens

### If Still Not Working:

1. **Check browser console for errors**
2. **Verify both servers are running on correct ports**
3. **Try in incognito/private browsing mode**
4. **Clear all browser data for localhost**
5. **Restart the servers using the restart script:**
   ```bash
   # Windows
   restart-demo.bat
   
   # Or manually restart
   npm run api:mock
   npm run frontend
   ```

### Recent Fixes Applied:

✅ **Fixed JavaScript syntax errors** - removed extra closing brace causing parse errors
✅ **Fixed JavaScript errors** in marketplace and investor portal
✅ **Added proper null checks** for undefined data
✅ **Enhanced mock API data** with all required properties
✅ **Added demo helper** for easy testing of both user types
✅ **Improved wallet connection UI** with clear instructions
✅ **Fixed View Details and Report Harvest buttons** with proper functionality
✅ **Added comprehensive grove details modal** with maps and full information
✅ **Enhanced harvest reporting** with pre-populated grove selection
✅ **Added safety checks** for undefined objects in main.js

### Testing the Fixed Buttons:

#### **View Details Button:**
1. Connect as farmer using demo helper
2. Go to Farmer Portal → My Groves
3. Click "View Details" on any grove
4. Should open detailed modal with:
   - Complete grove information
   - Mini map with location
   - Health score and status
   - Action buttons for harvest reporting

#### **Report Harvest Button:**
1. Connect as farmer using demo helper
2. Go to Farmer Portal → My Groves  
3. Click "Report Harvest" on any grove
4. Should:
   - Navigate to "Harvest Reports" section
   - Show a banner with selected grove info
   - Auto-open harvest form after 0.8 seconds
   - Pre-select the grove in the form
   - Fill in today's date

#### **Debug Console:**
- Open browser console (F12)
- Look for log messages when clicking buttons
- Should see: "viewGroveDetails called with groveId: X"
- Should see: "reportHarvestForGrove called with groveId: X"

### Farmer Verification/KYC Onboarding Flow:

#### **When Verification is Required:**
1. **Upon First Connection**: New farmers see onboarding modal after 2 seconds
2. **Accessing Restricted Features**: Unverified farmers see "Verification Required" screens
3. **After Rejection**: Rejected farmers get onboarding modal to resubmit documents

#### **Verification Statuses (Based on Account ID):**
- **Accounts ending 0-2**: Automatically verified ✅
- **Accounts ending 3-6**: Pending verification ⏳  
- **Accounts ending 7-9**: Rejected (need resubmission) ❌

#### **Onboarding Triggers:**
- **Wallet Connection**: Automatic check and modal for unverified farmers
- **Feature Access**: Blocked sections show verification requirement
- **Manual**: "Learn More" buttons trigger onboarding modal

#### **Test Different Verification States:**

**Farmer Verification (Based on Account ID ending):**
1. **Verified Farmer**: Account ending 0-2 ✅
2. **Pending Farmer**: Account ending 3-6 ⏳
3. **Rejected Farmer**: Account ending 7-9 ❌

**Investor Verification (Based on Account ID ending):**
1. **Verified Investor**: Account ending 0-3 ✅
2. **Pending Investor**: Account ending 4-7 ⏳
3. **Rejected Investor**: Account ending 8-9 ❌

### Investor KYC/Verification System:

#### **Required Documents for Investors:**
1. **🆔 Government-Issued ID**: National ID, passport, driver's license, or state ID
2. **🏠 Proof of Address**: Utility bill, bank statement, or lease agreement (last 3 months)
3. **💼 Financial Information**: Bank statement, income verification, or investment account statement

#### **When Investor Verification is Required:**
- **Upon Wallet Connection**: Automatic check and onboarding modal for unverified investors
- **Accessing Investment Features**: Blocked sections show verification requirement
- **Before First Investment**: Must be verified to purchase grove tokens

#### **Investor Verification Features:**
- **Onboarding modal** with investment-specific requirements
- **Verification section** in investor portal
- **Progressive restrictions** for unverified investors
- **Different verification tiers** with investment limits

### API Endpoint Issues (404 Errors):

If you see "Endpoint not found" errors for investor verification:

#### **Quick Fix:**
```bash
# Run the restart script
restart-with-investor-fix.bat
```

#### **Manual Fix:**
1. **Stop all servers**: Close all Node.js command windows
2. **Restart API server**: `npm run api:mock`
3. **Restart frontend**: `npm run frontend`
4. **Test endpoint**: Visit `http://localhost:3001/api/investor-verification/status/0.0.123456`

#### **Verify Fix:**
- API server should show: "🔍 Investor verification request" in console
- Endpoint should return JSON response (not 404)
- Investor onboarding modal should appear when connecting as investor

The application is fully functional - both farmers and investors must complete verification to access all features!