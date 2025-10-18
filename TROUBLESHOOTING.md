# Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Outdated Optimize Dep" Error

**Error:**
```
GET http://localhost:3000/@fs/.../node_modules/.vite/deps/@hashgraph_sdk.js?v=80882335 
net::ERR_ABORTED 504 (Outdated Optimize Dep)
```

**Solution:**
```bash
# Run the fix script
fix-vite-cache.bat

# Or manually:
# 1. Delete Vite cache
rmdir /s /q node_modules\.vite

# 2. Restart dev server
pnpm run dev:vite
```

**Why this happens:** Vite caches dependencies, and when you update packages, the cache becomes outdated.

---

### Issue 2: "Cannot read properties of undefined (reading 'connectWallet')"

**Error:**
```
Uncaught TypeError: Cannot read properties of undefined (reading 'connectWallet')
```

**Solution:** ✅ Already fixed! The buttons now use event listeners instead of inline onclick handlers.

**What was changed:**
- Removed inline `onclick="window.walletManager.connectWallet()"`
- Added proper event listeners that wait for walletManager to load
- Used `data-action` attributes for better organization

---

### Issue 3: "wallet-loading.js 404 Not Found"

**Error:**
```
GET http://localhost:3000/js/wallet-loading.js net::ERR_ABORTED 404 (Not Found)
```

**Solution:** ✅ Already fixed! Removed the reference to the non-existent file.

---

### Issue 4: npm install fails

**Error:**
```
npm ERR! Cannot read properties of null (reading 'matches')
```

**Solution:** Use `pnpm` instead of `npm`:
```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Then install dependencies
pnpm install
```

---

### Issue 5: Wallet not connecting

**Symptoms:**
- Modal opens but nothing happens
- Extension doesn't respond
- QR code doesn't work

**Solutions:**

1. **Check if wallet extension is installed:**
   - [HashPack](https://www.hashpack.app/)
   - [Blade](https://bladewallet.io/)
   - [Kabila](https://kabila.app/)

2. **Refresh the page after installing extension**

3. **Check browser console for errors:**
   - Press F12
   - Look for red errors
   - Share them if you need help

4. **Clear browser cache:**
   - Ctrl+Shift+Delete
   - Clear cached images and files

5. **Try a different browser:**
   - Chrome/Edge work best
   - Firefox may have issues

---

### Issue 6: Module import errors

**Error:**
```
Failed to resolve module specifier "@hashgraph/sdk"
```

**Solution:**
```bash
# Clear everything and reinstall
fix-vite-cache.bat
```

---

### Issue 7: Port already in use

**Error:**
```
Port 3000 is already in use
```

**Solution:**
```bash
# Find and kill the process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or use a different port
vite --port 3001
```

---

### Issue 8: Transaction fails

**Symptoms:**
- Transaction doesn't go through
- Wallet shows error
- Console shows transaction error

**Solutions:**

1. **Check HBAR balance:**
   - Need enough HBAR for transaction + fees
   - Minimum ~0.1 HBAR for fees

2. **Verify recipient account ID:**
   - Format: `0.0.12345`
   - Must be a valid Hedera account

3. **Check network:**
   - Make sure you're on Testnet
   - Wallet and app must use same network

4. **Get testnet HBAR:**
   - [Hedera Faucet](https://portal.hedera.com/faucet)

---

### Issue 9: Session not persisting

**Symptoms:**
- Have to reconnect every page reload
- Session lost after refresh

**Solutions:**

1. **Check sessionStorage:**
   - Open DevTools (F12)
   - Go to Application tab
   - Check Session Storage
   - Look for `hwcV1Session`

2. **Don't use incognito mode:**
   - Session storage doesn't persist in incognito

3. **Check browser settings:**
   - Make sure cookies/storage is enabled

---

### Issue 10: Vite dev server won't start

**Error:**
```
Error: Cannot find module 'vite'
```

**Solution:**
```bash
# Reinstall dependencies
pnpm install

# If that doesn't work, clear everything
rmdir /s /q node_modules
del pnpm-lock.yaml
pnpm install
```

---

## Quick Fixes Checklist

When something goes wrong, try these in order:

1. ✅ **Refresh the page** (Ctrl+R)
2. ✅ **Hard refresh** (Ctrl+Shift+R)
3. ✅ **Clear Vite cache** (`fix-vite-cache.bat`)
4. ✅ **Restart dev server** (Ctrl+C, then `pnpm run dev:vite`)
5. ✅ **Check browser console** (F12)
6. ✅ **Clear browser cache** (Ctrl+Shift+Delete)
7. ✅ **Reinstall dependencies** (`pnpm install`)
8. ✅ **Try different browser**

---

## Getting Help

If none of these solutions work:

1. **Check browser console:**
   - Press F12
   - Copy any error messages

2. **Check terminal output:**
   - Look for errors in the terminal where dev server is running

3. **Provide details:**
   - What were you trying to do?
   - What error did you see?
   - What have you tried?
   - Browser and version?
   - Operating system?

4. **Resources:**
   - [Hedera Discord](https://hedera.com/discord)
   - [Hedera Docs](https://docs.hedera.com/)
   - [WalletConnect Docs](https://docs.walletconnect.com/)

---

## Prevention Tips

To avoid issues:

1. **Always use pnpm** (not npm or yarn)
2. **Keep dependencies updated** (but test after updating)
3. **Clear cache after updating packages**
4. **Use supported browsers** (Chrome, Edge, Brave)
5. **Keep wallet extensions updated**
6. **Don't modify node_modules** (changes will be lost)
7. **Use version control** (git) to track changes

---

## Development Workflow

Recommended workflow to minimize issues:

```bash
# 1. Start fresh each day
pnpm install

# 2. Clear cache if you updated packages
rmdir /s /q node_modules\.vite

# 3. Start dev server
pnpm run dev:vite

# 4. Open browser
# http://localhost:3000/wallet-test.html

# 5. Test wallet connection

# 6. If issues, check console (F12)

# 7. If still issues, run fix script
fix-vite-cache.bat
```

---

## Testing Checklist

Before considering the integration "working":

- [ ] Dev server starts without errors
- [ ] Page loads without 404 errors
- [ ] No console errors on page load
- [ ] Connect button appears
- [ ] Modal opens when clicking connect
- [ ] Extensions are detected (if installed)
- [ ] Can connect via extension
- [ ] Account ID displays after connection
- [ ] Can send test transaction
- [ ] Can disconnect
- [ ] Session persists after page refresh
- [ ] QR code modal opens
- [ ] No errors in browser console
- [ ] No errors in terminal

---

**Last Updated:** January 2025
