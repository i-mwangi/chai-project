# Wallet Integration Documentation

This document provides comprehensive information about the wallet integration in the Chai Platform, which uses Hedera Wallet Connect v2.0.

## 📋 Overview

The Chai Platform implements wallet integration using the official Hedera Wallet Connect library, enabling secure connections between users and the Hedera network. This allows users to:

- Connect their Hedera-compatible wallets
- Sign transactions securely
- Manage their digital assets
- Interact with smart contracts

## 🏗️ Architecture

The wallet integration is located in the `frontend/wallet/` directory and follows a modular architecture:

```
frontend/wallet/
├── config.js       # Configuration (Project ID, network, metadata)
├── state.js        # State management (connection status, account info)
├── connector.js    # DAppConnector wrapper (core wallet logic)
├── modal.js        # Connection modal UI
├── modal.css       # Modal styles
├── manager.js      # High-level API for the app
└── index.js        # Entry point
```

## 🔧 Configuration

### WalletConnect Project ID

To use wallet integration, you need a WalletConnect Project ID:

1. Visit [https://cloud.reown.com](https://cloud.reown.com)
2. Create a new project
3. Copy your Project ID
4. Add it to your `.env` file:

```env
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here
```

### Network Configuration

The platform supports both Testnet and Mainnet:

```javascript
// In config.js
export const DEFAULT_NETWORK = LedgerId.TESTNET; // or LedgerId.MAINNET
```

## 🎯 Supported Wallets

### Browser Extensions
- **HashPack** - [Install](https://www.hashpack.app/)
- **Blade** - [Install](https://bladewallet.io/)
- **Kabila** - [Install](https://kabila.app/)

### Mobile Wallets (via QR Code)
- Any WalletConnect v2 compatible Hedera wallet

## 🚀 Implementation Details

### Global Wallet Manager

The wallet manager is available globally as `window.walletManager`:

```javascript
// Connect wallet
await walletManager.connect();

// Check connection status
if (walletManager.isWalletConnected()) {
  const accountId = walletManager.getAccountId();
  console.log('Connected:', accountId);
}

// Send transaction
const result = await walletManager.sendTransaction(
  '0.0.12345',  // recipient
  '10'          // amount in HBAR
);

// Disconnect
await walletManager.disconnect();
```

### Connection Flow

#### Browser Extension Connection

1. User clicks "Connect Wallet"
2. Modal shows available extensions (HashPack, Blade, Kabila)
3. User selects extension
4. Extension opens for approval
5. User approves connection
6. Session established and saved

#### QR Code Connection

1. User clicks "Show QR Code"
2. WalletConnect modal opens with QR code
3. User scans with mobile wallet
4. User approves connection in wallet
5. Session established and saved

### Session Persistence

Sessions are stored in `sessionStorage` with key `hwcV1Session`:

```javascript
{
  topic: "session-topic-hash",
  accountId: "0.0.12345",
  timestamp: 1234567890
}
```

On page reload, the connector automatically restores the session if found.

## 📡 API Reference

### WalletManager

#### Methods

- `init()` - Initialize wallet manager and restore session
- `connect()` - Show connection modal and connect wallet
- `disconnect()` - Disconnect wallet and clear session
- `isWalletConnected()` - Check if wallet is connected
- `getAccountId()` - Get connected account ID
- `getUserType()` - Get user type ('farmer' or 'investor')
- `setUserType(type)` - Set user type
- `sendTransaction(recipientId, amount)` - Send HBAR transaction

### HederaWalletConnector (Low-level API)

- `init(checkExistingSession)` - Initialize DAppConnector
- `connectExtension(extensionId)` - Connect via browser extension
- `connectQRCode()` - Connect via QR code
- `disconnect()` - Disconnect wallet
- `getSigner()` - Get signer for transactions
- `signAndExecuteTransaction(recipientId, amount)` - Sign and execute transaction

### WalletState

- `getState()` - Get current state
- `setState(updates)` - Update state
- `subscribe(listener)` - Subscribe to state changes
- `reset()` - Reset state

## 💰 Transaction Examples

### Basic HBAR Transfer

```javascript
const result = await walletManager.sendTransaction(
  '0.0.12345',  // recipient
  '10'          // amount in HBAR
);

console.log('Transaction ID:', result.transactionId);
console.log('Status:', result.status);
```

### Custom Transaction (Advanced)

```javascript
import { hederaWallet } from './wallet/connector.js';
import { TokenAssociateTransaction } from '@hashgraph/sdk';

const signer = hederaWallet.getSigner();
const accountId = signer.getAccountId();

const transaction = new TokenAssociateTransaction()
  .setAccountId(accountId)
  .setTokenIds(['0.0.11111']);

// Sign and execute
const signedTx = await signer.signTransaction(transaction);
const txResponse = await signedTx.executeWithSigner(signer);
const receipt = await txResponse.getReceiptWithSigner(signer);
```

## 🎨 UI Components

### Connection Modal

The connection modal provides a user-friendly interface for wallet selection:

```html
<div class="wallet-modal">
  <div class="modal-header">
    <h2>Connect Wallet</h2>
  </div>
  <div class="modal-body">
    <!-- Browser Extensions Section -->
    <div class="extensions-section">
      <h3>Browser Extensions</h3>
      <!-- Extension buttons -->
    </div>
    
    <!-- QR Code Section -->
    <div class="qr-section">
      <h3>Connect with QR Code</h3>
      <button>Show QR Code</button>
    </div>
  </div>
</div>
```

### Connection Status Display

Display connection information in your UI:

```html
<div class="wallet-info">
  <span class="account-id">0.0.12345</span>
  <button class="disconnect-btn">Disconnect</button>
</div>
```

## 🛠️ Development

### Testing Locally

```bash
# Start development server
pnpm run dev:vite

# Open http://localhost:3000/app.html
```

### Building for Production

```bash
# Build optimized bundle
pnpm run frontend:build

# Preview production build
pnpm run frontend:preview
```

## 🐛 Troubleshooting

### Extension Not Detected

- Make sure the wallet extension is installed and enabled
- Refresh the page after installing
- Check browser console for errors

### Connection Expired

- QR codes expire after 5 minutes
- Click "Show QR Code" again to generate a new one

### Session Not Restored

- Check if `sessionStorage` is enabled in browser
- Clear `sessionStorage` and reconnect if corrupted

### Transaction Failed

- Ensure sufficient HBAR balance for transaction + fees
- Check network status (testnet/mainnet)
- Verify recipient account ID format

## 🔒 Security Considerations

### Best Practices

1. **Never expose private keys** in client-side code
2. **Always use secure connections** (HTTPS)
3. **Implement proper error handling** for wallet operations
4. **Validate all user inputs** before signing transactions
5. **Use appropriate access controls** for sensitive operations

### Session Security

- Sessions are stored in `sessionStorage` (cleared on tab close)
- All communication uses encrypted connections
- User must explicitly approve all transactions

## 🔄 Migration from Previous Versions

The current implementation is based on Hedera Wallet Connect v2.0, which provides:

- Better stability and performance
- Improved error handling
- Enhanced security features
- Support for more wallet types

### Breaking Changes

- Old v1.5.1 implementation files have been removed
- New API structure with improved modularity
- Updated dependencies and integration patterns

## 📚 Resources

- [Hedera WalletConnect Docs](https://docs.hedera.com/hedera/tutorials/more-tutorials/wallet-connect)
- [Official Example Repo](https://github.com/hashgraph/hedera-wallet-connect/)
- [WalletConnect Docs](https://docs.walletconnect.com/)
- [Reown Cloud](https://cloud.reown.com/)

## 🆘 Support

For issues or questions:
1. Check the [Hedera Discord](https://hedera.com/discord)
2. Review [GitHub Issues](https://github.com/hashgraph/hedera-wallet-connect/issues)
3. Consult [Hedera Docs](https://docs.hedera.com/)