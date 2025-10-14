# 🚀 Chai Coffee Platform - Startup Guide

## Quick Start Commands

### Option 1: Full Demo (Recommended for Testing)
```bash
# Windows
start-demo.bat

# Or manually:
node frontend/api-server.js    # Port 3001 (Mock API)
node frontend/server.js         # Port 3000 (Frontend)
```

### Option 2: Full Stack with Real Backend
```bash
# Windows - Restart all servers
restart-all-servers.bat

# Or manually:
tsx api/server.ts              # Port 3001 (Real API)
node frontend/api-server.js    # Port 3002 (Frontend Mock)
```

### Option 3: Using NPM Scripts
```bash
# Development mode (Mock API + Frontend)
npm run dev
# or
pnpm run dev

# Full development (Real API + Frontend + Providers)
npm run dev:full
# or
pnpm run dev:full
```

---

## 📋 Detailed Startup Options

### 1. **Demo Mode** (Simplest - No Database Required)
Best for: Quick testing, UI development, demos

```bash
# Start both servers
start-demo.bat

# Or start individually:
# Terminal 1 - Mock API
node frontend/api-server.js

# Terminal 2 - Frontend
node frontend/server.js
```

**Access:**
- Frontend: http://localhost:3000
- Mock API: http://localhost:3001/health

---

### 2. **Development Mode** (Mock API)
Best for: Frontend development without blockchain

```bash
# Using npm scripts
npm run dev

# Or manually:
# Terminal 1 - Mock API
npm run api:mock

# Terminal 2 - Frontend
npm run frontend
```

**Ports:**
- Frontend: http://localhost:3000
- Mock API: http://localhost:3001

---

### 3. **Full Stack Mode** (Real Backend)
Best for: Full integration testing, blockchain features

```bash
# Quick restart (Windows)
restart-all-servers.bat

# Or using npm
npm run dev:full

# Or manually:
# Terminal 1 - Real API Server
tsx api/server.ts
# or
npm run api

# Terminal 2 - Frontend Mock Server
node frontend/api-server.js

# Terminal 3 (Optional) - Providers
npm run providers
```

**Ports:**
- Real API: http://localhost:3001
- Frontend Mock: http://localhost:3002
- Frontend UI: http://localhost:3000

---

## 🔧 Individual Component Commands

### Backend API Server
```bash
# Real API with TypeScript
tsx api/server.ts
# or
npm run api

# Mock API (JavaScript)
node frontend/api-server.js
# or
npm run api:mock
```

### Frontend Server
```bash
node frontend/server.js
# or
npm run frontend
```

### Blockchain Providers
```bash
# All providers
npm run providers

# Individual providers
npm run price:provider
npm run timeseries:provider
```

### Event Indexers
```bash
# All indexers
npm run index

# Individual indexers
npm run issuer
npm run lender
```

---

## 🛠️ Utility Commands

### Restart Servers (Windows)
```bash
# Restart everything
restart-all-servers.bat

# Restart only API
restart-api-server.bat

# Restart only frontend
restart-frontend-server.bat
```

### Database Management
```bash
# Initialize database
npm run init-db

# View database
npm run print-db

# Database studio (GUI)
npm run studio

# Run migrations
npm run migration:run

# Rollback migration
npm run migration:rollback

# Show migration status
npm run migration:show
```

### Build & Test
```bash
# Build TypeScript
npm run build

# Run tests
npm run test

# E2E tests
npm run test:e2e
npm run test:e2e:integration
npm run test:e2e:comprehensive
```

---

## 📊 Port Reference

| Service | Port | Command |
|---------|------|---------|
| Frontend UI | 3000 | `node frontend/server.js` |
| Real API | 3001 | `tsx api/server.ts` |
| Mock API | 3001 | `node frontend/api-server.js` |
| Frontend Mock | 3002 | `node frontend/api-server.js` |
| Drizzle Studio | 4983 | `npm run studio` |

---

## 🎯 Recommended Workflows

### For Frontend Development
```bash
# Use mock API for faster iteration
npm run dev
```
- No database setup needed
- Fast restarts
- Mock data available

### For Backend Development
```bash
# Terminal 1
tsx api/server.ts

# Terminal 2
node frontend/api-server.js
```
- Real database
- Real blockchain integration
- Full API testing

### For Full Integration Testing
```bash
# Use the restart script
restart-all-servers.bat
```
- All services running
- Real data flow
- Complete testing

---

## 🔍 Verify Servers Are Running

### Check Manually
```bash
# Check API health
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3000
```

### Using Check Script
```bash
npx tsx check-servers.ts
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows - Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or use the restart scripts which do this automatically
restart-all-servers.bat
```

### Database Issues
```bash
# Reinitialize database
npm run init-db

# Or clean and rebuild
npm run clean-db
```

### Module Not Found
```bash
# Reinstall dependencies
npm install
# or
pnpm install
```

### TypeScript Errors
```bash
# Rebuild
npm run build
```

---

## 📝 Environment Setup

### Required Environment Variables
Create a `.env` file in the root:

```env
# Hedera Testnet Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=your_account_id
HEDERA_OPERATOR_KEY=your_private_key

# Database
DATABASE_URL=file:./local-store/sqlite/sqlite.db

# API Configuration
API_PORT=3001
FRONTEND_PORT=3000
```

---

## 🎉 After Starting

Once servers are running:

1. **Open Frontend**: http://localhost:3000
2. **Connect Wallet**: Click "Connect Wallet" button
3. **Choose Role**:
   - **Farmer Portal**: Register groves, report harvests
   - **Investor Portal**: Browse groves, purchase tokens
   - **Admin Panel**: Manage platform (if admin)

---

## 💡 Tips

- Use `restart-all-servers.bat` for quick restarts during development
- Use `npm run dev` for frontend-only work
- Use `npm run studio` to inspect database visually
- Check `package.json` for all available scripts
- Mock API is faster but Real API has full blockchain features

---

## 📚 Related Documentation

- [HEDERA-QUICK-START.md](HEDERA-QUICK-START.md) - Hedera integration guide
- [INVESTOR-PORTFOLIO-FIX-SUMMARY.md](INVESTOR-PORTFOLIO-FIX-SUMMARY.md) - Recent fixes
- [WITHDRAWAL_QUICK_REFERENCE.md](WITHDRAWAL_QUICK_REFERENCE.md) - Withdrawal features
- [MARKET-PRICES-GUIDE.md](MARKET-PRICES-GUIDE.md) - Market pricing system
