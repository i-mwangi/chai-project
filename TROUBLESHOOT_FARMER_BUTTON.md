# Troubleshooting: Register as Farmer Button

## Problem
The "Register as Farmer" button is not responding when clicked.

## Quick Fixes Applied

### 1. Added Debug Logging
The button now logs detailed information to the browser console when clicked.

### 2. Added Retry Logic
If buttons aren't found on first load, the system retries after 500ms.

### 3. Added Backup Event Listener
A document-level event delegation listener catches clicks even if the direct listener fails.

## How to Test

### Step 1: Open Browser Console
1. Open your app in the browser
2. Press `F12` to open Developer Tools
3. Go to the "Console" tab

### Step 2: Click the Button
Click "Register as Farmer" and look for these console messages:
```
🎯 Quick action clicked: farmer-portal
🌾 Register as Farmer button clicked
✅ User type set to farmer in localStorage
```

### Step 3: Check localStorage
In the console, type:
```javascript
localStorage.getItem('userType')
```
It should return: `"farmer"`

## Test Pages

### Simple Test: `test-farmer-button.html`
- Isolated test of just the button
- Shows real-time log of what happens
- Verifies localStorage is being set

### Full Test: `test-farmer-registration.html`
- Tests the complete registration flow
- Shows current status
- Allows clearing and resetting

## Common Issues & Solutions

### Issue 1: Button Not Found
**Symptoms:** Console shows "No quick action buttons found"
**Solution:** The page is loading before buttons are ready. The code now retries automatically.

### Issue 2: Click Not Registering
**Symptoms:** Nothing happens when clicking
**Solutions:**
1. Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Clear browser cache
3. Check if another script is blocking the event

### Issue 3: localStorage Not Saving
**Symptoms:** Button clicks but userType doesn't save
**Solutions:**
1. Check browser privacy settings (localStorage might be disabled)
2. Try in incognito/private mode
3. Check console for errors

### Issue 4: Wrong Message After Connecting
**Symptoms:** Still says "connected as investor"
**Solution:** 
1. Disconnect wallet
2. Clear localStorage: `localStorage.clear()`
3. Refresh page
4. Click "Register as Farmer" FIRST
5. Then connect wallet

## Debug Commands

Run these in the browser console:

### Check Current Status
```javascript
console.log('User Type:', localStorage.getItem('userType'));
console.log('Wallet Connected:', window.walletManager?.isWalletConnected());
```

### Manually Set Farmer Type
```javascript
localStorage.setItem('userType', 'farmer');
window.walletManager.userType = 'farmer';
console.log('✅ Manually set to farmer');
```

### Check Button Exists
```javascript
const btn = document.querySelector('[data-action="farmer-portal"]');
console.log('Button found:', !!btn);
if (btn) console.log('Button text:', btn.textContent.trim());
```

### Manually Trigger Registration
```javascript
if (window.walletManager) {
    window.walletManager.setIntendedUserType('farmer');
    console.log('✅ Registered as farmer');
}
```

## Expected Flow

### Correct Flow (Wallet Not Connected)
1. Click "Register as Farmer"
2. See toast: "✅ You are now registered as a Farmer! Connect your wallet to continue."
3. Wallet connection modal opens automatically
4. Connect wallet
5. See toast: "Wallet connected successfully! You are connected as a farmer."
6. Automatically switch to Farmer Portal view

### Correct Flow (Wallet Already Connected)
1. Click "Register as Farmer"
2. See toast: "✅ You are now registered as a Farmer!"
3. Automatically switch to Farmer Portal view

## Files Modified
- `frontend/js/dashboard-enhanced.js` - Added debug logging and backup listener
- `frontend/wallet/manager.js` - Preserves user type during connection

## Still Not Working?

If the button still doesn't work after trying all the above:

1. **Check the console for errors** - Look for red error messages
2. **Verify the button exists** - Use the debug command above
3. **Try the test pages** - Use `test-farmer-button.html` to isolate the issue
4. **Check file loading** - Make sure `dashboard-enhanced.js` is loading (check Network tab)
5. **Clear everything and start fresh**:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

## Contact Info
If you're still having issues, provide:
1. Browser console output (screenshot or copy/paste)
2. Which browser you're using
3. Any error messages you see
