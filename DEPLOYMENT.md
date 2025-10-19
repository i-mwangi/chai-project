# Deployment Guide

This document provides comprehensive information about deploying the Chai Platform to various environments including development, staging, and production.

## 📋 Overview

The Chai Platform can be deployed in multiple configurations:
- **Development**: Local development with SQLite
- **Staging**: Preview deployments with Turso
- **Production**: Full production deployment with Turso and Vercel

## 🚀 Quick Deployment

### Vercel Deployment (Recommended)

1. Fork the repository to your GitHub account
2. Sign up for [Vercel](https://vercel.com)
3. Create a new project and import your repository
4. Configure environment variables (see below)
5. Deploy!

### Environment Variables

Configure these environment variables in your Vercel project settings:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `TURSO_DATABASE_URL` | Turso database URL | `libsql://chai-platform-yourname.turso.io` |
| `TURSO_AUTH_TOKEN` | Turso authentication token | `eyJhbGc...` |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect Project ID | `39948bbd...` |
| `VITE_HEDERA_NETWORK` | Hedera network | `mainnet` |
| `NODE_ENV` | Node environment | `production` |

## ☁️ Database Deployment (Turso)

### Setup Turso Database

1. Install Turso CLI:
   ```bash
   irm get.turso.tech/install.ps1 | iex
   ```

2. Create account and database:
   ```bash
   turso auth signup
   turso db create chai-platform
   ```

3. Get database credentials:
   ```bash
   turso db show chai-platform --url
   turso db tokens create chai-platform
   ```

4. Add credentials to Vercel environment variables

### Database Migration

After deploying, run database migrations:

```bash
# Connect to your Vercel project
vercel env pull

# Run migrations (this can be done via a deployment script)
pnpm run migrate
```

## 🌐 Frontend Deployment (Vercel)

### Vercel Configuration

The project includes a `vercel.json` configuration file:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/server.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/server.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ]
}
```

### Build Process

Vercel automatically runs:
1. `pnpm install` - Install dependencies
2. `pnpm run frontend:build` - Build frontend
3. Deploys both API and frontend

### Custom Domain

1. In Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable HTTPS (automatically provided by Vercel)

## 🏗️ Smart Contract Deployment

### Mainnet Deployment

1. Update `.env` with mainnet credentials:
   ```env
   HEDERA_NETWORK=mainnet
   HEDERA_OPERATOR_ID=0.0.your-mainnet-account
   HEDERA_OPERATOR_KEY=your-mainnet-private-key
   ```

2. Deploy contracts:
   ```bash
   pnpm run deploy
   ```

3. Update contract addresses in environment variables:
   ```env
   ISSUER_CONTRACT_ID=0.0.deployed-contract-id
   LENDER_CONTRACT_ID=0.0.deployed-contract-id
   ```

### Contract Verification

After deployment, verify contracts on HashScan:
1. Visit [hashscan.io](https://hashscan.io)
2. Navigate to your contract address
3. Click "Verify Contract"
4. Upload contract source code

## 🔧 Environment Configuration

### Development Environment

```env
# .env.development
NODE_ENV=development
HEDERA_NETWORK=testnet
VITE_HEDERA_NETWORK=testnet
DATABASE_URL=file:./local-store/sqlite/sqlite.db
VITE_DEBUG=true
```

### Staging Environment

```env
# .env.staging
NODE_ENV=production
HEDERA_NETWORK=testnet
VITE_HEDERA_NETWORK=testnet
TURSO_DATABASE_URL=libsql://chai-platform-staging.turso.io
TURSO_AUTH_TOKEN=staging-token
VITE_DEBUG=false
```

### Production Environment

```env
# .env.production
NODE_ENV=production
HEDERA_NETWORK=mainnet
VITE_HEDERA_NETWORK=mainnet
TURSO_DATABASE_URL=libsql://chai-platform.turso.io
TURSO_AUTH_TOKEN=production-token
VITE_DEBUG=false
```

## 🛡️ Security Configuration

### HTTPS Enforcement

Vercel automatically provides HTTPS, but you can enforce it:

```javascript
// api/middleware/https.ts
export const enforceHTTPS = (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
};
```

### CORS Configuration

```env
# Allow your domain only
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Rate Limiting

```env
# Adjust for production traffic
RATE_LIMIT_STANDARD=50
RATE_LIMIT_ADMIN=20
```

## 📊 Monitoring & Analytics

### Vercel Analytics

Vercel provides built-in analytics:
1. Visit your Vercel Dashboard
2. Navigate to Analytics tab
3. Monitor performance, usage, and errors

### Custom Monitoring

Implement custom monitoring:

```typescript
// lib/monitoring.ts
import { logger } from './logger';

export const monitorDeployment = () => {
  logger.info({
    deployment: {
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      timestamp: new Date().toISOString()
    }
  }, 'Application deployed');
};
```

### Error Tracking

Integrate with error tracking services:

```typescript
// lib/error-tracking.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm run test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-args: '--prod'
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Automated Testing

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm run test
      - run: pnpm run test:e2e
```

## 📈 Performance Optimization

### Caching Strategy

```env
# Cache TTL configuration
PRICE_CACHE_TTL=300        # 5 minutes
BALANCE_CACHE_TTL=30       # 30 seconds
DISTRIBUTION_CACHE_TTL=3600 # 1 hour
```

### CDN Configuration

Vercel automatically provides CDN, but you can optimize:

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js'],
          wallet: ['@hashgraph/hedera-wallet-connect']
        }
      }
    }
  }
});
```

### Image Optimization

```html
<!-- Use Vercel's image optimization -->
<img src="/api/image?w=300&url=/public/coffee.jpg" alt="Coffee" />
```

## 🔒 Backup & Recovery

### Database Backups

Turso provides automatic backups:
```bash
# List backups
turso db show chai-platform --backups

# Restore from backup
turso db restore chai-platform --from backup-name
```

### Manual Backups

```bash
# Export database
turso db export chai-platform > backup.sql

# Import database
turso db import chai-platform < backup.sql
```

### Disaster Recovery

1. Maintain multiple environment variables files
2. Regular database exports
3. Document recovery procedures
4. Test recovery processes regularly

## 🆘 Troubleshooting

### Common Deployment Issues

#### Build Failures
- Check dependency versions
- Verify Node.js version compatibility
- Ensure all environment variables are set

#### Database Connection Errors
- Verify Turso credentials
- Check network connectivity
- Ensure database is not paused

#### Wallet Integration Issues
- Confirm WalletConnect Project ID
- Check Hedera network configuration
- Verify contract addresses

### Monitoring Commands

```bash
# Check Vercel deployment logs
vercel logs your-domain.com

# Monitor Turso database
turso db metrics chai-platform

# Check API health
curl https://your-api-endpoint.com/health
```

### Rollback Procedures

```bash
# Rollback Vercel deployment
vercel rollback

# Restore Turso database
turso db restore chai-platform --from previous-backup
```

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Turso Documentation](https://docs.turso.tech)
- [Hedera Deployment Guide](https://docs.hedera.com/hedera/sdks-and-apis/sdks)
- [WalletConnect Documentation](https://docs.walletconnect.com)

## 📞 Support

For deployment issues:
1. Check Vercel deployment logs
2. Review Turso database status
3. Verify environment variables
4. Contact platform maintainers