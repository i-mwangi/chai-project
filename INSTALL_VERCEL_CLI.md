# Install Vercel CLI - Quick Guide

## 🚀 Install Vercel CLI

You need to install Vercel CLI first before deploying.

### Option 1: Using npm (Recommended)

```bash
npm install -g vercel
```

### Option 2: Using pnpm

```bash
pnpm add -g vercel
```

### Option 3: Using yarn

```bash
yarn global add vercel
```

---

## ✅ Verify Installation

After installing, verify it works:

```bash
vercel --version
```

Should show something like:
```
Vercel CLI 33.0.0
```

---

## 🔐 Login to Vercel

```bash
vercel login
```

This will:
1. Open your browser
2. Ask you to login/signup to Vercel
3. Authenticate your CLI

---

## 🚀 Deploy Your Project

After installation and login:

```bash
# Navigate to your project (if not already there)
cd C:\Users\Administrator\Music\chai-project

# Deploy to production
vercel --prod
```

---

## 🐛 Troubleshooting

### Issue: "npm not found"

Install Node.js first:
- Download from: https://nodejs.org/
- Install LTS version
- Restart PowerShell

### Issue: "Permission denied"

Run PowerShell as Administrator:
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Run install command again

### Issue: Command still not found after install

Restart PowerShell:
1. Close PowerShell
2. Open new PowerShell window
3. Try `vercel --version` again

---

## 📝 Complete Steps

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Verify installation
vercel --version

# 3. Login
vercel login

# 4. Deploy
vercel --prod
```

That's it! 🎉
