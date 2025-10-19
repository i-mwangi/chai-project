# Database Documentation

This document provides comprehensive information about the database architecture, schema, and deployment options for the Chai Platform.

## 📋 Overview

The Chai Platform uses a flexible database architecture that supports both local development (SQLite) and production deployment (Turso - LibSQL). This approach allows developers to work locally with minimal setup while providing a scalable solution for production.

## 🏗️ Architecture

The database layer uses Drizzle ORM for database operations and supports multiple backends:

```
Application Layer
├── Drizzle ORM
├── Database Schema (TypeScript)
└── Migration System

Storage Layer
├── Local Development: SQLite
└── Production: Turso (LibSQL)
```

## 🗄️ Database Schema

The database schema is defined in `db/schema/index.ts` and includes tables for all platform functionality.

### Core Tables

#### Coffee Groves
```typescript
export const coffeeGroves = sqliteTable("coffee_groves", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    groveName: text("grove_name").unique().notNull(),
    farmerAddress: text("farmer_address").notNull(),
    tokenAddress: text("token_address").unique(),
    location: text("location").notNull(),
    treeCount: integer("tree_count").notNull(),
    coffeeVariety: text("coffee_variety").notNull(),
    // ... additional fields
})
```

#### Harvest Records
```typescript
export const harvestRecords = sqliteTable("harvest_records", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    groveId: integer("grove_id").notNull().references(() => coffeeGroves.id),
    harvestDate: integer("harvest_date").notNull(),
    yieldKg: integer("yield_kg").notNull(),
    // ... additional fields
})
```

#### Token Holdings
```typescript
export const tokenHoldings = sqliteTable("token_holdings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    holderAddress: text("holder_address").notNull(),
    groveId: integer("grove_id").notNull().references(() => coffeeGroves.id),
    tokenAmount: integer("token_amount").notNull(),
    // ... additional fields
})
```

#### Farmer Verifications
```typescript
export const farmerVerifications = sqliteTable("farmer_verifications", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    farmerAddress: text("farmer_address").unique().notNull(),
    verificationStatus: text("verification_status").default("pending"),
    // ... additional fields
})
```

#### Investor Verifications
```typescript
export const investorVerifications = sqliteTable("investor_verifications", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    investorAddress: text("investor_address").unique().notNull(),
    verificationStatus: text("verification_status").default("unverified"),
    // ... additional fields
})
```

### Additional Tables

The schema includes tables for:
- Transaction history
- Price tracking
- Environmental monitoring
- User settings
- Revenue distributions
- Market alerts
- Maintenance activities

## 🛠️ Database Configuration

### Local Development (SQLite)

For local development, the platform uses SQLite with the following configuration:

```env
DATABASE_URL=file:./local-store/sqlite/sqlite.db
```

Initialize the local database:
```bash
pnpm run init-db
pnpm run migrate
```

### Production (Turso - LibSQL)

For production deployment, the platform uses Turso, an edge database based on SQLite:

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

## 🔧 Database Operations

### Migrations

The platform uses Drizzle Kit for database migrations:

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

### Schema Updates

To update the database schema:

1. Modify `db/schema/index.ts`
2. Generate migration:
   ```bash
   pnpm run generate
   ```
3. Review generated migration file in `db/migrations/`
4. Run migration:
   ```bash
   pnpm run migrate
   ```

### Database Studio

Drizzle provides a web-based studio for database inspection:

```bash
pnpm run studio
```

## ☁️ Turso Deployment

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

### Migration to Turso

To migrate existing local data to Turso:

```bash
tsx migrate-to-turso.ts
```

### Database Management

```bash
# List all databases
turso db list

# Show database info
turso db show chai-platform

# Get database URL
turso db show chai-platform --url

# Create new token
turso db tokens create chai-platform

# List tokens
turso db tokens list chai-platform

# Revoke a token
turso db tokens revoke chai-platform [token-name]

# Open database shell
turso db shell chai-platform

# Delete database (careful!)
turso db destroy chai-platform
```

## 📊 Data Models

### Coffee Grove
Represents a registered coffee grove with metadata about location, tree count, and variety.

### Harvest Record
Tracks harvest data including yield, quality grade, and revenue information.

### Token Holding
Represents investor ownership of coffee tree tokens.

### Farmer Verification
Tracks the verification status of farmers on the platform.

### Investor Verification
Manages investor KYC/AML verification process.

### Transaction History
Records all financial transactions on the platform.

### Environmental Data
Stores IoT sensor data for tree health monitoring.

## 🔒 Security

### Data Encryption
- Database encryption at rest
- TLS encryption for all communications
- Secure storage of sensitive data

### Access Control
- Role-based access control
- Proper indexing for performance
- Regular security audits

### Backup and Recovery
- Automated backups for Turso databases
- Point-in-time recovery
- Data export/import capabilities

## 📈 Performance

### Indexing
The schema includes appropriate indexes for common query patterns:

```typescript
(farmerAddressIdx: index("coffee_groves_farmer_address_idx").on(table.farmerAddress))
```

### Query Optimization
- Use of Drizzle ORM for efficient queries
- Proper relationship definitions
- Caching strategies for frequently accessed data

## 🧪 Testing

### Test Database
For testing, you can use an in-memory database by setting:

```env
DISABLE_INVESTOR_KYC=true
```

### Seed Data
```bash
# Seed database with sample data
pnpm run seed
```

## 🔄 Data Migration

### Local to Production
The platform includes utilities to migrate data from local SQLite to Turso:

```bash
tsx migrate-to-turso.ts
```

### Schema Evolution
The migration system supports:
- Adding new columns
- Modifying existing columns
- Creating new tables
- Dropping tables (with caution)

## 📚 Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Turso Documentation](https://docs.turso.tech/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)

## 🆘 Troubleshooting

### Common Issues

#### Migration Failures
- Check that all migrations are properly formatted
- Ensure database is accessible
- Verify environment variables are correct

#### Connection Issues
- Verify database URL format
- Check network connectivity
- Ensure authentication tokens are valid

#### Performance Problems
- Review query patterns
- Check index usage
- Optimize frequently accessed queries

### Getting Help

- Check existing [GitHub Issues](https://github.com/your-username/chai-platform/issues)
- Review Drizzle ORM documentation
- Contact the development team