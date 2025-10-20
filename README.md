# Chai Platform - Coffee Tree Tokenization Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hedera](https://img.shields.io/badge/Hedera-Testnet-blue)](https://hedera.com)
[![WalletConnect](https://img.shields.io/badge/WalletConnect-v2.0-blue)](https://walletconnect.com)

Chai Platform is a decentralized coffee tree tokenization platform built on the Hedera network. It enables farmers to tokenize their coffee groves and allows investors to purchase tokens representing ownership in coffee production, creating a transparent and efficient marketplace for sustainable coffee investment.

## 🌱 Project Overview

The Chai Platform connects coffee farmers with investors through blockchain technology, enabling:

- **Farmers** to register their groves and tokenize their coffee trees
- **Investors** to purchase tokens representing ownership in coffee production
- **Transparent revenue distribution** from coffee sales to token holders
- **Real-time monitoring** of tree health and environmental conditions
- **Secure wallet integration** for all platform interactions

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                  │
├─────────────────────────────────────────────────────────────────────┤
│  HTML/CSS/JS     │  Wallet Integration  │  UI Components            │
│  (Vanilla JS)    │  (Hedera Wallet      │  (Dashboard, Portals)     │
│                  │   Connect v2.0)      │                           │
├─────────────────────────────────────────────────────────────────────┤
│                      API Layer (Node.js)                            │
├─────────────────────────────────────────────────────────────────────┤
│  Smart Contracts  │  Database Layer      │  External Services       │
│  (Solidity)       │  (SQLite/Turso)      │  (Price Oracles,         │
│                   │                      │   IoT Sensors)           │
└─────────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or 20+
- pnpm package manager
- Hedera Testnet account (get free HBAR from [portal.hedera.com](https://portal.hedera.com))
- WalletConnect Project ID (get from [cloud.reown.com](https://cloud.reown.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/i-mwangi/chai-project.git
cd chai-platform

# Install dependencies
pnpm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Starting the Project

There are several ways to start the project depending on your needs:

#### Option 1: Start the Frontend Server (Recommended for Development)
```bash
# Start the frontend server on port 3000
node frontend/server.js

# The application will be available at:
# http://localhost:3000 - Landing page
# http://localhost:3000/app.html - Main application
```

#### Option 2: Start with Vite (Alternative Development Server)
```bash
# Start development server with Vite
pnpm run dev:vite

# The application will be available at:
# http://localhost:5173 - Main application
```

#### Option 3: Build and Preview Production Version
```bash
# Build for production
pnpm run frontend:build

# Preview production build
pnpm run frontend:preview
```

### Development Workflow

1. Start the frontend server:
   ```bash
   node frontend/server.js
   ```

2. Access the application in your browser:
   - `http://localhost:3000` - Landing page
   - `http://localhost:3000/app.html` - Main application

3. Make changes to the code and refresh the browser to see updates

### Frontend Access

The frontend can be accessed at:
- `http://localhost:3000` - Landing page
- `http://localhost:3000/app.html` - Main application
- `http://localhost:3000/app.html#marketplace` - Marketplace section

The custom Node.js server (`node frontend/server.js`) serves static files and handles SPA routing, with special support for the app.html entry point.

## 📁 Project Structure

```
chai-platform/
├── abi/                 # Smart contract ABIs
├── api/                 # Backend API services
├── contracts/           # Solidity smart contracts
├── db/                  # Database schema and migrations
├── events/              # Event processing services
├── frontend/            # Frontend application
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript modules
│   ├── wallet/          # Wallet integration
│   ├── index.html       # Landing page
│   └── app.html         # Main application
├── lib/                 # Shared libraries
├── providers/           # Data providers
├── tests/               # Test suites
└── types/               # TypeScript definitions
```

## 🔐 Wallet Integration

The platform uses **Hedera Wallet Connect v2.0** for secure wallet integration, supporting:

### Supported Wallets
- **HashPack** (Browser Extension)
- **Blade** (Browser Extension)
- **Kabila** (Browser Extension)
- **Mobile Wallets** (via QR Code)

### Integration Details

Wallet integration is located in `frontend/wallet/` and includes:

- `config.js` - WalletConnect configuration
- `connector.js` - DAppConnector wrapper
- `manager.js` - High-level wallet API
- `modal.js` - Connection UI components
- `state.js` - Connection state management

### Usage Example

```javascript
// Connect wallet
await walletManager.connect();

// Check connection
if (walletManager.isWalletConnected()) {
  const accountId = walletManager.getAccountId();
}

// Send transaction
const result = await walletManager.sendTransaction(
  '0.0.12345',  // recipient
  '10'          // amount in HBAR
);

// Listen to events
window.addEventListener('wallet-connected', (event) => {
  console.log('Connected:', event.detail.accountId);
});
```

### WalletConnect Project ID

The platform uses WalletConnect for wallet integration. You need to:

1. Visit [https://cloud.reown.com](https://cloud.reown.com)
2. Create a new project
3. Copy your Project ID
4. Add it to your `.env` file:

```env
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here
```

## 🗄️ Database

The platform supports multiple database backends:

### Local Development (SQLite)
```env
DATABASE_URL=file:./local-store/sqlite/sqlite.db
```

### Production (Turso - LibSQL)
```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### Database Schema

Key tables include:
- `coffee_groves` - Registered coffee groves
- `harvest_records` - Harvest data and revenue
- `token_holdings` - Investor token ownership
- `farmer_verifications` - Farmer verification status
- `investor_verifications` - Investor verification status
- `transaction_history` - Financial transaction records
- `iot_sensor_data` - Environmental monitoring data

### Migrations

```bash
# Generate new migration
pnpm run generate

# Run migrations
pnpm run migrate

# View migration status
pnpm run migration:show
```

## ☁️ Turso Deployment

For production deployment, the platform uses Turso (SQLite-compatible edge database):

### Setup

1. Install Turso CLI:
   ```bash
   irm get.turso.tech/install.ps1 | iex
   ```

2. Create account and database:
   ```bash
   turso auth signup
   turso db create chai-platform
   ```

3. Get credentials:
   ```bash
   turso db show chai-platform --url
   turso db tokens create chai-platform
   ```

4. Update `.env`:
   ```env
   TURSO_DATABASE_URL=libsql://chai-platform-yourname.turso.io
   TURSO_AUTH_TOKEN=your-token-here
   ```

## 🏗️ Smart Contracts

Smart contracts are written in Solidity and deployed on Hedera:

### Core Contracts

- `CoffeeTreeIssuer.sol` - Grove registration and tokenization
- `CoffeeTreeManager.sol` - Token management and transfers
- `CoffeeTreeMarketplace.sol` - Token trading marketplace
- `CoffeeRevenueReserve.sol` - Revenue distribution
- `PriceOracle.sol` - Coffee price feeds
- `FarmerVerification.sol` - Farmer identity verification

### Deployment

```bash
# Deploy contracts
pnpm run deploy
```

Contract addresses are configured in `.env`:
```env
ISSUER_CONTRACT_ID=0.0.xxxxx
LENDER_CONTRACT_ID=0.0.yyyyy
```

## 🌐 Vercel Deployment

The platform is optimized for Vercel deployment:

### Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `TURSO_DATABASE_URL` | Your Turso database URL |
| `TURSO_AUTH_TOKEN` | Your Turso auth token |
| `VITE_WALLETCONNECT_PROJECT_ID` | Your WalletConnect project ID |
| `VITE_HEDERA_NETWORK` | `mainnet` for production |

### Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Or push to GitHub and configure Vercel for automatic deployments.

## 🧪 Testing

### Unit Tests
```bash
pnpm run test
```

### End-to-End Tests
```bash
pnpm run test:e2e
```

### Load Testing
```bash
pnpm run test:e2e:load
```

## 🛠️ Development Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev:vite` | Start development server |
| `pnpm run frontend:build` | Build for production |
| `pnpm run migrate` | Run database migrations |
| `pnpm run deploy` | Deploy smart contracts |
| `pnpm run test` | Run unit tests |
| `pnpm run test:e2e` | Run end-to-end tests |

## 📊 Monitoring & Analytics

The platform includes built-in analytics for:
- Coffee price tracking
- Revenue distribution monitoring
- User activity tracking
- Environmental sensor data visualization

## 🔒 Security

### Wallet Security
- All transactions require explicit user approval
- Private keys never leave the user's wallet
- Session persistence uses secure storage

### Data Security
- Database encryption at rest
- TLS encryption for all communications
- Regular security audits

### Access Control
- Role-based access control (Farmer/Investor/Admin)
- KYC verification for investors
- Farmer verification process

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hedera Hashgraph](https://hedera.com) - Distributed consensus platform
- [WalletConnect](https://walletconnect.com) - Wallet integration protocol
- [Turso](https://turso.tech) - Edge database provider
- [Vercel](https://vercel.com) - Deployment platform

## 📞 Support

For issues or questions:
- Check existing [GitHub Issues](https://github.com/your-username/chai-platform/issues)
- Contact the development team
- Join the Hedera community on [Discord](https://hedera.com/discord)
