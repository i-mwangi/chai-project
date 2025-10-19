# API Documentation

This document provides comprehensive information about the API architecture, endpoints, and integration patterns used in the Chai Platform.

## 📋 Overview

The Chai Platform API is a Node.js/TypeScript application that serves as the backend for the frontend (BFF) pattern. It provides RESTful endpoints for all platform functionality, integrates with smart contracts, and manages database operations.

## 🏗️ Architecture

```
API Layer
├── Server (api/server.ts)
├── Routes (api/*.ts)
├── Services (lib/*.ts)
├── Database (db/index.ts)
├── Smart Contracts (abi/*.json)
└── External Providers (providers/*.ts)

Integration Points
├── Hedera Smart Contracts
├── Database (SQLite/Turso)
├── External Price Providers
├── IoT Sensor Data
└── Verification Services
```

## 🚀 Getting Started

### Starting the API Server

```bash
# Start API server
pnpm run api

# Start with mock data (for frontend development)
pnpm run api:mock

# Start with full integration
pnpm run dev:full
```

### API Configuration

The API is configured through environment variables in `.env`:

```env
API_PORT=3001
DATABASE_URL=file:./local-store/sqlite/sqlite.db
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.12345
```

## 📡 Endpoints

### Authentication & Wallet

```
POST /api/wallet/connect
POST /api/wallet/disconnect
GET /api/wallet/status
```

### Coffee Groves

```
GET /api/groves
POST /api/groves
GET /api/groves/:id
PUT /api/groves/:id
DELETE /api/groves/:id
GET /api/groves/:id/harvests
POST /api/groves/:id/harvests
```

### Harvest Records

```
GET /api/harvests
POST /api/harvests
GET /api/harvests/:id
PUT /api/harvests/:id
DELETE /api/harvests/:id
POST /api/harvests/:id/distribute
```

### Token Holdings

```
GET /api/holdings
POST /api/holdings
GET /api/holdings/:id
GET /api/holdings/account/:accountId
```

### Market Data

```
GET /api/prices
GET /api/prices/latest
GET /api/prices/history
POST /api/prices/update
```

### User Management

```
GET /api/users/profile
PUT /api/users/profile
GET /api/users/verification
POST /api/users/verification
```

### Admin Functions

```
GET /api/admin/stats
POST /api/admin/verify-farmer
POST /api/admin/verify-investor
GET /api/admin/pending-verifications
```

## 🛠️ Implementation Details

### Server Setup

```typescript
// api/server.ts
import express from 'express';
import { createServer } from 'http';
import { json } from 'body-parser';

const app = express();
const server = createServer(app);

// Middleware
app.use(json());
app.use(cors());
app.use(rateLimit());

// Routes
import groveRoutes from './grove-routes';
import harvestRoutes from './harvest-routes';
import marketRoutes from './market-routes';

app.use('/api/groves', groveRoutes);
app.use('/api/harvests', harvestRoutes);
app.use('/api/market', marketRoutes);

// Error handling
app.use(errorHandler);

server.listen(process.env.API_PORT || 3001);
```

### Route Implementation

```typescript
// api/grove-routes.ts
import { Router } from 'express';
import { GroveService } from '../lib/grove-service';

const router = Router();
const groveService = new GroveService();

// Get all groves
router.get('/', async (req, res) => {
  try {
    const groves = await groveService.getAllGroves();
    res.json(groves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new grove
router.post('/', async (req, res) => {
  try {
    const grove = await groveService.createGrove(req.body);
    res.status(201).json(grove);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
```

### Service Layer

```typescript
// lib/grove-service.ts
import { db } from '../db';
import { coffeeGroves } from '../db/schema';

export class GroveService {
  async getAllGroves() {
    return await db.select().from(coffeeGroves);
  }
  
  async createGrove(data: any) {
    const [grove] = await db.insert(coffeeGroves).values(data).returning();
    return grove;
  }
  
  async getGroveById(id: number) {
    const [grove] = await db.select().from(coffeeGroves).where(eq(coffeeGroves.id, id));
    return grove;
  }
}
```

## 🔌 Smart Contract Integration

### Contract Interaction Service

```typescript
// lib/contract-service.ts
import { Contract } from 'ethers';
import { issuerAbi } from '../abi/Issuer';

export class ContractService {
  private issuerContract: Contract;
  
  constructor() {
    this.issuerContract = new Contract(
      process.env.ISSUER_CONTRACT_ID,
      issuerAbi,
      this.getSigner()
    );
  }
  
  async registerGrove(groveData: any) {
    const tx = await this.issuerContract.registerCoffeeGrove(
      groveData.name,
      groveData.location,
      groveData.treeCount,
      groveData.variety,
      groveData.expectedYield
    );
    
    return await tx.wait();
  }
  
  async tokenizeGrove(groveName: string, tokenData: any) {
    const tx = await this.issuerContract.tokenizeGrove(
      groveName,
      tokenData.totalTokens,
      tokenData.tokensPerTree
    );
    
    return await tx.wait();
  }
}
```

### Event Processing

```typescript
// events/issuer.indexer.ts
import { Contract } from 'ethers';

export class IssuerEventIndexer {
  private contract: Contract;
  
  constructor(contractAddress: string, abi: any) {
    this.contract = new Contract(contractAddress, abi, provider);
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    this.contract.on('CoffeeGroveRegistered', async (groveName, farmer, treeCount) => {
      // Index the event in database
      await this.indexGroveRegistration(groveName, farmer, treeCount);
    });
    
    this.contract.on('RevenueDistributed', async (groveName, totalRevenue) => {
      // Update revenue distribution records
      await this.indexRevenueDistribution(groveName, totalRevenue);
    });
  }
}
```

## 🗄️ Database Integration

### Query Builder Pattern

```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { coffeeGroves, harvestRecords } from './schema';

export const db = drizzle(sqlite);

// Example query with relationships
export async function getGroveWithHarvests(groveId: number) {
  const grove = await db.query.coffeeGroves.findFirst({
    where: eq(coffeeGroves.id, groveId),
    with: {
      harvests: true
    }
  });
  
  return grove;
}
```

### Migration Support

```typescript
// db/migrate.ts
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';

export async function runMigrations() {
  await migrate(db, { migrationsFolder: './db/migrations' });
}
```

## 🌐 External Services

### Price Provider

```typescript
// providers/price-provider.ts
import axios from 'axios';

export class CoffeePriceProvider {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = 'https://api.coffee-prices.com';
  }
  
  async getCurrentPrice(variety: string, grade: string) {
    const response = await axios.get(`${this.baseUrl}/prices`, {
      params: { variety, grade }
    });
    
    return response.data;
  }
  
  async getHistoricalPrices(variety: string, days: number) {
    const response = await axios.get(`${this.baseUrl}/history`, {
      params: { variety, days }
    });
    
    return response.data;
  }
}
```

### Verification Service

```typescript
// providers/verification-service.ts
export class VerificationService {
  async verifyFarmer(documentHash: string, farmerData: any) {
    // Implement verification logic
    // This could integrate with external KYC services
    return {
      verified: true,
      verificationId: 'verification-123',
      timestamp: Date.now()
    };
  }
  
  async verifyInvestor(investorData: any) {
    // Implement investor verification
    return {
      verified: true,
      accreditation: 'accredited',
      verificationId: 'investor-456'
    };
  }
}
```

## 🔒 Security

### Authentication Middleware

```typescript
// api/middleware/auth.ts
import { verifySignature } from '../lib/wallet-utils';

export const authenticate = async (req, res, next) => {
  const { signature, accountId, timestamp } = req.headers;
  
  if (!signature || !accountId || !timestamp) {
    return res.status(401).json({ error: 'Missing authentication headers' });
  }
  
  try {
    const isValid = await verifySignature(signature, accountId, timestamp);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    req.accountId = accountId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
```

### Rate Limiting

```typescript
// api/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
```

### Input Validation

```typescript
// api/validation/grove-schema.ts
import { z } from 'zod';

export const groveSchema = z.object({
  groveName: z.string().min(3).max(100),
  farmerAddress: z.string().regex(/^0\.0\.\d+$/),
  location: z.string().min(5).max(200),
  treeCount: z.number().min(1).max(100000),
  coffeeVariety: z.string().min(3).max(50),
  expectedYieldPerTree: z.number().min(0).max(100)
});

export type GroveData = z.infer<typeof groveSchema>;
```

## 📊 Monitoring & Logging

### Structured Logging

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty'
  }
});

// Usage
logger.info({ accountId: '0.0.12345' }, 'User connected wallet');
logger.error({ error: error.message }, 'Failed to register grove');
```

### Health Checks

```typescript
// api/health.ts
export const healthCheck = async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    contracts: await checkContracts(),
    api: 'ok'
  };
  
  const isHealthy = Object.values(checks).every(check => check === 'ok');
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  });
};
```

## 🧪 Testing

### API Tests

```typescript
// tests/api/grove-api.spec.ts
import { describe, it, expect } from 'vitest';
import { app } from '../../api/server';
import supertest from 'supertest';

const request = supertest(app);

describe('Grove API', () => {
  it('should create a new grove', async () => {
    const groveData = {
      groveName: 'Test Grove',
      farmerAddress: '0.0.12345',
      location: 'Test Location',
      treeCount: 100,
      coffeeVariety: 'Arabica',
      expectedYieldPerTree: 5
    };
    
    const response = await request
      .post('/api/groves')
      .send(groveData)
      .expect(201);
    
    expect(response.body.groveName).toBe('Test Grove');
    expect(response.body.id).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// tests/integration/grove-workflow.spec.ts
describe('Grove Registration Workflow', () => {
  it('should register grove, tokenize it, and report harvest', async () => {
    // 1. Register grove
    const grove = await groveService.registerGrove(groveData);
    
    // 2. Tokenize grove
    const tokenization = await contractService.tokenizeGrove(grove.name, tokenData);
    
    // 3. Report harvest
    const harvest = await harvestService.reportHarvest(grove.id, harvestData);
    
    // 4. Verify all steps completed
    expect(grove).toBeDefined();
    expect(tokenization).toBeDefined();
    expect(harvest).toBeDefined();
  });
});
```

## 🚀 Deployment

### Environment Configuration

```env
# Production environment
NODE_ENV=production
API_PORT=8080
HEDERA_NETWORK=mainnet
LOG_LEVEL=warn
RATE_LIMIT_STANDARD=50
```

### Docker Support

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

EXPOSE 8080

CMD ["pnpm", "run", "api"]
```

### Load Balancing

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8080"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/chai
    depends_on:
      - db
  
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=chai
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
```

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Hedera SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis/sdks)
- [REST API Design Best Practices](https://restfulapi.net/)

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify DATABASE_URL format
- Check database credentials
- Ensure database service is running

#### Smart Contract Interaction Failures
- Verify contract addresses in environment variables
- Check Hedera network configuration
- Ensure operator account has sufficient HBAR

#### Authentication Problems
- Verify wallet signature format
- Check timestamp validity
- Ensure account ID format is correct

### Debugging Tools

```bash
# Enable debug logging
DEBUG=* pnpm run api

# Monitor API requests
pnpm run api --log-level debug

# Profile performance
pnpm run api --profile
```

### Health Monitoring

```bash
# Check API health
curl http://localhost:3001/health

# Monitor logs
tail -f logs/api.log

# Check resource usage
pm2 monit
```

## 🔜 Future Enhancements

### Planned Improvements

1. **GraphQL API** - Add GraphQL endpoint for flexible data querying
2. **WebSocket Support** - Real-time updates for price changes and events
3. **Caching Layer** - Redis caching for frequently accessed data
4. **Microservices** - Split into smaller, focused services
5. **API Versioning** - Support for multiple API versions