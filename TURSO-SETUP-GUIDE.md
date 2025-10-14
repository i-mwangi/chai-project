# Turso Database Setup Guide

## Why Turso?
- ✅ **FREE forever** for hobby projects
- ✅ **SQLite-based** (minimal migration needed)
- ✅ **Already installed** (`@libsql/client` in package.json)
- ✅ **9 GB storage** on free tier
- ✅ **No credit card required**

## Step 1: Install Turso CLI

### Windows (PowerShell):
```powershell
irm get.turso.tech/install.ps1 | iex
```

### Alternative (if above fails):
```powershell
# Download and install manually
curl -sSfL https://get.turso.tech/install.ps1 | powershell
```

## Step 2: Sign Up & Login

```bash
# Sign up (opens browser)
turso auth signup

# Or login if you already have an account
turso auth login
```

## Step 3: Create Your Database

```bash
# Create a new database called "chai-platform"
turso db create chai-platform

# Get the database URL
turso db show chai-platform --url

# Create an auth token
turso db tokens create chai-platform
```

**Save these values!** You'll need them for environment variables.

## Step 4: Update Your .env File

Add these to your `.env`:

```env
# Turso Database Configuration
TURSO_DATABASE_URL=libsql://chai-platform-[your-username].turso.io
TURSO_AUTH_TOKEN=your-auth-token-here

# Update DATABASE_URL to use Turso
DATABASE_URL=${TURSO_DATABASE_URL}
```

## Step 5: Update Database Connection

Your project already has the right setup! Just verify `db/index.ts` or wherever you initialize the database uses the Turso client.

### Check your database initialization file:

```typescript
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN
})

export const db = drizzle(client)
```

## Step 6: Run Migrations

```bash
# Generate migrations (if needed)
pnpm run generate

# Run migrations to Turso
pnpm run migrate
```

## Step 7: Verify Connection

```bash
# Test the connection
turso db shell chai-platform

# Inside the shell, check tables:
.tables

# Exit
.quit
```

## Step 8: Configure Vercel Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add:
- `TURSO_DATABASE_URL` = `libsql://chai-platform-[your-username].turso.io`
- `TURSO_AUTH_TOKEN` = `your-auth-token-here`
- `DATABASE_URL` = `${TURSO_DATABASE_URL}` (or same as TURSO_DATABASE_URL)

## Turso CLI Cheat Sheet

```bash
# List all databases
turso db list

# Show database info
turso db show chai-platform

# Get database URL
turso db show chai-platform --url

# Create auth token
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

## Turso Free Tier Limits

- ✅ **500 databases**
- ✅ **9 GB total storage**
- ✅ **1 billion row reads/month**
- ✅ **25 million row writes/month**
- ✅ **3 locations** (edge replication)
- ✅ **Unlimited API tokens**

**This is MORE than enough for your coffee platform!**

## Troubleshooting

### "turso: command not found"
- Restart your terminal after installation
- Or add to PATH manually

### Connection Errors
- Verify `TURSO_AUTH_TOKEN` is set correctly
- Check `TURSO_DATABASE_URL` format
- Ensure token hasn't expired

### Migration Errors
- Make sure you're using `@libsql/client` not `better-sqlite3`
- Check Drizzle config uses `libsql` driver

## Benefits Over Other Options

| Feature | Turso | Supabase | Vercel Postgres |
|---------|-------|----------|-----------------|
| Free Storage | 9 GB | 500 MB | 256 MB |
| Credit Card | ❌ No | ❌ No | ✅ Yes |
| Inactivity Pause | ❌ Never | ✅ 7 days | ✅ 5 days |
| SQLite Compatible | ✅ Yes | ❌ No | ❌ No |
| Edge Deployment | ✅ Yes | ⚠️ Limited | ⚠️ Limited |
| Migration Effort | 🟢 Minimal | 🟡 Medium | 🟡 Medium |

## Next Steps

1. ✅ Install Turso CLI
2. ✅ Create database
3. ✅ Get URL and token
4. ✅ Update `.env` file
5. ✅ Run migrations
6. ✅ Test locally
7. ✅ Add to Vercel environment variables
8. ✅ Deploy!

Your database is now production-ready! 🚀
