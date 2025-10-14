# 🚀 Turso Setup - Quick Start Guide

## Why Turso?
- ✅ **100% FREE** for your project
- ✅ **9 GB storage** (way more than you need)
- ✅ **SQLite-based** (minimal changes needed)
- ✅ **No credit card** required
- ✅ **Works with Vercel** perfectly

---

## 📋 Step-by-Step Setup (5 minutes)

### 1️⃣ Install Turso CLI

**Open PowerShell as Administrator** and run:

```powershell
irm get.turso.tech/install.ps1 | iex
```

**Close and reopen your terminal** after installation.

Verify installation:
```bash
turso --version
```

---

### 2️⃣ Create Turso Account

```bash
turso auth signup
```

This opens your browser. Sign up with:
- GitHub (recommended)
- Google
- Or email

---

### 3️⃣ Create Your Database

```bash
# Create database
turso db create chai-platform

# You'll see output like:
# Created database chai-platform at ...
```

---

### 4️⃣ Get Database Credentials

```bash
# Get database URL
turso db show chai-platform --url

# Output: libsql://chai-platform-yourname.turso.io
# COPY THIS! ☝️
```

```bash
# Create auth token
turso db tokens create chai-platform

# Output: eyJhbGc... (long token)
# COPY THIS TOO! ☝️
```

---

### 5️⃣ Update Your .env File

Open `.env` and add these lines (replace with your actual values):

```env
# Turso Database (for production)
TURSO_DATABASE_URL=libsql://chai-platform-yourname.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...your-actual-token...
```

**Keep your local SQLite for development:**
```env
# Local SQLite (for development)
DATABASE_URL=file:./local-store/sqlite/sqlite.db
```

---

### 6️⃣ Run Migrations to Turso

```bash
# This creates tables in Turso
pnpm run migrate
```

---

### 7️⃣ (Optional) Copy Local Data to Turso

If you have local data you want to migrate:

```bash
tsx migrate-to-turso.ts
```

---

### 8️⃣ Test Turso Connection

```bash
# Open Turso shell
turso db shell chai-platform

# Inside the shell, check tables:
.tables

# Check data:
SELECT * FROM coffee_groves LIMIT 5;

# Exit:
.quit
```

---

### 9️⃣ Configure Vercel

In **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**:

Add these variables:

| Name | Value |
|------|-------|
| `TURSO_DATABASE_URL` | `libsql://chai-platform-yourname.turso.io` |
| `TURSO_AUTH_TOKEN` | `eyJhbGc...your-token...` |
| `DATABASE_URL` | Same as `TURSO_DATABASE_URL` |

**Important:** Add them to all environments (Production, Preview, Development)

---

### 🔟 Deploy to Vercel

```bash
vercel --prod
```

Or push to GitHub and Vercel will auto-deploy!

---

## 🎯 How It Works

Your app now automatically detects which database to use:

- **Local development**: Uses `./local-store/sqlite/sqlite.db`
- **Vercel/Production**: Uses Turso (when `TURSO_DATABASE_URL` is set)

No code changes needed! The `db/index.ts` file handles this automatically.

---

## 🛠️ Useful Turso Commands

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

---

## 🐛 Troubleshooting

### "turso: command not found"
- Restart your terminal
- Or run: `$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine")`

### "Failed to connect to Turso"
- Check `TURSO_DATABASE_URL` is correct
- Check `TURSO_AUTH_TOKEN` is set
- Verify token hasn't expired: `turso db tokens list chai-platform`

### "Table doesn't exist"
- Run migrations: `pnpm run migrate`
- Or create tables manually in Turso shell

### Vercel deployment fails
- Verify environment variables are set in Vercel
- Check build logs for errors
- Ensure `@libsql/client` is in `dependencies` (not `devDependencies`)

---

## 📊 Turso Free Tier Limits

Your project gets:
- ✅ **500 databases**
- ✅ **9 GB total storage**
- ✅ **1 billion row reads/month**
- ✅ **25 million row writes/month**
- ✅ **3 locations** (edge replication)

**This is MORE than enough for your coffee platform!**

---

## ✅ Checklist

- [ ] Installed Turso CLI
- [ ] Created Turso account
- [ ] Created `chai-platform` database
- [ ] Got database URL
- [ ] Got auth token
- [ ] Updated `.env` file
- [ ] Ran migrations
- [ ] Tested connection
- [ ] Added to Vercel environment variables
- [ ] Deployed to Vercel

---

## 🎉 You're Done!

Your database is now production-ready and will work seamlessly on Vercel!

**Local development**: Still uses SQLite
**Production**: Uses Turso automatically

No code changes needed! 🚀
