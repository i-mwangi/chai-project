# Troubleshooting Vanilla JS HashConnect Implementation

This guide helps resolve common issues with the vanilla JavaScript HashConnect implementation.

## Common Issues and Solutions

### 1. "HashConnect is not defined" Error

**Problem**: JavaScript error indicating HashConnect library is not loaded.

**Solutions**:
1. Check internet connection - CDN libraries require connectivity
2. Verify CDN URLs in HTML file are correct:
   ```html
   <script src="https://unpkg.com/@hashgraph/sdk@2.41.0/dist/index.web.js"></script>
   <script src="https://unpkg.com/hashconnect@3.0.13/dist/hashconnect.js"></script>
   ```
3. Refresh the page to reload scripts
4. Check browser console for specific error messages

### 2. "Buffer is not defined" Error

**Problem**: Buffer polyfill not loaded or not assigned to window.Buffer.

**Solutions**:
1. Ensure Buffer polyfill is loaded:
   ```html
   <script src="https://unpkg.com/buffer@6.0.3/index.js"></script>
   ```
2. Verify Buffer is assigned in your JavaScript:
   ```javascript
   window.Buffer = window.Buffer || buffer.Buffer;
   ```
3. Check that the polyfill script loads before your code runs

### 3. Wallet Not Connecting

**Problem**: Clicking "Connect Wallet" does nothing or fails.

**Solutions**:
1. Ensure HashPack extension is installed:
   - Chrome/Edge/Brave: [Chrome Web Store](https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk)
   - Firefox: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/hashpack/)
2. Verify HashPack is unlocked and running
3. Check that you're on Testnet in HashPack settings
4. Ensure you have a Testnet account with HBAR
5. Try refreshing the page and reconnecting

### 4. "Project ID Invalid" Error

**Problem**: Wallet connection fails with project ID error.

**Solutions**:
1. Get your own Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Replace the placeholder ID in hashconnect.js:
   ```javascript
   const projectId = "YOUR_ACTUAL_PROJECT_ID";
   ```
3. Ensure the Project ID is correctly copied (no extra spaces)

### 5. Transaction Failures

**Problem**: Transactions fail with various error messages.

**Solutions**:
1. **"INSUFFICIENT_PAYER_BALANCE"**: 
   - Ensure sending account has sufficient HBAR
   - Get Testnet HBAR from [Hedera Portal](https://portal.hedera.com/)

2. **"INVALID_ACCOUNT_ID"**:
   - Check that account IDs are in correct format (0.0.xxxxx)
   - Verify accounts exist on Testnet

3. **"TRANSACTION_EXPIRED"**:
   - Try again (transactions have time limits)
   - Ensure your computer's clock is synchronized

4. **"USER_REJECTED"**:
   - Transaction was rejected in wallet
   - Try again and approve in HashPack

### 6. Module Import Issues

**Problem**: ES6 module imports not working in browser.

**Solutions**:
1. Ensure your HTML file is served via HTTP/HTTPS (not file://)
2. Add `type="module"` to script tags:
   ```html
   <script type="module">
   ```
3. Check browser compatibility (modern browsers required)
4. Use a local server for development:
   ```bash
   npx serve .
   ```

### 7. State Not Updating

**Problem**: UI doesn't reflect connection status changes.

**Solutions**:
1. Verify event listeners are properly set up:
   ```javascript
   hc.pairingEvent.on(() => { /* update UI */ });
   hc.disconnectionEvent.on(() => { /* update UI */ });
   ```
2. Check that `setState` is called when state changes
3. Ensure `subscribe` functions are properly registered

### 8. CORS or Network Errors

**Problem**: Libraries fail to load due to network restrictions.

**Solutions**:
1. Check internet connectivity
2. Try different CDN sources if unpkg is blocked
3. Download libraries locally if needed
4. Check browser extensions that might block requests

## Browser Compatibility

### Supported Browsers
- Chrome 61+
- Firefox 60+
- Safari 10.1+
- Edge 16+
- Opera 48+

### Known Issues
- Internet Explorer is not supported
- Some mobile browsers may have limitations
- Private browsing modes may restrict extension access

## Debugging Steps

1. **Check Browser Console**: Press F12 and look for error messages
2. **Verify Network Tab**: Ensure all scripts load successfully
3. **Test Extension**: Verify HashPack extension works on other sites
4. **Check HashConnect Logs**: Enable debug mode if available
5. **Validate Account**: Ensure Testnet account has HBAR balance

## Performance Optimization

1. **Lazy Loading**: Load libraries only when needed
2. **Error Boundaries**: Handle errors gracefully
3. **Connection Caching**: Store connection state in localStorage
4. **Efficient DOM Updates**: Minimize DOM manipulations

## Security Considerations

1. **Project ID Protection**: Don't expose Project ID in client-side code in production
2. **Transaction Validation**: Always validate transactions before signing
3. **User Confirmation**: Require explicit user approval for all transactions
4. **Secure Context**: Serve over HTTPS in production

## Contact Support

If issues persist:
1. Check [HashConnect Documentation](https://docs.hashpack.app/)
2. Review [Hedera SDK Documentation](https://docs.hedera.com/)
3. File issues on GitHub repositories
4. Contact WalletConnect support for Project ID issues