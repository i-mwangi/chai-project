# Development Setup Guide

This guide will help you set up the Chai Platform for local development.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ or 20+ (LTS recommended)
- **pnpm** package manager
- **Git** for version control
- **Hedera Testnet account** (get free HBAR from [portal.hedera.com](https://portal.hedera.com))
- **WalletConnect Project ID** (get from [cloud.reown.com](https://cloud.reown.com))

## 🚀 Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chai-platform.git
cd chai-platform
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# WalletConnect Project ID (required for wallet integration)
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here

# Hedera Testnet credentials (for contract deployment)
HEDERA_OPERATOR_ID=0.0.your-account-id
HEDERA_OPERATOR_KEY=your-private-key
```

### 4. Initialize Database

```bash
# Create database directory
pnpm run init-db

# Run migrations
pnpm run migrate
```

## 🛠️ Detailed Setup

### Wallet Integration Setup

1. Visit [https://cloud.reown.com](https://cloud.reown.com)
2. Create a new project
3. Copy your Project ID
4. Add it to your `.env` file:

```env
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here
```

### Hedera Account Setup

1. Create a Hedera Testnet account at [portal.hedera.com](https://portal.hedera.com)
2. Get free testnet HBAR
3. Add your account details to `.env`:

```env
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.your-account-id
HEDERA_OPERATOR_KEY=your-private-key
```

### Database Setup

The platform supports two database configurations:

#### Local Development (SQLite - Default)

```env
DATABASE_URL=file:./local-store/sqlite/sqlite.db
```

Initialize the local database:
```bash
pnpm run init-db
pnpm run migrate
```

#### Production (Turso - LibSQL)

For production deployment with Turso:

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

## ▶️ Running the Application

### Development Server

```bash
# Start development server with API and frontend
pnpm run dev:vite

# Or start API and frontend separately
pnpm run api:mock    # Start mock API server
pnpm run frontend:vite  # Start frontend development server
```

The application will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:3001

### Production Build

```bash
# Build frontend for production
pnpm run frontend:build

# Preview production build
pnpm run frontend:preview
```

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

### Test Database

For testing, you can use an in-memory database by setting:

```env
DISABLE_INVESTOR_KYC=true
```

## 🏗️ Smart Contract Development

### Compile Contracts

```bash
# Compile Solidity contracts
# (Uses Hardhat or Foundry depending on configuration)
```

### Deploy Contracts

```bash
# Deploy to Hedera Testnet
pnpm run deploy
```

### Contract Addresses

After deployment, update your `.env` file with the deployed contract addresses:

```env
ISSUER_CONTRACT_ID=0.0.deployed-contract-id
LENDER_CONTRACT_ID=0.0.deployed-contract-id
```

## 📊 Database Management

### Migrations

```bash
# Generate new migration
pnpm run generate

# Run migrations
pnpm run migrate

# View migration status
pnpm run migration:show

# Rollback last migration
pnpm run migration:rollback
```

### Database Studio

```bash
# Open Drizzle Studio for database inspection
pnpm run studio
```

### Seed Data

```bash
# Seed database with sample data
pnpm run seed
```

## 🔧 Development Tools

### Code Quality

```bash
# Lint code
pnpm run lint

# Format code
pnpm run format
```

### Debugging

```bash
# Debug specific components
pnpm run debug:component-name
```

### Monitoring

```bash
# View logs
pnpm run logs
```

## 🌐 Deployment

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

### Environment Variables for Production

In Vercel Dashboard → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `TURSO_DATABASE_URL` | Your Turso database URL |
| `TURSO_AUTH_TOKEN` | Your Turso auth token |
| `VITE_WALLETCONNECT_PROJECT_ID` | Your WalletConnect project ID |
| `VITE_HEDERA_NETWORK` | `mainnet` for production |
| `NODE_ENV` | `production` |

## 🔒 Security Considerations

### Environment Variables

Never commit sensitive environment variables to version control. Use `.env` for local development and configure environment variables in your deployment platform.

### Wallet Security

- Always use testnet for development
- Never expose private keys in client-side code
- Use proper access controls for admin functions

### Database Security

- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data at rest
- Regularly update dependencies

## 🆘 Troubleshooting

### Common Issues

#### Wallet Connection Issues
- Ensure WalletConnect Project ID is correct
- Check that wallet extension is installed and enabled
- Verify Hedera network configuration

#### Database Connection Issues
- Ensure database file has proper permissions
- Check that database directory exists
- Verify database URL format

#### Smart Contract Issues
- Check that Hedera account has sufficient HBAR
- Verify contract addresses in environment variables
- Ensure network configuration matches deployment

### Getting Help

- Check existing [GitHub Issues](https://github.com/your-username/chai-platform/issues)
- Review documentation in `/docs` directory
- Contact the development team

## 📚 Additional Resources

- [Hedera Documentation](https://docs.hedera.com/)
- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Vite Documentation](https://vitejs.dev/)
- [Turso Documentation](https://docs.turso.tech/)